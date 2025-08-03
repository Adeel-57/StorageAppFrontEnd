import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import "./DirectoryView.css";
import "./userProfile.css";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const { dirId } = useParams();
  const navigate = useNavigate();

  // user data
  const [user, setUserData] = useState({});

  // Displayed directory name
  const [directoryName, setDirectoryName] = useState("My Drive");

  // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  // Modal states
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null); // "directory" or "file"
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Uploading states
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // adding items to upload queue
  const [pendingQueue, setPendingQueue] = useState([]); // remainning items to upload queue
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progressMap, setProgressMap] = useState({}); // track progress per item
  const [isUploading, setIsUploading] = useState(false); // indicates if an upload is in progress

  // Context menu
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  /**
   * Fetch user data
   */
  async function fetchUaerData() {
    const response = await fetch(`${BASE_URL}/user/`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (data.error) {
      if (response.status === 401) return navigate("/login");
    }
    setUserData(data);
  }
  useEffect(() => {
    fetchUaerData();
  }, []);

  /**
   * Fetch directory contents
   */
  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 401) return navigate("/login");
    const data = await response.json();

    // Set directory name
    if (data.name) {
      setDirectoryName(dirId ? data.name : "My Drive");
    } else {
      setDirectoryName("My Drive");
    }

    // Reverse the directories and files so new items are on top
    const reversedDirs = [...data.directories].reverse();
    const reversedFiles = [...data.files].reverse();
    setDirectoriesList(reversedDirs);
    setFilesList(reversedFiles);
  }
  /**
   * Files selection to upload
   */
  async function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    // Build a list of "temp" items
    const newItems = selectedFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return {
        file,
        name: file.name,
        id: tempId,
        isUploading: true,
      };
    });

    // Initialize progress=0 for each
    newItems.forEach((item) => {
      setProgressMap((prev) => ({ ...prev, [item.id]: 0 }));
      setUploadXhrMap((prev) => ({ ...prev, [item.id]: false }));
    });

    // Add them to the uploadQueue
    setUploadQueue((prev) => [...newItems, ...prev]);

    // Put them at the top of the existing list
    const newFiles = [...newItems].reverse();
    setFilesList((prev) => [...newFiles, ...prev]);

    // Clear file input so the same file can be chosen again if needed
    e.target.value = "";
  }
  /**
   * Upload items from queue one by one
   */
  useEffect(() => {
    let queue = [...pendingQueue, ...uploadQueue];
    if (!isUploading && queue.length !== 0) {
      setIsUploading(true);
      const [currentItem, ...restQueue] = queue;
      fileUloadHandle(currentItem);
      setPendingQueue(restQueue);
      setUploadQueue([]);
    }
    if (!isUploading && queue.length === 0) {
      getDirectoryItems();
    }
  }, [uploadQueue, isUploading, dirId]);
  // Start upload
  async function fileUloadHandle(currentItem) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("filename", currentItem.name);
    setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setProgressMap((prev) => ({ ...prev, [currentItem.id]: progress }));
      }
    });

    xhr.addEventListener("load", () => {
      setIsUploading(false);
    });
    xhr.send(currentItem.file);
  }
  /**
   * Cancel an in-progress upload
   */
  function handleCancelUpload(tempId) {
    const xhr = uploadXhrMap[tempId];
    if (xhr) {
      xhr.abort();
      setIsUploading(false);
    }
    // Remove it from queue if it’s still there
    setPendingQueue((prev) => prev.filter((item) => item.id !== tempId));

    // Remove from the filesList
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));

    // Remove from progressMap
    setProgressMap((prev) => {
      const { [tempId]: _, ...rest } = prev;
      return rest;
    });

    // Remove from Xhr map
    setUploadXhrMap((prev) => {
      const copy = { ...prev };
      delete copy[tempId];
      return copy;
    });
  }

  /**
   * Delete a file
   */
  async function handleDeleteFile(id) {
    setActiveContextMenu(null);
    await fetch(`${BASE_URL}/file/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    getDirectoryItems();
  }
  /**
   * Delete a directory
   */
  async function handleDeleteDirectory(id) {
    setActiveContextMenu(null);
    await fetch(`${BASE_URL}/directory/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    getDirectoryItems();
  }

  /**
   * Create a directory
   */
  async function handleCreateDirectory(e) {
    e.preventDefault();
    await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
      method: "POST",
      headers: {
        dirname: newDirname,
      },
      credentials: "include",
    });
    setNewDirname("New Folder");
    setShowCreateDirModal(false);
    getDirectoryItems();
  }

  /**
   * Rename a file/directory
   */
  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }
  async function handleRenameSubmit(e) {
    e.preventDefault();
    await fetch(`${BASE_URL}/${renameType}/${renameId}`, {
      method: "PATCH",
      headers: {
        filename: JSON.stringify({ newName: renameValue, id: renameId }),
      },
      credentials: "include",
    });
    setShowRenameModal(false);
    setRenameValue("");
    setRenameType(null);
    setRenameId(null);
    getDirectoryItems();
  }

  /**
   * Show and hide profile modal
   */
  const toggleProfileModal = () => {
    setProfileModalOpen(!isProfileModalOpen);
  };

  /**
   * Context Menu
   */
  function handleContextMenu(e, id) {
    e.stopPropagation();
    e.preventDefault();
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (activeContextMenu === id) {
      setActiveContextMenu(null);
    } else {
      setActiveContextMenu(id);
      setContextMenuPos({ x: clickX - 110, y: clickY });
    }
  }
  useEffect(() => {
    setActiveContextMenu(null);
  }, [dirId]);

  /**
   * User logout handle
   */
  async function handleLogout() {
    await fetch(`${BASE_URL}/user/logout`, {
      method: "POST",
      credentials: "include",
    });
    getDirectoryItems();
  }

  /**
   * Decide file icon
   */
  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "pdf";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "video";
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "archive";
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "code";
      default:
        return "alt";
    }
  }

  /**
   * Click row to open directory or file
   */
  function handleRowClick(type, id) {
    if (type === "directory") {
      navigate(`/directory/${id}`);
    } else {
      window.location.href = `${BASE_URL}/file/${id}`;
    }
  }

  // Combine directories & files into one list for rendering
  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  return (
    <div className="directory-view">
      <DirectoryHeader
        directoryName={directoryName}
        onCreateFolderClick={() => setShowCreateDirModal(true)}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        toggleProfileModal={toggleProfileModal}
        imgurl={user.imageURL}
      />

      {/* Create Profile Modal */}
      {isProfileModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            toggleProfileModal();
          }}
        >
          <div className="profile-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Profile</h2>
            <img
              src={`${user.imageURL}`}
              alt="image"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
            <button
              className="close-button"
              onClick={() => {
                toggleProfileModal();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Directory Modal */}
      {showCreateDirModal && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          setActiveContextMenu={setActiveContextMenu}
          onClose={() => setShowCreateDirModal(false)}
          onCreateDirectory={handleCreateDirectory}
        />
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          setActiveContextMenu={setActiveContextMenu}
          onClose={() => setShowRenameModal(false)}
          onRenameSubmit={handleRenameSubmit}
        />
      )}

      {/* If folder is empty */}
      {combinedItems.length === 0 ? (
        <p className="no-data-message">
          This folder is empty. Upload files or create a folder to see some
          data.
        </p>
      ) : (
        <DirectoryList
          items={combinedItems}
          handleRowClick={handleRowClick}
          activeContextMenu={activeContextMenu}
          contextMenuPos={contextMenuPos}
          handleContextMenu={handleContextMenu}
          getFileIcon={getFileIcon}
          isUploading={isUploading}
          progressMap={progressMap}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          openRenameModal={openRenameModal}
          BASE_URL={BASE_URL}
        />
      )}
    </div>
  );
}

export default DirectoryView;
