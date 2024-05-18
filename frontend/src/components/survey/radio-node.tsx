'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { type RadioProps } from '@/app/shared/types';
import Input from '@/components/ui/forms/input';
import { useRecoilState } from 'recoil';
import { nodesAtom, masterSettingsAtom } from '@/stores/atoms';
import Button from '@/components/ui/button/button';
import { FaXmark, FaPlus } from 'react-icons/fa6';
import { GetMatchingQuestions } from '@/app/shared/central-server';
import { Listbox } from '@/components/ui/listbox';
import { Transition } from '@/components/ui/transition';
import { Fragment } from 'react';
import { toast } from 'sonner';
import { ChevronDown } from '@/components/icons/chevron-down';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { QuestionOption } from '@/app/shared/types';
import { readIPFS } from '@/app/shared/ipfs';
import { bytes32ToString, generateRandomString } from '@/app/shared/utils';
import { QuestionIconButton } from '@/components/survey/publicVsPrivateComparisionTable';
import { Tooltip } from 'react-tooltip';
import { optionsObject, fetchedQuestionResponse } from '@/app/shared/types';

export const optionsRaw: QuestionOption[] = [
  {
    option:
      '0x48656c6c6f2c20776f726c642100000000000000000000000000000000000000',
    optionIPFSHash: {
      digest:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      hashFunction: 0,
      size: 0,
    },
  },
  {
    option: '',
    optionIPFSHash: {
      digest:
        '0x599f40590978230687f9e033291ac390d73161b674f1d17a3d2c8aee64104079',
      hashFunction: 18,
      size: 32,
    },
  },
  {
    option:
      '0x476f6f706f70707020476f6f6f706f6f6f000000000000000000000000000000',
    optionIPFSHash: {
      digest:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      hashFunction: 0,
      size: 0,
    },
  },
  {
    option: '',
    optionIPFSHash: {
      digest:
        '0xdc17d03492e51d6bb8fdcd00d9e22b6e32d96b59d5a988f296d89f6e8360390d',
      hashFunction: 18,
      size: 32,
    },
  },
];

export async function ResolveOptions(optionsResponse: QuestionOption[]) {
  const optionsPromises: Promise<optionsObject>[] = [];

  for (let i = 0; i < optionsResponse.length; i++) {
    if (optionsResponse[i].optionIPFSHash.size !== 0) {
      optionsPromises.push(
        (async () => {
          try {
            const optionStringData = await readIPFS(
              optionsResponse[i].optionIPFSHash,
            );
            return { index: i, optionString: optionStringData.optionString };
          } catch (error) {
            // Handle error if needed
            return { index: i, optionString: '' }; // or any default value
          }
        })(),
      );
    } else {
      optionsPromises.push(
        Promise.resolve({
          index: i,
          optionString: bytes32ToString(optionsResponse[i].option),
        }),
      );
    }
  }
  const resolvedOptions = await Promise.all(optionsPromises);
  return resolvedOptions;
}

