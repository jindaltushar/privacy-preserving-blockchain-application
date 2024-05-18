'use client';
import React, { useState } from 'react';
import Button from '@/components/ui/button';
// import { RadioImagesWrapper, CheckboxOption } from './styled';
import { rangeValues } from '@/components/survey/range-node';
const Range = ({ values, questionId, setValue, getValues }) => {
  const [itemChecked, setItemChecked] = useState(
    getValues(questionId.toString()) || {},
  );

  const handleChange = (option) => {
    let valueSelected = getValues(questionId.toString());
    if (!valueSelected) {
      valueSelected = {};
    }

    if (valueSelected === option) {
      setItemChecked({});
      setValue(questionId.toString(), {});
    } else {
      setItemChecked(option);
      setValue(questionId.toString(), option);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex  flex-wrap justify-center items-center  gap-2  py-4">
        {rangeValues['0-10'].map((v, i) => (
          <Button
            // className={
            //   itemChecked === v ? 'bg-black text-white' : 'bg-white text-black'
            // }
            className={
              itemChecked === v
                ? 'bg-black text-white'
                : 'bg-white text-black dark:bg-black dark:text-white'
            }
            key={i}
            onClick={() => handleChange(v)}
          >
            <div
              className={
                itemChecked === v ? 'text-white' : 'text-black dark:text-white'
              }
            >
              {v}
            </div>
          </Button>
        ))}
      </div>
      {/* {values.map((val) => (
        <div
          className="h-72 w-1/2 px-4 py-2 rounded cursor-pointer relative flex flex-col"
          key={val.id}
        >
          <img
            src={val.image}
            className="max-w-80 max-h-80 mx-auto mt-12"
            alt="Checkbox Image"
          />
          <span className="mt-auto text-white text-base">{val.label}</span>
          <input
            className="opacity-0 w-1 h-1 absolute"
            defaultChecked={itemChecked.id === val.id}
            onClick={() => handleChange(val)}
            type="radio"
            name={questionId}
            value={val.id}
          />
          <div className="absolute top-0 left-0 w-full h-full transition duration-300 bg-opacity-10 bg-white shadow-inner"></div>
        </div>
      ))} */}
    </div>
  );
};

export default Range;
