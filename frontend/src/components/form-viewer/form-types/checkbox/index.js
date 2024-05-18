'use client';
import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
// import { CheckboxWrapper, CheckboxOption } from './styled';
import cn from 'classnames';
const scrollbarStyle = {
  maxHeight: '40vh',
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

const Checkbox = ({ values, questionId, setValue, getValues, control }) => {
  const [itemsChecked, setItemsChecked] = useState(
    getValues(questionId.toString()) || [],
  );

  const { remove } = useFieldArray({
    control,
    name: questionId.toString(),
  });

  const handleChange = (option) => {
    let values = getValues(questionId.toString());
    if (!values) {
      values = [];
    }

    const indexFound = values.findIndex((item) => item.id === option.id);

    if (indexFound > -1) {
      remove(indexFound);
      const valuesToSave = values.filter((item) => item.id !== option.id);
      setItemsChecked(valuesToSave);
    } else {
      const valuesToSave = [...values, option];
      setItemsChecked(valuesToSave);
      setValue(questionId.toString(), valuesToSave);
    }
  };

  // return (
  //   <div className="flex flex-wrap -mb-2 -mr-2">
  //     {values.map((val) => (
  //       <div
  //         className="w-1/2 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 px-2 py-2 cursor-pointer rounded relative mb-2 mr-2 flex flex-col"
  //         key={val.id}
  //       >
  //         <span className="mt-auto text-base">{val.label}</span>
  //         <input
  //           className="opacity-0 w-1 h-1 absolute"
  //           defaultChecked={itemsChecked.some((item) => item.id === val.id)}
  //           onClick={() => handleChange(val)}
  //           type="checkbox"
  //           name={questionId}
  //           value={val.id}
  //         />
  //         <div></div>
  //       </div>
  //     ))}
  //   </div>
  // );
  return (
    <div
      className="flex flex-wrap justify-center items-center "
      style={scrollbarStyle}
    >
      {values.map((val) => (
        <div
          className={cn(
            'rounded-md px-5 py-2 border-black border-solid border-2 m-2 cursor-pointer',
            itemsChecked.some((item) => item.id === val.id)
              ? 'bg-gray-50 border-solid border-black dark:border-white dark:bg-inherit'
              : 'border-dotted border-slate-700',
          )}
          key={val.id}
          onClick={() => handleChange(val)}
        >
          {val.label}
        </div>
      ))}
    </div>
  );
};

export default Checkbox;
