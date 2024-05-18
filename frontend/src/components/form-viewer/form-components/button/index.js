import React from 'react';
// import { Button, ButtonWrapper } from './styled';

const ButtonComp = ({ children, onClick }) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        className="relative font-bold cursor-pointer text-base transition duration-100 ease-out outline-none border-transparent shadow-md px-4 py-2 min-h-12 bg-white text-gray-500 border rounded"
      >
        {children}
      </button>
    </div>
  );
};

export default ButtonComp;
