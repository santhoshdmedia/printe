import { Tag } from "antd";
import React from "react";
import { useDispatch } from "react-redux";

const UploadFileButton = ({ className = "", handleUploadImage = (fileString = "") => {}, buttonText = "Upload File" }) => {
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch({
        type: "UPLOAD_IMAGE",
        data: { file, handleUploadImage },
      });
    }
  };

  return (
    <div className={`flex items-center`}>
      <input
        type="file"
        name="image"
        id="file-input"
        accept="image/png, image/tiff, image/jpeg, image/jpg, 
    image/vnd.adobe.photoshop, application/postscript, 
    application/pdf, image/svg+xml, 
    application/vnd.corel-draw, application/msword, 
    application/vnd.openxmlformats-officedocument.wordprocessingml.document, 
    application/vnd.ms-powerpoint, 
    application/vnd.openxmlformats-officedocument.presentationml.presentation, 
    application/zip"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <label htmlFor="file-input" className="!w-full">
        <Tag color="green" className="center_div !cursor-pointer !h-[50px] !text-[14px] !w-full gap-x-4">
          {buttonText}
        </Tag>
      </label>
    </div>
  );
};

export default UploadFileButton;
