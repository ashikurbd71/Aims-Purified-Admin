import React from "react";
import img from "/education.gif";

const Loading = () => {
  return (
    <div
      className="flex flex-col
     items-center justify-center min-h-screen"
    >
      <div className="">
        <img src={img || "https://via.placeholder.com/150"} alt="Loading..." className="w-44" />
      </div>
    </div>
  );
};

export default Loading;
