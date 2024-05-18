'use client';
import React, { useContext, useEffect } from 'react';
import { LoadingOverlayContext } from '@/app/shared/LoadingOverlayContext';

const LoadingOverlay: React.FC = () => {
  var { isLoading } = useContext(LoadingOverlayContext);
  useEffect(() => {
    console.log('isLoading', isLoading);
  }, [isLoading]);
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center transition-opacity duration-300 ${
        isLoading
          ? 'bg-gray-900/50 opacity-100 backdrop-blur-sm'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* You can customize the loading icon as needed */}
      {/* <div className="bg-white rounded-lg p-4 shadow-xl"> */}
      <div>
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default LoadingOverlay;
