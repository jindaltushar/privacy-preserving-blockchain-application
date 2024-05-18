'use client';

import React, { useState, useEffect, useContext } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import { Section, Question } from './form-sections';
import Box from '@mui/material/Box';
import { useForm } from 'react-hook-form';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { answer_types } from '@/components/survey/settings';
import ListCard from '@/components/ui/list-card';
import cn from 'classnames';
import Text from '@/components/ui/text';
import { Tooltip } from 'react-tooltip';
import { toast } from 'sonner';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { sendJSONToIPFS } from '@/app/shared/ipfs';
import { stringToBytes32 } from '@/app/shared/utils';
import { PriceOracleContext } from '@/contracts-context/PriceOracleContractContext';
import { PrivacyObject, PriceObject } from '@/app/shared/types';
import { totalRewardsAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import { submittingResponseStatus } from '@/stores/atoms';
import { useRouter } from 'next/navigation';
const FormBuilder = ({ stepsData, surveyId }) => {
  const { register, control, reset, setValue, getValues } = useForm();
  const [currentIndexForm, setCurrentIndexForm] = useState(0);
  const [classNameState, setClassNameState] = useState('fade');
  const { getPriceForAnswerType, getPrivacyPoints } =
    useContext(PriceOracleContext);
  const [state, setState] = useState([false, false, false]);
  const [AnsType, setAnsType] = useState({});
  const [privacyPoints, setPrivacyPoints] = useState([]);
  const router = useRouter();
  const [pricePointsObject, setPricePointsObject] = useState([]);
  const [totalRewards, setTotalRewards] = useRecoilState(totalRewardsAtom);
  const {
    encodeTextAnswer,
    SubmitAnswerToSurvey,
    getAnswersOfQuestionInSurvey,
    SubmitAnswerToSurveyGasless,
  } = useContext(SurveyContractContext);

  const [submittingResponse, setSubmittingResponse] = useRecoilState(
    submittingResponseStatus,
  );
  const sendResponse = async () => {
    if (!getValues()) {
      toast.error('Please fill the form before submitting');
    }
    const values = getValues();
    // check if all mandatory questions are present in values
    for (let i = 0; i < stepsData.length; i++) {
      if (
        stepsData[i].required &&
        (!values[stepsData[i].question_id] ||
          Object.keys(values[stepsData[i].question_id]).length == 0)
      ) {
        toast.error('Please fill all the mandatory questions');
        return;
      }
    }
    //create answer in format required by backend (uint256 surveyId,uint256[] calldata questionIndex,bytes32[] calldata answerHashIPFSDigest,uint8[] calldata answerHashIPFSHashFunction, uint8[] calldata answerHashIPFSHashSize, uint256[][] calldata  optionIndexes,AnswerType[] calldata ansType)
    let questionIndex = [];
    let answerHashIPFSDigest = [];
    let answerHashIPFSHashFunction = [];
    let answerHashIPFSHashSize = [];
    let optionIndexes = [];
    let ansType = [];
    setSubmittingResponse([true, true]);
    console.log('stepdata is ', stepsData);
    console.log('values is ', values);
    for (let i = 1; i < stepsData.length - 1; i++) {
      const ansval = values[stepsData[i].question_id];
      if (
        !ansval ||
        ansval == undefined ||
        (Array.isArray(ansval) && ansval.length == 0)
      ) {
        continue;
      }
      console.log('ansval is ', ansval);
      if (stepsData[i].content[0].type == 'checkbox') {
        if (ansval.length == 0 || ansval == undefined) {
          continue;
        }
        // push to optionIndexes the selected option indexs the object is of form "{id: 0, label: 'you too'}" list
        let selectedOptions = values[stepsData[i].question_id];
        let optionIndex = [];
        for (let j = 0; j < selectedOptions.length; j++) {
          optionIndex.push(selectedOptions[j].id);
        }
        optionIndexes.push(optionIndex);
      } else if (stepsData[i].content[0].type == 'radio') {
        if (Object.keys(ansval).length === 0 || ansval == undefined) {
          continue;
        }
        optionIndexes.push([values[stepsData[i].question_id].id]);
      } else if (stepsData[i].content[0].type == 'input') {
        if (ansval == '' || ansval == undefined) {
          continue;
        }
        optionIndexes.push([]);
      } else if (stepsData[i].content[0].type == 'range') {
        if (ansval == '' || ansval == undefined) {
          continue;
        }
        optionIndexes.push([Number(values[stepsData[i].question_id])]);
      }

      questionIndex.push(stepsData[i].question_id - 1);
      if (stepsData[i].content[0].type == 'input') {
        console.log('text to exode', values[stepsData[i].question_id]);
        const encodedText = await encodeTextAnswer(
          surveyId,
          values[stepsData[i].question_id],
        );
        var ipfsHash;
        const jsonObj = {
          cipherForOrganisation: encodedText.cypherForOrganisation,
          cipherForUser: encodedText.cypherForUser,
        };
        console.log('encoded Text Response is ', jsonObj);
        ipfsHash = await sendJSONToIPFS(jsonObj);
        console.log('ipfs encoded text pushed to', ipfsHash);
      } else {
        ipfsHash = {
          digest: stringToBytes32(''),
          hashFunction: 0,
          size: 0,
        };
      }
      answerHashIPFSDigest.push(ipfsHash.digest);
      answerHashIPFSHashFunction.push(ipfsHash.hashFunction);
      answerHashIPFSHashSize.push(ipfsHash.size);
      ansType.push(AnsType[stepsData[i].question_id]);
    }
    console.log('here is the object to send');
    console.log('surveyid', surveyId);
    console.log('questionIndex', questionIndex);
    console.log('answerHashIPFSDigest', answerHashIPFSDigest);
    console.log('answerHashIPFSHashFunction', answerHashIPFSHashFunction);
    console.log('answerHashIPFSHashSize', answerHashIPFSHashSize);
    console.log('optionIndexes', optionIndexes);
    console.log('ansType', ansType);
    // send the answer to the survey
    const response = await SubmitAnswerToSurveyGasless(
      surveyId,
      questionIndex,
      answerHashIPFSDigest,
      answerHashIPFSHashFunction,
      answerHashIPFSHashSize,
      optionIndexes,
      ansType,
    );
    if (response) {
      //clear all data from local storage
      localStorage.clear();
      setTotalRewards(null);
      setSubmittingResponse([false, false]);
      router.push('/surveys?view=responded');
    } else {
      toast.error('Error submitting response');
      setSubmittingResponse([false, false]);
      router.push('/survey/error');
    }
  };

  const updateState = (index) => {
    setAnsType({
      ...AnsType,
      [stepsData[currentIndexForm].question_id]: index,
    });
  };

  useEffect(() => {
    const currentStep = stepsData[currentIndexForm];

    if (currentStep.isIntro) {
      const formValues = localStorage.getItem('form-values');
      if (formValues) {
        localStorage.removeItem('form-values');
      }
    } else {
      const values = getValues();
      localStorage.setItem('form-values', JSON.stringify(values));
    }
  }, [currentIndexForm, getValues]);

  useEffect(() => {
    const formValues = localStorage.getItem('form-values');
    if (formValues) {
      reset(JSON.parse(formValues));
    }
  }, [reset]);

  useEffect(() => {
    //make div non scrollable
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
      const formValues = localStorage.getItem('form-values');
      if (formValues) {
        localStorage.removeItem('form-values');
      }
    };
  }, []);

  // getting privacy and price data from priceoracle at load
  useEffect(() => {
    const getPrices = async () => {
      const privacyPoints = await getPrivacyPoints();
      const prices = await getPriceForAnswerType();
      const newPrivacyPointsObject = {};
      privacyPoints.map((element) => {
        newPrivacyPointsObject[Number(element.privacyLevel)] = Number(
          element.privacyPoints,
        );
      });

      const newPricesObject = {};
      prices.map((element) => {
        newPricesObject[Number(element.ansType)] = Number(element.price);
      });
      setPrivacyPoints(newPrivacyPointsObject);
      console.log('privacyPoints', newPrivacyPointsObject);
      setPricePointsObject(newPricesObject);
      console.log('pricePointsObject', newPricesObject);
    };
    getPrices();
  }, []);

  const updateRewards = () => {
    // get all values of the form and based on its corresponding privacy level and answer type set
    let rewards = 0;
    for (let i = 1; i < stepsData.length - 1; i++) {
      const ansval = getValues(stepsData[i].question_id.toString());
      if (ansval == undefined) {
        continue;
      }
      if (stepsData[i].content[0].type == 'checkbox') {
        if (ansval.length == 0 || ansval == undefined) {
          continue;
        }
      } else if (stepsData[i].content[0].type == 'radio') {
        try {
          if (Object.keys(ansval).length === 0 || ansval == undefined) {
            continue;
          }
        } catch {
          continue;
        }
      } else if (stepsData[i].content[0].type == 'input') {
        if (ansval == '' || ansval == undefined) {
          continue;
        }
      } else if (stepsData[i].content[0].type == 'range') {
        if (ansval == '' || ansval == undefined) {
          continue;
        }
      }
      const privacyLevelinternal = stepsData[i].privacySetting;
      const answerTypeinternal = AnsType[stepsData[i].question_id];

      if (answerTypeinternal !== undefined) {
        const privacyPointsval = privacyPoints[privacyLevelinternal];
        const pricePointsval = pricePointsObject[answerTypeinternal];
        const reward = privacyPointsval * pricePointsval;
        rewards += reward;
      }
    }
    console.log('rewards', rewards);
    setTotalRewards(rewards);
  };

  const setNewCurrentIndexForm = (newIndex) => {
    newIndex > currentIndexForm
      ? setClassNameState('fade')
      : setClassNameState('fade-out');
    updateRewards();
    setTimeout(() => {
      setCurrentIndexForm(newIndex);
    }, 50);
  };

  const generateFormStep = (step) => {
    const [submittingResponse, setSubmittingResponse] = useRecoilState(
      submittingResponseStatus,
    );
    switch (step.type) {
      case 'section':
        return (
          <div className="h-full w-full overflow-hidden">
            {step?.isEnd === true && (
              <Section
                hideNextButton={step.hide_next_button}
                isIntro={step?.isIntro}
                isEnd={step?.isEnd}
                content={step.content}
                onNextStep={({ goback }) => {
                  const fn = async () => {
                    await sendResponse();
                  };
                  if (goback) {
                    setNewCurrentIndexForm(currentIndexForm - 1);
                    return;
                  }
                  fn();
                  toast.success('Submitting Response...');
                }}
              />
            )}
            {step?.isEnd === false && (
              <Section
                hideNextButton={step.hide_next_button}
                isIntro={step?.isIntro}
                isEnd={step?.isEnd}
                content={step.content}
                onNextStep={() => {
                  setNewCurrentIndexForm(currentIndexForm + 1);
                }}
              />
            )}
          </div>
        );
      case 'question':
        return (
          <div className="h-full w-full">
            <Question
              control={control}
              setValue={setValue}
              getValues={getValues}
              register={register}
              questionId={step.question_id}
              title={step.title}
              subtitle={step.subtitle}
              content={step.content}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full">
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          color="inherit"
          value={(currentIndexForm / (stepsData.length - 1)) * 100}
        />
      </Box>
      <div className="h-full w-full overflow-hidden relative">
        <div className="step-wrapper" style={{ minHeight: '75vh' }}>
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={currentIndexForm}
              addEndListener={(node, done) => {
                node.addEventListener('transitionend', done, false);
              }}
              classNames={classNameState}
            >
              {generateFormStep(stepsData[currentIndexForm])}
            </CSSTransition>
          </SwitchTransition>
        </div>
        {stepsData[currentIndexForm].type === 'question' && (
          <div className="flex pb-3 justify-center">
            <div className="transition-all duration-300 ease">
              <div className="relative mb-3 overflow-hidden rounded-full px-5 bg-white shadow-card transition-all last:mb-0 hover:shadow-md dark:bg-light-dark">
                <div className="flex flex-row relative h-auto cursor-pointer items-center gap-3 py-4 sm:h-20 sm:grid-cols-3 sm:gap-6 sm:py-0 ">
                  <Text className="text-slate-400 hidden sm:hidden md:hidden lg:block xl:block 2xl:block ">
                    Sensitivity Score -
                  </Text>
                  <Text
                    className="text-slate-400 block sm:block md:block lg:hidden xl:hidden 2xl:hidden "
                    tooltip="Sensitivity Score"
                  >
                    SS -
                  </Text>
                  <Text> {stepsData[currentIndexForm].privacySetting}</Text>
                  <div className="h-8 w-px bg-gray-300 sm:block hidden"></div>
                  {answer_types?.map(
                    (
                      item,
                      index, // Include index in the map function
                    ) => (
                      <div
                        className={cn(
                          'inline-flex',
                          stepsData[currentIndexForm].allowedResp[index]
                            ? 'pointer-events-auto'
                            : 'pointer-events-none',
                        )}
                        key={item?.id}
                        onClick={() => {
                          updateState(index); // Pass index to updateState
                        }}
                      >
                        <ListCard
                          item={item}
                          textClassName="hidden sm:hidden md:hidden lg:block xl:block 2xl:block"
                          className={cn(
                            'rounded-full p-2  hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                            AnsType &&
                              AnsType[currentIndexForm] !== undefined &&
                              AnsType[currentIndexForm] == index // Check if state[index] is true
                              ? 'text-gray-900 bg-gray-300 dark:text-white dark:border-white'
                              : 'text-gray-300 bg-gray-100',
                          )}
                          imageClassName={cn(
                            'hover:opacity-100 dark:',
                            AnsType &&
                              AnsType[currentIndexForm] !== undefined &&
                              AnsType[currentIndexForm] == index
                              ? 'opacity-100 dark:fill-white'
                              : 'opacity-25 dark:fill-slate-500',
                          )}
                        />
                      </div>
                    ),
                  )}
                  {/* </div> */}
                  <Tooltip id="my-tooltip-multiline" />
                  <div className="h-8 w-px bg-gray-300 sm:block hidden"></div>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10"
                      type="button"
                      onClick={() =>
                        setNewCurrentIndexForm(currentIndexForm - 1)
                      }
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"></path>
                      </svg>
                    </button>
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10"
                      type="button"
                      onClick={() => {
                        const currentStep = stepsData[currentIndexForm];
                        const values = getValues(
                          currentStep.question_id.toString(),
                        );
                        if (
                          currentStep.type == 'question' &&
                          currentStep.content[0].type == 'checkbox'
                        ) {
                          if (values.length == 0 && currentStep.required) {
                            toast.error(
                              'Please select atleast one option',
                              'error',
                            );
                            return;
                          }
                        } else {
                          if (
                            (!values || Object.keys(values).length == 0) &&
                            currentStep.required
                          ) {
                            toast.error('Its required to answer this question');
                            return;
                          }
                        }
                        const valofquestion = getValues(
                          stepsData[currentIndexForm].question_id.toString(),
                        );
                        console.log('valofquestion', valofquestion);

                        if (
                          AnsType[stepsData[currentIndexForm].question_id] ==
                            undefined &&
                          currentStep.required
                        ) {
                          toast.error(
                            'Please select how would you like to share this data',
                          );
                          return;
                        }
                        if (
                          AnsType[stepsData[currentIndexForm].question_id] ==
                            undefined &&
                          !currentStep.required &&
                          valofquestion != undefined &&
                          valofquestion != '' &&
                          valofquestion != null &&
                          valofquestion != [] &&
                          Object.keys(valofquestion).length !== 0
                        ) {
                          toast.error(
                            'You must choose how would you like to answer this question',
                          );
                          return;
                        }
                        setNewCurrentIndexForm(currentIndexForm + 1);
                      }}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
