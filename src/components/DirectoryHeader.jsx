import { FaFolderPlus, FaUpload } from "react-icons/fa";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  fileInputRef,
  handleFileSelect,
  toggleProfileModal,
  imgurl
}) {
  return (
    <header className="directory-header">
      <h1>{directoryName}</h1>
      <div className="header-links">
        {/* Create Folder (icon button) */}
        <button
          className="icon-button"
          title="Create Folder"
          onClick={onCreateFolderClick}
        >
          <FaFolderPlus />
        </button>

        {/* Upload Files (icon button) - multiple files */}
        <button
          className="icon-button"
          title="Upload Files"
          onClick={() => fileInputRef.current.click()}
        >
          <FaUpload />
        </button>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          multiple // Allows multiple file selection
          onChange={handleFileSelect}
        />
        <img className="profile-button" src={imgurl} onClick={() => { toggleProfileModal() }} style={{ width: "20px", height: "20px", borderRadius: "8px", cursor: "pointer", objectFit: "cover" }} />
      </div>
    </header>
  );
}

export default DirectoryHeader;
