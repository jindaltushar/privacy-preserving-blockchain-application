import React, { useState, useRef, useEffect } from 'react';
import { type TextProps } from '@/app/shared/types';
import { useRecoilState } from 'recoil';
import { nodesAtom } from '@/stores/atoms';
import Input from '@/components/ui/forms/input';
import Textarea from '@/components/ui/forms/textarea';
import {
  fetchedQuestionResponse,
  QuestionOption,
  optionsObject,
} from '@/app/shared/types';
import { Transition } from '@/components/ui/transition';
import { GetMatchingQuestions } from '@/app/shared/central-server';
import { toast } from 'sonner';
import { optionsRaw, ResolveOptions } from './radio-node';
import { useRecoilValue } from 'recoil';
import { masterSettingsAtom } from '@/stores/atoms';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { generateRandomString } from '@/app/shared/utils';
export function TextNode({ index }: { index: number }) {
  const [i] = useState<number>(index);
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const [inputInFocus, setInputFocused] = useState<boolean>(false);
  const [inputBlocked, setInputBlocked] = useState<boolean>(false);
  const { getQuestionOptions } = React.useContext(SurveyContractContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fetchedOptions, setFetchedOptions] = useState<optionsObject[]>([]);
  const [fetchedQuestion, setFetchedQuestion] = useState<
    fetchedQuestionResponse[]
  >([]);
  const [optionsFocused, setOptionsFocused] = useState<boolean>(false);
  const masterSettings = useRecoilValue(masterSettingsAtom);

  const setQn = async (qn: string) => {
    setInputBlocked(true);
    const elem = nodes[i] as TextProps;
    if (elem.data.qn === qn) {
      setInputBlocked(false);
      return;
    }
    try {
      setNodes((prev) => {
        const elem = prev[i] as TextProps;
        return [
          ...prev.slice(0, i),
          { type: elem.type, data: { ...elem.data, qn: qn, questionId: null } },
          ...prev.slice(i + 1),
        ];
      });
      if (qn.length > 3) {
        if (!masterSettings.is_survey_private) {
          toast.loading('Fetching matching questions...', {
            id: 'fetching-questions',
          });
          var res = await GetMatchingQuestions(qn, 4);
          // create new array with each element of res repeated 3 times
          setFetchedQuestion(res);
          toast.success('Fetched matching questions.', {
            id: 'fetching-questions',
          });
          // Focus back on the input element after request completes
          if (inputRef.current) {
            console.log('in input focus');
            setTimeout(() => {
              inputRef.current.focus();
            }, 3); // Set a minimal delay of 0 milliseconds
          }
        }
      }
    } catch {
      toast.error('Error fetching matching questions.', {
        id: 'fetching-questions',
      });
    } finally {
      setInputBlocked(false);
    }
  };

  const setSelectedQuestion = async (questionId: number) => {
    //get the question string from the fetched question, check where question_id === questionId
    var index = null;
    for (let i = 0; i < fetchedQuestion.length; i++) {
      if (fetchedQuestion[i].question_id === questionId) {
        index = i;
        break;
      }
    }
    setNodes((prev) => {
      const elem = prev[i] as TextProps;
      return [
        ...prev.slice(0, i),
        {
          type: elem.type,
          data: {
            ...elem.data,
            qn: fetchedQuestion[index].question_string,
            questionId: questionId,
          },
        },
        ...prev.slice(i + 1),
      ];
    });
    // set value of input to the selected question
    if (inputRef.current) {
      inputRef.current.value = fetchedQuestion[index].question_string;
    }
  };

  const type = (nodes[i] as TextProps).data.type;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="gap-2">
          <Input
            defaultValue={nodes[i].data.qn}
            onBlur={(e) => {
              setQn(e.target.value);
              setInputFocused(false);
            }}
            placeholder="Start typing your question here."
            disabled={inputBlocked}
            ref={inputRef}
            onFocus={() => setInputFocused(true)}
          />
          {fetchedQuestion.length > 0 && (inputInFocus || optionsFocused) && (
            <Transition
              show={true}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 -translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <div
                className="absolute mt-2 z-20 w-full max-h-[calc(100vh/3)] overflow-y-auto min-w-[150px] origin-top-right rounded-lg bg-white p-3 px-3 shadow-large shadow-gray-400/10 ltr:right-0 rtl:left-0 dark:bg-[rgba(0,0,0,0.5)] dark:shadow-gray-900 dark:backdrop-blur opacity-100"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor:
                    '#888 transparent' /* Color of the scrollbar handle and track */,
                  WebkitOverflowScrolling:
                    'touch' /* Enable momentum scrolling on iOS devices */,
                }}
              >
                {fetchedQuestion.map((question) => (
                  <div
                    key={generateRandomString(20)}
                    onClick={(e) => {
                      setSelectedQuestion(question.question_id);
                    }}
                    onMouseEnter={() => setOptionsFocused(true)}
                    onMouseLeave={() => setOptionsFocused(false)}
                    className={
                      'block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  >
                    {question.question_string}
                  </div>
                ))}
              </div>
            </Transition>
          )}
        </div>
        {/* <div className="flex gap-2 w-full"> */}
        <Textarea disabled placeholder="Answer goes here..." />
        {/* </div> */}
      </div>
    </div>
  );
}
