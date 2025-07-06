import React, { useState } from "react";
import axios from "axios";

const MultipleImageUploader = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]); // To store metadata responses

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      alert("Please select images to upload.");
      return;
    }

    try {
      const uploadedData = await Promise.all(
        selectedImages.map(async (image) => {
          const formData = new FormData();
          formData.append("images", image);

          // Replace with your actual API upload endpoint
          const response = await axios.post(
            `http://localhost:8001/images/upload`,
            formData
          );

          // Use the uploaded filename to fetch metadata from the backend
          const { filename } = response.data; // Assuming the backend returns the filename
          const metadataResponse = await axios.get(
            `http://localhost:8001/images/${filename}`
          );

          return metadataResponse.data; // Return metadata
        })
      );

      setUploadedImages(uploadedData); // Store the metadata responses
      setSelectedImages([]); // Reset the selected images
      alert("All images uploaded and fetched successfully!");
    } catch (error) {
      console.error("Failed to upload and fetch images:", error);
      alert("Image upload failed. Please try again.");
    }
  };

  return (
    <div>
      <h1>Upload Images</h1>

      {/* Image Input */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setSelectedImages(Array.from(e.target.files))}
      />

      {/* Upload Button */}
      <button onClick={handleUpload}>Upload Images</button>

      {/* Display Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <h3>Uploaded Images:</h3>
          {uploadedImages.map((image, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <img
                src={image.path}
                alt={`Uploaded ${index}`}
                width="200"
                style={{ margin: "10px" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultipleImageUploader;
