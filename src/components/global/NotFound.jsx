import React from "react";
import { Link } from "react-router-dom";
import image from "/error.png";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <img
        src={image || "https://via.placeholder.com/200"}
        alt="Not Found"
        className="w-44 mt-4"
      />
      <p className="mt-4 text-xl text-gray-600">Page Not Found</p>
      <p className="mt-2 text-gray-500">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 text-white bg-gray-900 rounded-lg hover:bg-gray-800"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
