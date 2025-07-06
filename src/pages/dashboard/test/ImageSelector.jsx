import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const ImageSelector = () => {
  const [image, setImage] = useState(null); // Store selected image
  const [error, setError] = useState(""); // Store validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state

  // Handle image selection
  const handleImageChange = (e) => {
    setError("");
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setImage(selectedFile);
    } else {
      setError("Please select a valid image file.");
    }
  };

  // Upload image function
  const uploadImage = async (files) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    ("Files to upload:", files);

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      ("Uploading formData...");
      const response = await axios.post(
        "https://cdn.englishhealer.com/v1/upload/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (
        (response?.status === 200 || response?.status === 201) &&
        response?.data
      ) {
        toast.success("Image uploaded successfully!");
        ("Uploaded Images Data:", response.data);
        return response.data; // Return the uploaded images' response
      } else {
        toast.error("Image upload failed: Invalid response");
        return null;
      }
    } catch (error) {
      console.error("Upload failed:", error.message || error);
      toast.error(
        "Image upload failed: " +
        (error.response?.data?.message || "Unknown error")
      );
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("No image selected.");
      return;
    }

    setIsSubmitting(true);
    const result = await uploadImage(image);
    if (result) {
      ("Uploaded Images Response:", result);
      setImage(null); // Reset image after submission
    }
    setIsSubmitting(false);
  };

  return (
    <div className="image-form p-4 max-w-md mx-auto border rounded shadow-lg">
      <h2 className="text-lg font-bold mb-4">Upload an Image</h2>
      <form onSubmit={handleSubmit}>
        {/* Image Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select an Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full p-2 border rounded"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Preview Selected Image */}
        {image && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Selected Image Preview:</h3>
            <img
              src={URL.createObjectURL(image)}
              alt="Selected"
              className="w-full h-40 object-cover rounded border"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-2 rounded text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
        >
          {isSubmitting ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ImageSelector;
