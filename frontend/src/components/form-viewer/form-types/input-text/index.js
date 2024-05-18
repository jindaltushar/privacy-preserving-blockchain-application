'use client';
import React, { useState } from 'react';
// import { InputWrapper, Input } from './styled';
import Textarea from '@/components/ui/forms/textarea';

const scrollbarStyle = {
  minHeight: '50px',
  maxHeight: '50vh',
  overflowY: 'auto',
  // Inline CSS for scrollbar styling
  scrollbarWidth: 'thin',
  scrollbarColor: '#888 #f1f1f1',
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',
    borderRadius: '10px',
  },
};
const InputText = ({ placeholder, register, questionId }) => {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="flex justify-center">
      <Textarea
        className="w-full mx-5"
        value={value}
        {...register(questionId.toString())}
        name={questionId.toString()}
        onChange={handleChange}
        placeholder={placeholder}
        style={scrollbarStyle}
      />
      {/* <input
        type="text"
        className="w-full bg-transparent border-none text-white text-4xl transition duration-200 shadow-inner py-3 px-6 focus:shadow-outline"
        value={value}
        {...register(questionId.toString())}
        name={questionId.toString()}
        onChange={handleChange}
        placeholder={placeholder}
      /> */}
    </div>
  );
};

export default InputText;
