import Button from '@/components/ui/button';
import Listbox, { ListboxOption } from '@/components/ui/list-box';
import { useState, useEffect, useRef, useContext } from 'react';
import { Close as CloseIcon } from '@/components/icons/close';
import Input from '@/components/ui/forms/input';
import IconListCircle from '@/components/icons/list-circle';
import { useModal } from '../modal-views/context';
import { readIPFS } from '@/app/shared/ipfs';
import { bytes32ToString, generateRandomString } from '@/app/shared/utils';
import { Listbox as Multilistbox } from '@/components/ui/multi-list-box';
import { surveyAudienceAtom, masterSettingsAtom } from '@/stores/atoms';
import {
  fetchedQuestionResponse,
  QuestionOption,
  SurveyAudienceFilter,
} from '@/app/shared/types';
import { toast } from 'sonner';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { GetMatchingQuestions } from '@/app/shared/central-server';
import { Transition } from '@/components/ui/transition';
import { optionsRaw } from './checkbox-node';
import { useRecoilState } from 'recoil';
import { set, update } from 'lodash';

export const PublicActionOptions = [
  {
    name: 'Address',
    value: 'address',
  },
  {
    name: 'Previous Responses',
    value: 'prev_resp',
  },
  {
    name: 'Reserve',
    value: 'token_balance',
  },
  {
    name: 'NFT Token',
    value: 'holds_nft',
  },
  {
    name: 'Responded to Survey',
    value: 'survey_answered',
  },
];
export const PrivateActionOptions = [
  {
    name: 'Address',
    value: 'address',
  },
];
export const PrevResponseOptions = [
  {
    name: 'Equals to',
    value: 'equals',
  },
  {
    name: 'Is In',
    value: 'is_in',
  },
];

export const TokenReserveOptions = [
  {
    name: 'Oasis Rose',
    value: 'rose',
  },
  {
    name: 'Ethereum Ether',
    value: 'eth',
  },
  {
    name: 'Other',
    value: 'other',
  },
];

export const AvailableChains = [
  {
    name: 'Oasis Sapphire',
    value: 'sapphire',
  },
  {
    name: 'Ethereum',
    value: 'ethereum',
  },
];

async function ResolveOptions(optionsResponse: QuestionOption[]) {
  const optionsPromises: Promise<ListboxOption>[] = [];

  for (let i = 0; i < optionsResponse.length; i++) {
    if (optionsResponse[i].optionIPFSHash.size !== 0) {
      optionsPromises.push(
        (async () => {
          try {
            const optionStringData = await readIPFS(
              optionsResponse[i].optionIPFSHash,
            );
            return { value: String(i), name: optionStringData.optionString };
          } catch (error) {
            // Handle error if needed
            return { value: String(i), name: '' }; // or any default value
          }
        })(),
      );
    } else {
      optionsPromises.push(
        Promise.resolve({
          value: String(i),
          name: bytes32ToString(optionsResponse[i].option),
        }),
      );
    }
  }
  const resolvedOptions = await Promise.all(optionsPromises);
  return resolvedOptions;
}

function AddressFilter({ audiencefilterindex }) {
  const { openModal } = useModal();
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddAddress = () => {
    if (inputValue.trim() !== '') {
      setAudienceFilter((prev) => {
        const newState = [...prev];
        const updatedItem = { ...newState[audiencefilterindex] };
        updatedItem.address_list = [
          ...updatedItem.address_list,
          inputValue.trim(),
        ];
        newState[audiencefilterindex] = updatedItem;
        return newState;
      });
      setInputValue('');
    }
  };

  return (
    <div className="flex items-center">
      {' '}
      {/* Parent container with flexbox styling */}
      <Input
        className="mt-4 p-2 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12 flex-grow"
        useUppercaseLabel={false}
        placeholder="Enter user address 0x1f9840a85..."
        value={inputValue}
        onChange={handleInputChange}
      />
      <Button
        variant="ghost"
        className="mt-4 dark:text-white"
        onClick={handleAddAddress}
      >
        Add
      </Button>
      {audienceFilter[audiencefilterindex].address_list.length > 0 && (
        <IconListCircle
          className="w-10 h-10 dark:text-gray-100 ml-2 mt-2.5 "
          onClick={() =>
            openModal('AUDIENCE_ADDRESS_LIST_VIEW', {
              filter_index: audiencefilterindex,
            })
          }
        />
      )}
    </div>
  );
}

