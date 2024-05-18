import Button from '@/components/ui/button';
import Listbox, { ListboxOption } from '@/components/ui/list-box';
import { useState, useEffect, useRef, useContext } from 'react';
import { Close as CloseIcon } from '@/components/icons/close';
import Input from '@/components/ui/forms/input';
import IconListCircle from '@/components/icons/list-circle';
import { useModal } from '../modal-views/context';
import { readIPFS } from '@/app/shared/ipfs';
import { bytes32ToString } from '@/app/shared/utils';
import { Listbox as Multilistbox } from '@/components/ui/multi-list-box';
import { surveyAudienceAtom } from '@/stores/atoms';
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
import { set } from 'lodash';

export const actionOptions = [
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
  const [inputInFocus, setInputFocused] = useState<boolean>(false);
  const [inputBlocked, setInputBlocked] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [optionsFocused, setOptionsFocused] = useState<boolean>(false);
  const { getQuestionOptions } = useContext(SurveyContractContext);
  const setQn = async (qn: string) => {
    // check if qn is in fetchedQuestions, if yes, return
    if (
      audienceFilter[audiencefilterindex].prev_response.fetchedQuestions.some(
        (question) => question.question_string === qn,
      ) ||
      qn === audienceFilter[audiencefilterindex].prev_response.selectedQues
    ) {
      return;
    }

    setInputBlocked(true);
    try {
      if (qn.length > 3) {
        toast.loading('Fetching matching questions...', {
          id: 'fetching-questions',
        });
        var res = await GetMatchingQuestions(qn);
        // create new array with each element of res repeated 3 times
        setAudienceFilter((prev) => {
          const newState = [...prev];
          const updatedItem = { ...newState[audiencefilterindex] };
          const updatedPrevResp = { ...updatedItem.prev_response };
          updatedPrevResp.fetchedQuestions = res;
          updatedItem.prev_response = updatedPrevResp; // Update the prev_response property
          newState[audiencefilterindex] = updatedItem;
          return newState;
        });

        toast.success('Fetched matching questions.', {
          id: 'fetching-questions',
        });

        setAudienceFilter((prev) => {
          const newState = [...prev];
          const updatedItem = { ...newState[audiencefilterindex] };
          const updatedPrevResp = { ...updatedItem.prev_response };
          updatedPrevResp.selectedQues = qn;
          updatedItem.prev_response = updatedPrevResp;
          newState[audiencefilterindex] = updatedItem;
          return newState;
        });
        // Focus back on the input element after request completes
        if (res.length > 0) {
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
    if (
      audienceFilter[audiencefilterindex].prev_response.value.matchType.value ==
        'is_in' ||
      audienceFilter[audiencefilterindex].prev_response.value.matchType.value ==
        'equals'
    ) {
      setAudienceFilter((prev) => {
        const newState = [...prev];
        const updatedItem = { ...newState[audiencefilterindex] };
        const updatedPrevResp = { ...updatedItem.prev_response };
        updatedPrevResp.selectedOptions = [];
        updatedItem.prev_response = updatedPrevResp;
        newState[audiencefilterindex] = updatedItem;
        return newState;
      });
    }
  }, [audienceFilter[audiencefilterindex].prev_response.value]);

  useEffect(() => {
    if (
      audienceFilter[audiencefilterindex].prev_response.selectedOptions.length >
      0
    ) {
      setAudienceFilter((prev) => {
        const newState = [...prev];
        const updatedItem = { ...newState[audiencefilterindex] };
        const updatedPrevResp = { ...updatedItem.prev_response };
        const updatedPrevRespValue = { ...updatedPrevResp.value };
        const newValue = {
          ...updatedPrevRespValue,
          options: audienceFilter[
            audiencefilterindex
          ].prev_response.selectedOptions.map((option) =>
            parseInt(option.value),
          ),
        };
        updatedPrevResp.value = newValue;
        updatedItem.prev_response = updatedPrevResp;
        newState[audiencefilterindex] = updatedItem;
        return newState;
      });
    }
  }, [audienceFilter[audiencefilterindex].prev_response.selectedOptions]);

  const setSelectedQuestion = async (questionId: number) => {
    //get the question string from the fetched question, check where question_id === questionId
    var index = null;
    for (
      let i = 0;
      i <
      audienceFilter[audiencefilterindex].prev_response.fetchedQuestions.length;
      i++
    ) {
      if (
        audienceFilter[audiencefilterindex].prev_response.fetchedQuestions[i]
          .id === questionId
      ) {
        index = i;
        break;
      }
    }
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      const updatedPrevResp = { ...updatedItem.prev_response };
      const updatedPrevRespValue = { ...updatedPrevResp.value };
      const newValue = { ...updatedPrevRespValue, questionId: questionId };
      updatedPrevResp.value = newValue;
      updatedItem.prev_response = updatedPrevResp;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
    // set value of input to the selected question
    if (inputRef.current) {
      inputRef.current.value =
        audienceFilter[audiencefilterindex].prev_response.fetchedQuestions[
          index
        ].question_string;
    }
    try {
      // var quesOptions = await getQuestionOptions(questionId)
      var quesOptions: QuestionOption[] = optionsRaw;
    } catch {
      var quesOptions: QuestionOption[] = [];
      toast.error('Error fetching question options.', {
        id: 'fetching-question-options',
      });
    }
    const optionRes = await ResolveOptions(quesOptions);
    setAudienceFilter((prev) => {
      const newState = [...prev];
      const updatedItem = { ...newState[audiencefilterindex] };
      const updatedPrevResp = { ...updatedItem.prev_response };
      updatedPrevResp.fetchedOptions = optionRes;
      updatedItem.prev_response = updatedPrevResp;
      newState[audiencefilterindex] = updatedItem;
      return newState;
    });
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
        onFocus={() => setInputFocused(true)}
        className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
        useUppercaseLabel={false}
        placeholder="Enter a question you want to filter audience on"
        error="Disclaimer : These attributes are not verified by ORCP and are based on the user's previous responses to other surveys."
      />
      {audienceFilter[audiencefilterindex].prev_response.fetchedQuestions
        .length > 0 &&
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
                {audienceFilter[
                  audiencefilterindex
                ].prev_response.fetchedQuestions.map((question) => (
                  <div
                    onClick={(e) => {
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
      {audienceFilter[audiencefilterindex].prev_response.fetchedOptions.length >
        0 && (
        <Listbox
          className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
          options={PrevResponseOptions}
          selectedOption={
            audienceFilter[audiencefilterindex].prev_response.value.matchType
          }
          onChange={(option: { name: string; value: string }) => {
            setAudienceFilter((prev) => {
              const newState = [...prev];
              const updatedItem = { ...newState[audiencefilterindex] };
              const updatedPrevResp = { ...updatedItem.prev_response };
              const updatedPrevRespValue = { ...updatedPrevResp.value };
              const newValue = { ...updatedPrevRespValue, matchType: option };
              updatedPrevResp.value = newValue;
              updatedItem.prev_response = updatedPrevResp;
              newState[audiencefilterindex] = updatedItem;
              return newState;
            });
          }}
        />
      )}
      {audienceFilter[audiencefilterindex].prev_response.fetchedOptions.length >
        0 && (
        <Multilistbox
          className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
          options={
            audienceFilter[audiencefilterindex].prev_response.fetchedOptions
          }
          selectedOptions={
            audienceFilter[audiencefilterindex].prev_response.selectedOptions
          } // Change here to selectedOptions
          onChange={(options: ListboxOption[]) => {
            // Change here to accept ListboxOption[]
            setAudienceFilter((prev) => {
              const newState = [...prev];
              const updatedItem = { ...newState[audiencefilterindex] };
              const updatedPrevResp = { ...updatedItem.prev_response };
              updatedPrevResp.selectedOptions = options;
              updatedItem.prev_response = updatedPrevResp;
              newState[audiencefilterindex] = updatedItem;
              return newState;
            });
          }}
          multiple={
            audienceFilter[audiencefilterindex].prev_response.value.matchType
              .value !== 'equals'
          }
        />
      )}
    </div>
  );
}

function TokenReserveFilter({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  const [selectedToken, setSelectedToken] = useState(TokenReserveOptions[0]);
  const [minAmount, setMinAmount] = useState<number>(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  // useEffect(() => {
  //   setAudienceFilter((prev) => {
  //     prev[audiencefilterindex].token_reserve.selectedToken = selectedToken;
  //     prev[audiencefilterindex].token_reserve.minAmount = minAmount;
  //     prev[audiencefilterindex].token_reserve.selectedChain = selectedChain;
  //     prev[audiencefilterindex].token_reserve.contractAddress = contractAddress;
  //     return prev;
  //   });
  // }, [selectedToken, minAmount, selectedChain, contractAddress]);
  return (
    <div>
      <Listbox
        className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
        options={TokenReserveOptions}
        selectedOption={selectedToken}
        onChange={(option: { name: string; value: string }) => {
          setSelectedToken(option);
        }}
      />
      {selectedToken.value != 'other' && (
        <Input
          className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
          useUppercaseLabel={false}
          type="number"
          placeholder={`Enter the minimum amount of ${selectedToken.name} required to participate in the survey`}
          onChange={(e) => {
            setMinAmount(Number(e.target.value));
          }}
        />
      )}
      {selectedToken.value == 'other' && (
        <>
          <Listbox
            className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
            options={AvailableChains}
            selectedOption={
              selectedChain ? selectedChain : { name: 'Choose Chain' }
            }
            onChange={(option: { name: string; value: string }) => {
              setSelectedChain(option);
            }}
          />
          {selectedChain && (
            <>
              <Input
                className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
                useUppercaseLabel={false}
                placeholder="Enter the contract address of the token, must implement ERC20 interface"
                onChange={(e) => {
                  setContractAddress(e.target.value);
                }}
              />
              <Input
                className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
                useUppercaseLabel={false}
                type="number"
                placeholder="Enter the minimum amount of token required to participate in the survey"
                onChange={(e) => {
                  setMinAmount(Number(e.target.value));
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
  const [selectedChain, setSelectedChain] = useState(AvailableChains[0]);
  const [nftContractAddress, setNftContractAddress] = useState<string>('');
  // useEffect(() => {
  //   setAudienceFilter((prev) => {
  //     prev[audiencefilterindex].nft_token.selectedchain = selectedChain;
  //     prev[audiencefilterindex].nft_token.nftContractAddress =
  //       nftContractAddress;
  //     return prev;
  //   });
  // }, [selectedChain, nftContractAddress]);
  return (
    <div>
      <Listbox
        className="w-full sm:w-80 mt-4 ltr:xs:ml-12 rtl:xs:mr-12 ltr:sm:ml-18 rtl:sm:mr-18"
        options={AvailableChains}
        selectedOption={selectedChain}
        onChange={(option: { name: string; value: string }) => {
          setSelectedChain(option);
        }}
      />
      <Input
        className="mt-4 ltr:xs:ml-6 rtl:xs:mr-6 ltr:sm:ml-12 rtl:sm:mr-12"
        useUppercaseLabel={false}
        placeholder="Enter the contract address of the NFT token, must implement ERC721 interface"
        onChange={(e) => {
          setNftContractAddress(e.target.value);
        }}
      />
    </div>
  );
}

export default function AudienceFilter({ audiencefilterindex }) {
  const [audienceFilter, setAudienceFilter] =
    useRecoilState(surveyAudienceAtom);
  let [actionType, setActionType] = useState(
    audienceFilter[audiencefilterindex].filter_type,
  );
  // useEffect(() => {
  //   setAudienceFilter((prev) => {
  //     // Create a copy of the previous state array
  //     const newState = [...prev];
  //     // Create a copy of the object at the specified index
  //     const updatedItem = { ...newState[audiencefilterindex] };
  //     // Update the filter_type property of the copied object
  //     updatedItem.filter_type = actionType;
  //     // Update the array with the modified object at the specified index
  //     newState[audiencefilterindex] = updatedItem;
  //     // Return the new state only if it has changed
  //     if (JSON.stringify(prev) !== JSON.stringify(newState)) {
  //       return newState;
  //     }
  //     // Otherwise, return the previous state
  //     return prev;
  //   });
  // }, [actionType]);

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
          options={actionOptions}
          selectedOption={actionType}
          onChange={(val) => {
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
      </>
    </div>
  );
}
