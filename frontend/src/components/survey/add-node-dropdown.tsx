'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { generateRandomString } from '@/app/shared/utils';
import { Transition } from '@/components/ui/transition';
import { Listbox } from '@/components/ui/listbox';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { nodesAtom, masterSettingsAtom } from '@/stores/atoms';
import { type Node } from '@/app/shared/types';
import { Plus } from '@/components/icons/plus';
import cn from 'classnames';

export function AddNodeDropdown({ index }: { index: number }) {
  const buttonRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);
  const masterSettings = useRecoilValue(masterSettingsAtom);
  useEffect(() => {
    if (buttonRef.current) {
      const width = buttonRef.current.offsetWidth;
      setButtonWidth(width);
    }
  }, [buttonRef]);
  const setNodes = useSetRecoilState(nodesAtom);
  const addNode = (node: Node, index: number) =>
    setNodes((prev) => {
      if (index === -1) return [node, ...prev];
      return [...prev.slice(0, index + 1), node, ...prev.slice(index + 1)];
    });
  return (
    <>
      <div className="relative w-full flex flex-col items-center">
        {/* <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full border-t-2 border-gray-200"></div> */}
        <div
          className="absolute top-1/2 left-0 transform -translate-y-1/2 h-0.5 bg-gray-200"
          style={{ width: `calc(50% - ${buttonWidth / 2 + 3}px)` }}
        ></div>
        <div
          className="absolute top-1/2 right-0 transform -translate-y-1/2 h-0.5 bg-gray-200"
          style={{ width: `calc(50% - ${buttonWidth / 2 + 3}px)` }}
        ></div>
        <Listbox value={'Add Question'}>
          <Listbox.Button
            ref={buttonRef}
            className=" relative z-10 text-case-inherit letter-space-inherit flex h-10 max-w-xl items-center justify-between rounded-lg border border-[#E2E8F0] bg-gray-200/50 px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5"
          >
            <div className="flex items-center mr-4">{'Add Question'}</div>
            <Plus className="h-auto w-3" />
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 mt-1 grid min-w-80 origin-top gap-0.5 rounded-lg border border-gray-200 bg-white p-2 shadow-lg outline-none dark:border-gray-700 dark:bg-light-dark xs:p-2"
              style={{ minWidth: buttonWidth + 18 }}
            >
              <Listbox.Option
                key={'radio' + generateRandomString(30)}
                value={'radio'}
              >
                <div
                  className={cn(
                    'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100',
                    'hover:bg-gray-100 dark:hover:bg-gray-700/70',
                  )}
                  onClick={() => {
                    if (masterSettings.is_survey_private)
                      return addNode(
                        {
                          type: 'radio',
                          data: {
                            qn: '',
                            ans: [],
                            questionId: null,
                            privacySetting: 4,
                            other: true,
                            optionOptions: [''],
                            answerTypeAllowed: [false, false, false],
                            required: false,
                          },
                        },
                        index,
                      );
                    return addNode(
                      {
                        type: 'radio',
                        data: {
                          qn: '',
                          ans: [],
                          questionId: null,
                          privacySetting: 4,
                          answerTypeAllowed: [false, false, false],
                          required: false,
                        },
                      },
                      index,
                    );
                  }}
                >
                  Radio Question
                </div>
              </Listbox.Option>
              <Listbox.Option
                key={'checkbox' + generateRandomString(30)}
                value={'checkbox'}
              >
                <div
                  className={cn(
                    'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100',
                    'hover:bg-gray-100 dark:hover:bg-gray-700/70',
                  )}
                  onClick={() => {
                    if (masterSettings.is_survey_private)
                      return addNode(
                        {
                          type: 'checkbox',
                          data: {
                            qn: '',
                            ans: [],
                            questionId: null,
                            privacySetting: 4,
                            other: true,
                            optionOptions: [''],
                            answerTypeAllowed: [false, false, false],
                            required: false,
                          },
                        },
                        index,
                      );
                    return addNode(
                      {
                        type: 'checkbox',
                        data: {
                          qn: '',
                          ans: [],
                          questionId: null,
                          privacySetting: 4,
                          answerTypeAllowed: [false, false, false],
                          required: false,
                        },
                      },
                      index,
                    );
                  }}
                >
                  Checkbox Question
                </div>
              </Listbox.Option>
              <Listbox.Option
                key={'range' + generateRandomString(30)}
                value={'range'}
              >
                <div
                  className={cn(
                    'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100',
                    'hover:bg-gray-100 dark:hover:bg-gray-700/70',
                  )}
                  onClick={() =>
                    addNode(
                      {
                        type: 'range',
                        data: {
                          qn: '',
                          type: '0-10',
                          answerTypeAllowed: [false, false, false],
                          required: false,
                          privacySetting: 4,
                        },
                      },
                      index,
                    )
                  }
                >
                  Range Question
                </div>
              </Listbox.Option>
              <Listbox.Option
                key={'text' + generateRandomString(30)}
                value={'text'}
              >
                <div
                  className={cn(
                    'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100',
                    'hover:bg-gray-100 dark:hover:bg-gray-700/70',
                  )}
                  onClick={() =>
                    addNode(
                      {
                        type: 'text',
                        data: {
                          qn: '',
                          privacySetting: 4,
                          answerTypeAllowed: [false, true, false],
                          required: false,
                        },
                      },
                      index,
                    )
                  }
                >
                  Textbox Question
                </div>
              </Listbox.Option>
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
    </>
  );
}