export function OptionNode({
  questionIndex,
  answerIndex,
  optionsList,
  nodes,
  setNodes,
  fetchedOptions,
}: {
  questionIndex: number;
  answerIndex: number;
  optionsList: optionsObject[];
  nodes: RadioProps[];
  setNodes: any;
  fetchedOptions: optionsObject[];
}) {
  const [selected, setSelected] = useState(null);

  const deleteOptionNode = () => {
    setSelected(null);
    setNodes((prev) => {
      const elem = prev[questionIndex];
      const prevans = elem.data.ans;
      const updatedAns = [
        ...prevans.slice(0, answerIndex),
        ...prevans.slice(answerIndex + 1),
      ];
      return [
        ...prev.slice(0, questionIndex),
        {
          type: elem.type,
          data: { ...elem.data, ans: updatedAns },
        },
        ...prev.slice(questionIndex + 1),
      ];
    });
  };

  useEffect(() => {
    if (selected) {
      setNodes((prev) => {
        const elem = prev[questionIndex];
        const prevans = elem.data.ans;
        if (prevans.length == 0) {
          const newans = [selected.index];
          return [
            ...prev.slice(0, questionIndex),
            { type: elem.type, data: { ...elem.data, ans: newans } },
            ...prev.slice(questionIndex + 1),
          ];
        } else {
          const newans = [
            ...prevans.slice(0, answerIndex),
            selected.index,
            ...prevans.slice(answerIndex + 1),
          ];
          return [
            ...prev.slice(0, questionIndex),
            { type: elem.type, data: { ...elem.data, ans: newans } },
            ...prev.slice(questionIndex + 1),
          ];
        }
      });
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      setSelected(null);
    };
  }, []);

  var [show, setShow] = useState(false);

  useEffect(() => {
    if (fetchedOptions.length > 0) {
      setShow(true);
    }
  }, [fetchedOptions]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-grow">
        <Listbox value={selected} onChange={setSelected} disabled={!show}>
          <div className="relative mt-1 ml-10">
            <Listbox.Button className="relative mt-1 block h-10 text-left  w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:h-12 sm:rounded-lg">
              <span className="block truncate">
                {selected ? selected.optionString : 'Please Choose'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {optionsList
                  .filter(
                    ({ index }) =>
                      !nodes[questionIndex].data.ans.includes(index),
                  )
                  .map(({ index, optionString }) => (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          active ? '' : 'text-gray-900'
                        }`
                      }
                      value={{ index: index, optionString: optionString }}
                    >
                      <span className={'block truncate font-normal'}>
                        {optionString}
                      </span>
                    </Listbox.Option>
                  ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
      <Button
        onClick={() => deleteOptionNode()}
        size="small"
        variant="transparent"
      >
        <FaXmark />
      </Button>
    </div>
  );
}

export function AnswerNode({
  index,
  answerIndex,
}: {
  index: number;
  answerIndex: number;
}) {
  const [i] = useState<number>(index);
  const [ai] = useState<number>(answerIndex); // ans index
  const [nodes, setNodes] = useRecoilState(nodesAtom);

  const setAns = (ans: string) => {
    setNodes((prev) => {
      const elem = prev[i] as RadioProps;
      const optionOptions = [
        ...(elem.data.optionOptions.slice(0, ai) as string[]),
        ans,
        ...(elem.data.optionOptions.slice(ai + 1) as string[]),
      ];
      return [
        ...prev.slice(0, i),
        { type: 'radio', data: { ...elem.data, optionOptions: optionOptions } },
        ...prev.slice(i + 1),
      ];
    });
  };

  const addAnswerNode = () => {
    //check if any of the answer is empty
    const elem = nodes[i] as RadioProps;
    console.log('elem.data.optionOptions', elem.data.optionOptions);
    for (let g = 0; g < elem.data.optionOptions.length; g++) {
      if (
        elem.data.optionOptions[g] === '' ||
        elem.data.optionOptions[g] === null
      ) {
        toast.error('Please fill the empty answer before adding a new one.');
        return;
      }
    }

    setNodes((prev) => {
      const elem = nodes[i] as RadioProps;
      const optionOptions = [
        ...(elem.data.optionOptions.slice(0, ai + 1) as string[]),
        null,
        ...elem.data.optionOptions.slice(ai + 1),
      ];
      return [
        ...prev.slice(0, i),
        {
          type: elem.type,
          data: { ...elem.data, optionOptions: optionOptions },
        },
        ...prev.slice(i + 1),
      ];
    });
  };

  const deleteAnswerNode = () => {
    setNodes((prev) => {
      const elem = nodes[i] as RadioProps;
      if (ai === 0 && elem.data.optionOptions.length <= 1) return prev;
      const optionOptions = [
        ...(elem.data.optionOptions.slice(0, ai) as string[]),
        ...(elem.data.optionOptions.slice(ai + 1) as string[]),
      ];
      return [
        ...prev.slice(0, i),
        {
          type: elem.type,
          data: { ...elem.data, optionOptions: optionOptions },
        },
        ...prev.slice(i + 1),
      ];
    });
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {/* <Input type="checkbox" checked disabled className="h-[24px] w-[24px]" /> */}
      <div className="flex-grow">
        <Input
          placeholder="Adding a custom option will cost gas. Please use it wisely."
          value={(nodes[i] as RadioProps).data.optionOptions[ai]}
          onChange={(e) => setAns(e.target.value)}
          className=" ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => addAnswerNode()}
          size="small"
          variant="transparent"
        >
          <FaPlus />
        </Button>
        <Button
          onClick={() => deleteAnswerNode()}
          size="small"
          variant="transparent"
        >
          <FaXmark />
        </Button>
      </div>
    </div>
  );
}

export function RadioNode({ index }: { index: number }) {
  const [i] = useState<number>(index);
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const [inputInFocus, setInputFocused] = useState<boolean>(false);
  const [fetchedQuestion, setFetchedQuestion] = useState<
    fetchedQuestionResponse[]
  >([]);
  const [fetchedOptions, setFetchedOptions] = useState<optionsObject[]>([]);
  const [inputBlocked, setInputBlocked] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [optionsFocused, setOptionsFocused] = useState<boolean>(false);
  const { getQuestionOptions } = useContext(SurveyContractContext);
  const [masterSettings, setMasterSettings] =
    useRecoilState(masterSettingsAtom);

  const setQn = async (qn: string) => {
    setInputBlocked(true);
    const elem = nodes[i] as RadioProps;
    if (elem.data.qn === qn) {
      setInputBlocked(false);
      return;
    }
    try {
      setNodes((prev) => {
        const elem = prev[i] as RadioProps;
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
          var res = await GetMatchingQuestions(qn, 0);
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

  useEffect(() => {
    console.log(fetchedQuestion);
  }, [fetchedQuestion]);

  useEffect(() => {
    console.log(nodes);
  }, [nodes]);

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
      const elem = prev[i] as RadioProps;
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
    try {
      var quesOptions = await getQuestionOptions(questionId);
      // var quesOptions: QuestionOption[] = optionsRaw;
    } catch {
      var quesOptions: QuestionOption[] = [];
      toast.error('Error fetching question options.', {
        id: 'fetching-question-options',
      });
    }
    const resolvedOptions = await ResolveOptions(quesOptions);
    setFetchedOptions(resolvedOptions);
    setNodes((prev) => {
      const elem = prev[i] as RadioProps;
      return [
        ...prev.slice(0, i),
        {
          type: elem.type,
          data: { ...elem.data, optionStrings: resolvedOptions },
        },
        ...prev.slice(i + 1),
      ];
    });
  };
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative gap-2">
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

        {!masterSettings.is_survey_private && (
          <OptionNode
            key={0}
            questionIndex={i}
            answerIndex={0}
            optionsList={fetchedOptions}
            nodes={nodes as RadioProps[]}
            setNodes={setNodes}
            fetchedOptions={fetchedOptions}
          />
        )}

        {(nodes[i] as RadioProps).data.ans.map((value, index) => {
          if (index === fetchedOptions.length - 1) return null;
          return (
            <OptionNode
              key={index + 1} // You might need to provide a unique key if OptionNode is being rendered in a list
              questionIndex={i}
              answerIndex={index + 1}
              optionsList={fetchedOptions.filter(
                ({ index }) =>
                  !(nodes[i] as RadioProps).data.ans.includes(index),
              )}
              nodes={nodes as RadioProps[]}
              setNodes={setNodes}
              fetchedOptions={fetchedOptions}
            />
          );
        })}

        {(nodes[i] as RadioProps).data.other && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className="font-medium ml-2">Other Options</h1>
            <QuestionIconButton tooltip="Adding Custom Option is costly" />
          </div>
        )}
        {(nodes[i] as RadioProps).data.other &&
          (nodes[i] as RadioProps).data.optionOptions.map((value, index) => {
            return <AnswerNode index={i} answerIndex={index} />;
          })}
        <Tooltip id="my-tooltip-multiline" />
      </div>
    </div>
  );
}
