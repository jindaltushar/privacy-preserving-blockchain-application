'use client';

import React, { useContext, useState, useEffect } from 'react';
import Header from '@/layouts/header/header';
import { LoadingOverlayContext } from '@/app/shared/LoadingOverlayContext';
export default function WelcomeScreen() {
  var { setIsLoading } = useContext(LoadingOverlayContext);
  const [visibleIndex, setVisibleIndex] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisibleIndex((prevIndex) => (prevIndex + 1) % 3); // Cycle through divs
    }, 2000); // 2 seconds interval

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  return (
    <>
      <Header />
      <div
        className="landing_page"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      >
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
          <div className="w-full flex items-center justify-center px-16">
            <div className="relative w-full max-w-xl">
              {/* /////// Add the three divs below this comment ///////// */}

              <div
                className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-300 rounded-full
                  mix-blend-multiply filter blur-xl opacity-70 dark:opacity-30 animate-blob"
              ></div>

              <div
                className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-yellow-300  rounded-full
                  mix-blend-multiply filter blur-xl opacity-70 animate-blob  dark:opacity-30
                  animation-delay-2000"
              ></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>

              <div className="relative space-y-4  flex items-center justify-center">
                {/* <bold text */}
                <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">
                  Open Research Collaboration Platform
                </h1>
              </div>
              <div className="flex items-center justify-center space-x-2 m-2">
                Click on 'Connect' to get started
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