export interface PrevRespProps {
  questionId: number | null;
  matchType: { name: string; value: string };
  options: number[];
}

function PreviousResponseFilter({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  const Filter = audienceFilter[audiencefilterindex];
  const [inputInFocus, setInputFocused] = useState<boolean>(false);
  const [inputBlocked, setInputBlocked] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [optionsFocused, setOptionsFocused] = useState<boolean>(false);
  const { getQuestionOptions } = useContext(SurveyContractContext);

  const updateFetchedQuestions = (questions: fetchedQuestionResponse[]) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.prev_response_fetchedQuestions = questions;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };

  const updateSelectedQues = (question: string) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.prev_response_selectedQues = question;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };

  const updateQuestionId = (questionId: number) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.prev_response_value_questionId = questionId;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };

  const updateFetchedOptions = (options: ListboxOption[]) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.prev_response_fetchedOptions = options;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };

  const updateSelectedOptions = (options: ListboxOption[]) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.prev_response_selectedOptions = options;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };

  const updateMatchType = (matchType: { name: string; value: string }) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.prev_response_value_matchType = matchType;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
    updateSelectedOptions([]);
  };

  const setQn = async (qn: string) => {
    // check if qn is in fetchedQuestions, if yes, return
    if (
      Filter.prev_response_fetchedQuestions.some(
        (question) => question.question_string === qn,
      ) ||
      qn === Filter.prev_response_selectedQues
    ) {
      return;
    }

    setInputBlocked(true);
    try {
      if (qn.length > 3) {
        toast.loading('Fetching matching questions...', {
          id: 'fetching-questions',
        });
        var res = await GetMatchingQuestions(qn, 999);
        // create new array with each element of res repeated 3 times
        updateFetchedQuestions(res);
        toast.success('Fetched matching questions.', {
          id: 'fetching-questions',
        });

        updateSelectedQues(qn);
        // Focus back on the input element after request completes
        if (res.length > 0) {
          if (inputRef.current) {
            console.log('in input focus', inputRef.current);
            inputRef.current.focus();
            // setTimeout(() => {
            //   inputRef.current.focus();
            // }, 0); // Set a minimal delay of 0 milliseconds
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

  const setSelectedQuestion = async (questionDatabaseIndex: number) => {
    //get the question string from the fetched question, check where question_id === questionId
    var index = null;
    var questionId;
    console.log('in setting ques');
    for (let i = 0; i < Filter.prev_response_fetchedQuestions.length; i++) {
      if (
        Filter.prev_response_fetchedQuestions[i].id === questionDatabaseIndex
      ) {
        index = i;
        questionId = Filter.prev_response_fetchedQuestions[i].question_id;
        break;
      }
    }
    updateQuestionId(questionId);
    updateSelectedQues(
      Filter.prev_response_fetchedQuestions[index].question_string,
    );
    // set value of input to the selected question
    if (inputRef.current) {
      inputRef.current.value =
        Filter.prev_response_fetchedQuestions[index].question_string;
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
    updateFetchedOptions(await ResolveOptions(quesOptions));
  };

  return (
    <div>
      <Input
        onBlur={(e) => {
          setQn(e.target.value);
          setInputFocused(false);
        }}
        disabled={inputBlocked}
        ref={inputRef}
        defaultValue={Filter.prev_response_selectedQues || null}
        onFocus={() => setInputFocused(true)}
        className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
        useUppercaseLabel={false}
        placeholder="Enter a question you want to filter audience on"
        error="Disclaimer : These attributes are not verified by ORCP and are based on the user's previous responses to other surveys."
      />
      {Filter.prev_response_fetchedQuestions.length > 0 &&
        (inputInFocus || optionsFocused) && (
          <Transition
            show={true}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 -translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <div className="relative ml-11">
              <div
                className="absolute  z-20 w-full max-h-[calc(100vh/3)] overflow-y-auto min-w-[150px] origin-top-right rounded-lg bg-white p-3 px-3 shadow-large shadow-gray-400/10 ltr:right-0 rtl:left-0 dark:bg-[rgba(0,0,0,0.5)] dark:shadow-gray-900 dark:backdrop-blur opacity-100"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor:
                    '#888 transparent' /* Color of the scrollbar handle and track */,
                  WebkitOverflowScrolling:
                    'touch' /* Enable momentum scrolling on iOS devices */,
                }}
              >
                {Filter.prev_response_fetchedQuestions.map((question) => (
                  <div
                    key={generateRandomString(23)}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('in click');
                      setSelectedQuestion(question.id);
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
            </div>
          </Transition>
        )}
      {Filter.prev_response_fetchedOptions.length > 0 && (
        <Listbox
          className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
          options={PrevResponseOptions}
          selectedOption={Filter.prev_response_value_matchType}
          onChange={(option: { name: string; value: string }) => {
            updateMatchType(option);
          }}
        />
      )}
      {Filter.prev_response_fetchedOptions.length > 0 && (
        <div className="flex">
          <Multilistbox
            className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
            options={Filter.prev_response_fetchedOptions}
            selectedOptions={Filter.prev_response_selectedOptions} // Change here to selectedOptions
            onChange={(options: ListboxOption[]) => {
              // Change here to accept ListboxOption[]
              updateSelectedOptions(options);
            }}
            multiple={Filter.prev_response_value_matchType.value !== 'equals'}
          />
        </div>
      )}
    </div>
  );
}

function TokenReserveFilter({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);

  const setSelectedChain = (option: ListboxOption) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.token_reserve_selectedChain = option;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };

  const setContractAddress = (value: string) => {
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      updatedItem.token_reserve_contractAddress = value;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
  };
  return (
    <div>
      <Listbox
        className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
        options={TokenReserveOptions}
        selectedOption={
          audienceFilter[audiencefilterindex].token_reserve_selectedToken
        }
        onChange={(option: { name: string; value: string }) => {
          setAudienceFilter((prev) => {
            const newState = [...prev];
            const updatedItem = { ...newState[audiencefilterindex] };
            updatedItem.token_reserve_selectedToken = option;
            newState[audiencefilterindex] = updatedItem;
            return newState;
          });
        }}
      />

      {audienceFilter[audiencefilterindex].token_reserve_selectedToken.value !=
        'other' && (
        <Input
          className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
          useUppercaseLabel={false}
          type="number"
          defaultValue={
            audienceFilter[audiencefilterindex].token_reserve_minAmount || null
          }
          placeholder={`Enter the minimum amount of ${audienceFilter[audiencefilterindex].token_reserve_selectedToken.name} required to participate in the survey`}
          onBlur={(e) => {
            e.preventDefault();
            setAudienceFilter((prev) => {
              const newState = [...prev];
              const updatedItem = { ...newState[audiencefilterindex] };
              updatedItem.token_reserve_minAmount = Number(e.target.value);
              newState[audiencefilterindex] = updatedItem;
              return newState;
            });
          }}
        />
      )}
      {audienceFilter[audiencefilterindex].token_reserve_selectedToken.value ==
        'other' && (
        <>
          <Listbox
            className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
            options={AvailableChains}
            selectedOption={
              audienceFilter[audiencefilterindex].token_reserve_selectedChain
                ? audienceFilter[audiencefilterindex]
                    .token_reserve_selectedChain
                : { name: 'Choose Chain', value: 'choose' }
            }
            onChange={(option: { name: string; value: string }) => {
              setSelectedChain(option);
            }}
          />
          {audienceFilter[audiencefilterindex].token_reserve_selectedChain && (
            <>
              <Input
                className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
                useUppercaseLabel={false}
                defaultValue={
                  audienceFilter[audiencefilterindex]
                    .token_reserve_contractAddress || null
                }
                placeholder="Enter the contract address of the token, must implement ERC20 interface"
                onBlur={(e) => {
                  setAudienceFilter((prev) => {
                    const newState = [...prev];
                    const updatedItem = { ...newState[audiencefilterindex] };
                    updatedItem.token_reserve_contractAddress = e.target.value;
                    newState[audiencefilterindex] = updatedItem;
                    return newState;
                  });
                }}
              />
              <Input
                className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
                useUppercaseLabel={false}
                type="number"
                defaultValue={
                  audienceFilter[audiencefilterindex].token_reserve_minAmount ||
                  null
                }
                placeholder="Enter the minimum amount of token required to participate in the survey"
                onBlur={(e) => {
                  setAudienceFilter((prev) => {
                    const newState = [...prev];
                    const updatedItem = { ...newState[audiencefilterindex] };
                    updatedItem.token_reserve_minAmount = Number(
                      e.target.value,
                    );
                    newState[audiencefilterindex] = updatedItem;
                    return newState;
                  });
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function NFTTokenFilter({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  return (
    <div>
      <Listbox
        className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
        options={AvailableChains}
        selectedOption={
          audienceFilter[audiencefilterindex].nft_token_selectedchain
        }
        onChange={(option: { name: string; value: string }) => {
          setAudienceFilter((prev) => {
            const newState = [...prev];
            const updatedItem = { ...newState[audiencefilterindex] };
            updatedItem.nft_token_selectedchain = option;
            newState[audiencefilterindex] = updatedItem;
            return newState;
          });
        }}
      />
      <Input
        className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
        useUppercaseLabel={false}
        placeholder="Enter the contract address of the NFT token, must implement ERC721 interface"
        defaultValue={
          audienceFilter[audiencefilterindex].nft_token_nftContractAddress ||
          null
        }
        onBlur={(e) => {
          setAudienceFilter((prev) => {
            const newState = [...prev];
            const updatedItem = { ...newState[audiencefilterindex] };
            updatedItem.nft_token_nftContractAddress = e.target.value;
            newState[audiencefilterindex] = updatedItem;
            return newState;
          });
        }}
      />
    </div>
  );
}

function SurveyAnswered({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  return (
    <div>
      <Input
        className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
        useUppercaseLabel={false}
        placeholder="Enter the survey ID to whose audience you want to filter"
        defaultValue={
          audienceFilter[audiencefilterindex].survey_answered_id || null
        }
        onBlur={(e) => {
          setAudienceFilter((prev) => {
            const newState = [...prev];
            const updatedItem = { ...newState[audiencefilterindex] };
            updatedItem.survey_answered_id = Number(e.target.value);
            newState[audiencefilterindex] = updatedItem;
            return newState;
          });
        }}
      />
    </div>
  );
}
export default function AudienceFilter({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  const [masterSettings] = useRecoilState(masterSettingsAtom);
  let [actionType, setActionType] = useState(
    audienceFilter[audiencefilterindex].filter_type,
  );

  return (
    <div className="group mb-4 rounded-md bg-gray-100/90 p-5 pt-3 dark:bg-dark/60 xs:p-6 xs:pb-8">
      <div className="-mr-2 mb-3 flex items-center justify-between">
        <h3 className="text-base font-medium dark:text-gray-100">
          Filter #{audiencefilterindex + 1}
        </h3>
        <Button
          type="button"
          size="mini"
          shape="circle"
          variant="transparent"
          className="opacity-0 group-hover:opacity-100 dark:text-gray-300"
          onClick={() => {
            setAudienceFilter(
              audienceFilter.filter(
                (_, index) => index !== audiencefilterindex,
              ),
            );
          }}
        >
          <CloseIcon className="h-auto w-[11px] xs:w-3" />
        </Button>
      </div>
      <>
        <Listbox
          className="w-full sm:w-80"
          options={
            masterSettings.is_survey_private
              ? PrivateActionOptions
              : PublicActionOptions
          }
          selectedOption={actionType}
          onChange={(val) => {
            //check if already audience filter exists
            if (masterSettings.is_survey_private && audienceFilter.length > 0) {
              toast.error(
                'Only one Address filter can be applied for private surveys.',
              );
              return;
            }
            if (masterSettings.is_survey_private && val.value != 'address') {
              toast.error(
                'Only Address filter can be applied for private surveys.',
              );
              return;
            }
            if (!masterSettings.is_survey_private) {
              if (val.value == 'address') {
                //check if already address filter exists
                if (
                  audienceFilter.filter(
                    (filter) => filter.filter_type.value == 'address',
                  ).length > 0
                ) {
                  toast.error(
                    'Only one Address filter can be applied for a Survey.',
                  );
                  return;
                }
              }
            }
            setAudienceFilter((prev) => {
              const newState = [...prev];
              const updatedItem = { ...newState[audiencefilterindex] };
              updatedItem.filter_type = val;
              newState[audiencefilterindex] = updatedItem;
              return newState;
            });
            setActionType(val);
          }}
        />
        {actionType.value == 'address' && (
          <AddressFilter audiencefilterindex={audiencefilterindex} />
        )}
        {actionType.value == 'prev_resp' && (
          <PreviousResponseFilter audiencefilterindex={audiencefilterindex} />
        )}
        {actionType.value == 'token_balance' && (
          <TokenReserveFilter audiencefilterindex={audiencefilterindex} />
        )}
        {actionType.value == 'holds_nft' && (
          <NFTTokenFilter audiencefilterindex={audiencefilterindex} />
        )}
        {actionType.value == 'survey_answered' && (
          <SurveyAnswered audiencefilterindex={audiencefilterindex} />
        )}
      </>
    </div>
  );
}
