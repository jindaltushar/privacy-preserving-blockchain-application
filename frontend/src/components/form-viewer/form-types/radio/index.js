'use client';
import React, { useState, useEffect, useRef } from 'react';
// import { SelectWrapper, InputSelect, OptionsWrapper, Option } from './styled';
import { Listbox } from '@/components/ui/listbox';
import InputLabel from '@/components/ui/input-label';
import { ChevronDown } from '@/components/icons/chevron-down';
import { Transition } from '@/components/ui/transition';
import cn from 'classnames';
// Hook

const scrollbarStyle = {
  maxHeight: '30vh',
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
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const Radio = ({ values, questionId, setValue, getValues }) => {
  const selectRef = useRef(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [itemChecked, setItemChecked] = useState(
    getValues(questionId.toString()) || {},
  );

  useOnClickOutside(selectRef, () => {
    setMenuIsOpen(false);
  });

  const handleChange = (option) => {
    let valueSelected = getValues(questionId.toString());
    if (!valueSelected) {
      valueSelected = {};
    }

    if (valueSelected.id === option.id) {
      setItemChecked({});
      setValue(questionId.toString(), {});
    } else {
      setItemChecked(option);
      setValue(questionId.toString(), option);
    }
    console.log('values set');
    setMenuIsOpen(false);
  };

  return (
    <div className="flex justify-center">
      <div className="relative w-1/4">
        <Listbox value={itemChecked} onChange={handleChange}>
          <Listbox.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-[#E2E8F0] px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
            <div className="flex items-center">
              {itemChecked.label
                ? itemChecked.label
                : 'Please select an option.'}
            </div>
            <ChevronDown />
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-light-dark xs:p-2"
              style={scrollbarStyle}
            >
              {values.map((value) => (
                <Listbox.Option key={value.id} value={value}>
                  {({ selected }) => (
                    <div
                      className={cn(
                        'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100',
                        selected
                          ? 'bg-gray-200/70 font-medium dark:bg-gray-600/60'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/70',
                      )}
                    >
                      {value.label}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
    </div>
  );
};

export default Radio;
