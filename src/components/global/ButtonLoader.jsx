import React from "react";

const ButtonLoader = () => {
  return (
    <>
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.292A7.957 7.957 0 014 12H2c0 2.688 1.067 5.119 2.808 6.919l1.192-1.627z"
        ></path>
      </svg>
    </>
  );
};

export default ButtonLoader;
