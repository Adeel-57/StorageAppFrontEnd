import React from "react";

const ProfileImg = ({ profileImg, inptRef }) => {
  return (
    <>
      <label htmlFor="profileIm" className="label">
        Profile Image
      </label>
      {profileImg && (
        <div>
          <img
            src={URL.createObjectURL(profileImg)}
            alt="Preview"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
            onClick={() => {
              inptRef.current.click();
            }}
          />
        </div>
      )}
    </>
  );
};

export default React.memo(ProfileImg);
