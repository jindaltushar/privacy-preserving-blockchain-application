'use client';
import { useState, useContext } from 'react';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  surveyAudienceAtom,
  isActiveProfileOrganisationAtom,
  nodesAtom,
  masterSettingsAtom,
  showSurveyFinalCreatePageAtom,
  SurveyIntroTextAtom,
} from '@/stores/atoms';
import { toast } from 'sonner';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { sendJSONToIPFS } from '@/app/shared/ipfs';
import {
  QuestionInstance,
  AudienceFilterRequest,
  surveyCreationRequest,
} from '@/app/shared/types';
export type Steps = 'CREATE_QUESTIONS' | 'CREATE_OPTIONS' | 'CREATE_SURVEY';

import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { stringToBytes32, formattedOptionObject } from '@/app/shared/utils';
import {
  IPFSHash,
  questionCreateRequest,
  OptionsToCreate,
} from '@/app/shared/types';

export default function SurveySubmit() {
  const {
    encodeString,
    createQuestions,
    createOptions,
    verifySurveyBeforeCreating,
    createSurvey,
  } = useContext(SurveyContractContext);
  const [surveyAudience, setSurveyAudience] =
    useRecoilState(surveyAudienceAtom);
  const [isActiveProfileOrganisation, setIsActiveProfileOrganisation] =
    useRecoilState(isActiveProfileOrganisationAtom);
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const [surveyIntroText, setSurveyIntroText] =
    useRecoilState(SurveyIntroTextAtom);
  const [masterSettings, setMasterSettings] =
    useRecoilState(masterSettingsAtom);
  const [showSurveyFinalCreatePage, setShowSurveyFinalCreatePage] =
    useRecoilState(showSurveyFinalCreatePageAtom);
  const [isAnalysed, setIsAnalysed] = useState(false);

  const [questionsToCreateState, setQuestionsToCreateState] = useState([]);
  const [questionsToCreateNodeIndexMap, setQuestionsToCreateNodeIndexMap] =
    useState([]);
  const [optionsToCreateState, setOptionsToCreateState] = useState([]);
  const [optionsToCreateNodeIndexMap, setOptionsToCreateNodeIndexMap] =
    useState([]);

  const router = useRouter();
  const { currentProfileSelected } = useContext(ProfileContractContext);
  const [stepsNeedtoPerform, setStepsNeedtoPerform] = useState<Steps[]>([]);
  const [currentAction, setCurrentAction] = useState('ANALYSE');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [hasToCreateQuestions, setHasToCreateQuestions] = useState(false);
  const [hasToCreateOptions, setHasToCreateOptions] = useState(false);
  const [hasSurveyCreated, setHasSurveyCreated] = useState(false);
  useEffect(() => {
    console.log('currentProfileSelected', currentProfileSelected);
    console.log('surveyAudience', surveyAudience);
  }, []);
  async function getNewQuestionToCreate() {
    var questionsToCreate: questionCreateRequest[] = [];
    var nodeIndex: number[] = [];
    toast.loading('Analysing Survey...', {
      id: 'getNewQuestionToCreate',
    });
    for (let i = 0; i < nodes.length; i++) {
      // check questionId exists in data or if questionId is null
      if (!nodes[i].data?.questionId) {
        // get question type based no node type, if radio then 1, if checkbox then 2, if text then 3, if range then 4
        // set question type to 0 if none of the above
        var type: number;

        switch (nodes[i].type) {
          case 'radio':
            type = 0;
            break;
          case 'checkbox':
            type = 1;
            break;
          case 'text':
            type = 2;
            break;
          case 'range':
            type = 3;
            break;
          default:
            type = 4;
        }
        if (type === 4) {
          toast.error(
            `Question type not supported, Please check the question at index ${i}`,
            { id: 'getNewQuestionToCreate' },
          );
          return false;
        }
        // require if type is 1 or 2 then optionOptions of data length should  be greater than 2
        if (
          (type === 1 || type === 2) &&
          nodes[i].data?.optionOptions?.length < 2
        ) {
          toast.error(
            `Questions of type checkbox or radio should have atleast 2 options, Please check the question at index ${i}`,
            { id: 'getNewQuestionToCreate' },
          );
          return false;
        }
        var nonce = stringToBytes32('');
        var questionipfs: IPFSHash = { digest: '', hashFunction: 0, size: 0 };
        if (masterSettings.is_survey_private) {
          const res = await encodeString(nodes[i].data.qn);
          console.log('encoded option response :', res);
          const ques = res.cipher;
          nonce = res.nonce;
          questionipfs = await sendJSONToIPFS({ questionString: ques });
        } else {
          questionipfs = await sendJSONToIPFS({
            questionString: nodes[i].data.qn,
          });
        }
        let questionToCreate: questionCreateRequest = {
          questionType: type,
          isPrivate: masterSettings.is_survey_private,
          ipfsHashDigest: questionipfs.digest,
          ipfsHashHashFunction: questionipfs.hashFunction,
          ipfsHashSize: questionipfs.size,
          questionNonce: nonce,
          QuestionOptionsBytes32: [],
          QuestionOptionipfsHashDigest: [],
          QuestionOptionipfsHashHashFunction: [],
          QuestionOptionipfsHashSize: [],
        };
        if (nodes[i].data.optionOptions?.length > 0) {
          for (let j = 0; j < nodes[i].data.optionOptions?.length; j++) {
            const option = nodes[i].data.optionOptions[j];
            const res = await formattedOptionObject(option);
            questionToCreate.QuestionOptionsBytes32.push(res.option);
            questionToCreate.QuestionOptionipfsHashDigest.push(
              res.optionIPFSHash.digest,
            );
            questionToCreate.QuestionOptionipfsHashHashFunction.push(
              res.optionIPFSHash.hashFunction,
            );
            questionToCreate.QuestionOptionipfsHashSize.push(
              res.optionIPFSHash.size,
            );
          }
        }
        questionsToCreate.push(questionToCreate);
        nodeIndex.push(i);
      }
    }
    toast.success('Analysed....', { id: 'getNewQuestionToCreate' });
    setQuestionsToCreateState(questionsToCreate);
    console.log('questionsToCreate', questionsToCreate);
    setQuestionsToCreateNodeIndexMap(nodeIndex);
    if (questionsToCreate.length > 0) {
      setStepsNeedtoPerform([...stepsNeedtoPerform, 'CREATE_QUESTIONS']);
    }
  }

  async function getNewOptionsToCreate() {
    let optionsList: OptionsToCreate[] = [];
    let optionsToCreateNodeIndexMap: number[][] = [];
    toast.loading('Finalising....', { id: 'getNewOptionsToCreate' });
    for (let i = 0; i < nodes.length; i++) {
      if (
        nodes[i].data?.questionId != null ||
        nodes[i].data?.questionId != undefined
      ) {
        let options: OptionsToCreate[] = [];
        var questionId = nodes[i].data?.questionId;
        var questionType = nodes[i].type;
        if (questionType === 'radio' || questionType === 'checkbox') {
          var optionsStrings = nodes[i].data.optionOptions;
          if (optionsStrings?.length > 0) {
            for (let j = 0; j < optionsStrings.length; j++) {
              var res = await formattedOptionObject(optionsStrings[j]);
              var option: OptionsToCreate = {
                questionId: questionId,
                optionString: res.option,
                optionDigest: res.optionIPFSHash.digest,
                optionHashFunction: res.optionIPFSHash.hashFunction,
                optionSize: res.optionIPFSHash.size,
              };
              options.push(option);
              optionsToCreateNodeIndexMap.push([i, j]);
            }
          }
        }
        optionsList.push(...options);
      }
    }
    setOptionsToCreateState(optionsList);
    setOptionsToCreateNodeIndexMap(optionsToCreateNodeIndexMap);
    console.log('optionsList', optionsList);
    toast.success('Done...', { id: 'getNewOptionsToCreate' });
    if (optionsList.length > 0) {
      setStepsNeedtoPerform([...stepsNeedtoPerform, 'CREATE_OPTIONS']);
    }
  }

  useEffect(() => {
    console.log('from submitsurvey');
    console.log('surveyAudience', surveyAudience);
    console.log('isActiveProfileOrganisation', isActiveProfileOrganisation);
    console.log('nodes', nodes);
    console.log('masterSettings', masterSettings);
    console.log('surveyIntroText', surveyIntroText);
  }, [showSurveyFinalCreatePage]);

  const handleSendOptionsClick = async () => {
    const results = await createOptions(optionsToCreateState);

    // Organize results based on node indices
    const resultsByNodeIndex = {};
    results.data.forEach((result, index) => {
      const [i, j] = optionsToCreateNodeIndexMap[index];
      if (!resultsByNodeIndex[i]) {
        resultsByNodeIndex[i] = [];
      }
      resultsByNodeIndex[i].push([Number(result), j]);
    });

    const updateNodes = async () => {
      // Update nodes based on organized results
      setNodes((prev) => {
        const newNodes = [...prev];
        Object.keys(resultsByNodeIndex).forEach((index) => {
          const i = parseInt(index);
          const values = resultsByNodeIndex[index];
          //create a list of ans
          let newoptionsList = [];
          let anslist = [];
          values.forEach((value) => {
            newoptionsList.push({
              index: value[0],
              optionString: nodes[i].data.optionOptions[value[1]],
            });
            anslist.push(value[0]);
          });
          const elem = newNodes[i] as any;
          var oprion;
          if (elem.data.optionStrings) {
            oprion = elem.data.optionStrings;
          } else {
            oprion = [];
          }
          const updatedNode = {
            type: elem.type,
            data: {
              ...elem.data,
              ans: [...elem.data.ans, ...anslist], // Append ansList to existing ans array
              optionStrings: [...oprion, ...newoptionsList],
            },
          };
          newNodes[i] = updatedNode;
        });
        return newNodes;
      });
    };

    // Call the function to update nodes
    await updateNodes();
    setHasToCreateOptions(false);
  };

  const handleQuestionsSendClick = async () => {
    const results = await createQuestions(questionsToCreateState);
    const updateNodes = async (results) => {
      const updatedNodes = await Promise.all(
        results.data.map(async (result, index) => {
          if (result.questionId == 0) {
            toast.error(
              `Error creating question at index ${questionsToCreateNodeIndexMap[index]}`,
            );
            return null;
          }
          const elem = nodes[questionsToCreateNodeIndexMap[index]] as any;

          const updatedNode = {
            type: elem.type,
            data: {
              ...elem.data,
              questionId: Number(result.questionId),
              ans: Array.from(Array(elem.data?.optionOptions?.length).keys()),
            },
          };

          // Simulate delay
          await new Promise((resolve) => setTimeout(resolve, 100));

          return updatedNode;
        }),
      );

      // Filter out null values (error cases)
      const filteredNodes = updatedNodes.filter((node) => node !== null);

      setNodes((prev) => {
        const newNodes = [...prev];
        filteredNodes.forEach((node, index) => {
          newNodes[questionsToCreateNodeIndexMap[index]] = node;
        });
        return newNodes;
      });
    };
    // Call the function passing results
    updateNodes(results);
    setHasToCreateQuestions(false);
  };

  const handleSendSurveyClick = async () => {
    // create QuestionInstance list
    var questionInstanceList: QuestionInstance[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].data?.questionId != null) {
        var answerTypeAllowed: [boolean, boolean, boolean] = [
          false,
          false,
          false,
        ];
        if (nodes[i].data.answerTypeAllowed[0] == true) {
          answerTypeAllowed[0] = true;
        }
        if (nodes[i].data.answerTypeAllowed[1] == true) {
          answerTypeAllowed[1] = true;
        }
        if (nodes[i].data.answerTypeAllowed[2] == true) {
          answerTypeAllowed[2] = true;
        }
        if (nodes[i].type == 'text') {
          answerTypeAllowed = [false, false, true];
        }
        if (masterSettings.is_survey_private) {
          answerTypeAllowed = [false, false, true];
        }
        if (
          !nodes[i].data.answerTypeAllowed[0] &&
          !nodes[i].data.answerTypeAllowed[1] &&
          !nodes[i].data.answerTypeAllowed[2] &&
          !masterSettings.is_survey_private
        ) {
          answerTypeAllowed = [true, true, true];
        }
        let questionInstance: QuestionInstance = {
          questionId: nodes[i].data.questionId,
          selectedOptionsIndex: nodes[i].data.ans ? nodes[i].data.ans : [],
          isMandatory: nodes[i].data.required,
          answerTypeAllowed: answerTypeAllowed,
          privacyLevelRating: nodes[i].data.privacySetting,
        };
        questionInstanceList.push(questionInstance);
      }
    }
    //create AudienceFilterRequest List
    var audienceFilterRequestList: AudienceFilterRequest[] = [];
    for (let i = 0; i < surveyAudience.length; i++) {
      //create empty AudienceFilterRequest
      let audienceFilterRequest: AudienceFilterRequest = {
        filter_type: 0,
        address_list: [],
        prev_response_value_questionId: 0,
        prev_response_value_matchType: 0,
        prev_response_value_options: [],
        token_reserve_selectedToken: 0,
        token_reserve_minAmount: 0,
        token_reserve_selectedChain: 0,
        token_reserve_contractAddress:
          '0x0000000000000000000000000000000000000000',
        nft_token_selectedchain: 0,
        nft_token_nftContractAddress:
          '0x0000000000000000000000000000000000000000',
        survey_answered_id: 0,
        active: true,
      };

      var filter_type = surveyAudience[i].filter_type;
      var filter_type_int = 0;

      switch (filter_type.value) {
        case 'address':
          filter_type_int = 0;
          break;
        case 'prev_resp':
          filter_type_int = 1;
          break;
        case 'token_balance':
          filter_type_int = 2;
          break;
        case 'holds_nft':
          filter_type_int = 3;
          break;
        case 'survey_answered':
          filter_type_int = 4;
          break;
        default:
          filter_type_int = 0;
      }
      audienceFilterRequest.filter_type = filter_type_int;
      if (filter_type_int == 0) {
        audienceFilterRequest.address_list = surveyAudience[i].address_list;
      }
      if (filter_type_int == 1) {
        var matchType = 0;
        if (
          surveyAudience[i]?.prev_response_value_matchType?.value == 'equals'
        ) {
          matchType = 0;
        } else {
          matchType = 1;
        }
        audienceFilterRequest.prev_response_value_questionId =
          surveyAudience[i].prev_response_value_questionId;
        audienceFilterRequest.prev_response_value_matchType = matchType;
        var optionsToSend = [];
        if (
          surveyAudience[i].prev_response_value_matchType?.value != 'equals'
        ) {
          for (
            let j = 0;
            j < surveyAudience[i].prev_response_selectedOptions.length;
            j++
          ) {
            optionsToSend.push(
              Number(surveyAudience[i].prev_response_selectedOptions[j].value),
            );
          }
        } else {
          // @ts-ignore
          optionsToSend = [
            // @ts-ignore
            Number(surveyAudience[i].prev_response_selectedOptions.value),
          ];
        }
        audienceFilterRequest.prev_response_value_options = optionsToSend;
      }
      if (filter_type_int == 2) {
        var selectedToken = 0;
        if (surveyAudience[i]?.token_reserve_selectedToken?.value == 'rose') {
          selectedToken = 1;
        } else if (
          surveyAudience[i]?.token_reserve_selectedToken?.value == 'eth'
        ) {
          selectedToken = 2;
        }
        var selectedChain = 0;
        if (
          surveyAudience[i]?.token_reserve_selectedChain?.value == 'sapphire'
        ) {
          selectedChain = 1;
        } else if (
          surveyAudience[i]?.token_reserve_selectedChain?.value == 'ethereum'
        ) {
          selectedChain = 2;
        }
        audienceFilterRequest.token_reserve_selectedToken = selectedToken;
        audienceFilterRequest.token_reserve_minAmount =
          surveyAudience[i].token_reserve_minAmount;
        audienceFilterRequest.token_reserve_selectedChain = selectedChain;
        if (selectedChain && selectedToken == 0) {
          if (surveyAudience[i].token_reserve_contractAddress == '') {
            toast.error(
              'Please set a token contract address in Token Reserve Filter',
            );
            return;
          }
          audienceFilterRequest.token_reserve_contractAddress =
            surveyAudience[i].token_reserve_contractAddress;
        }
      }
      if (filter_type_int == 3) {
        var selectedChain = 0;
        if (surveyAudience[i]?.nft_token_selectedchain?.value == 'sapphire') {
          selectedChain = 1;
        } else if (
          surveyAudience[i]?.nft_token_selectedchain?.value == 'ethereum'
        ) {
          selectedChain = 2;
        }
        audienceFilterRequest.nft_token_selectedchain = selectedChain;
        audienceFilterRequest.nft_token_nftContractAddress =
          surveyAudience[i].nft_token_nftContractAddress;
      }
      if (filter_type_int == 4) {
        audienceFilterRequest.survey_answered_id =
          surveyAudience[i].survey_answered_id;
      }
      audienceFilterRequestList.push(audienceFilterRequest);
    }
    //create surveyCreationRequest
    // format name of mastersettings, if name >32 bytes then create ipfs
    var surveyName = masterSettings.name;
    if (!surveyName) {
      toast.error('Please set a survey Title');
      return;
    }
    var surveyTitleObject = await formattedOptionObject(surveyName); // this will format survey title in either bytes32 or ipfshash
    var surveyNonce = stringToBytes32('');
    var surveyIntroTextToSend;
    // encode surveyIntroText if survey is private
    if (masterSettings.is_survey_private) {
      const res = await encodeString(surveyIntroText);
      console.log('encoded option response :', res);
      surveyIntroTextToSend = res.cipher;
      surveyNonce = res.nonce;
    } else {
      surveyIntroTextToSend = surveyIntroText;
    }
    // upload surveyIntroText to ipfs
    const surveyIntroTextIPFS = await sendJSONToIPFS({
      introString: surveyIntroTextToSend,
    });
    // survey validity
    var audsize = 0;
    var validtill = 0;
    if (
      masterSettings.has_valid_expiry &&
      masterSettings?.survey_validity_type == 'audienceSize'
    ) {
      if (masterSettings.survey_audience_size < 0) {
        toast.error('Survey audience size should be greater than 0');
        return;
      }
      audsize = masterSettings.survey_audience_size;
    } else if (
      masterSettings.has_valid_expiry &&
      masterSettings?.survey_validity_type == 'time'
    ) {
      if (masterSettings.survey_expiry_date.endDate) {
        // convert date to timestamp
        // check if endDate is greater than current date
        if (
          new Date(masterSettings.survey_expiry_date.endDate).getTime() <
          new Date().getTime()
        ) {
          toast.error('Survey expiry date should be greater than current date');
          return;
        }
        validtill = new Date(
          masterSettings.survey_expiry_date.endDate,
        ).getTime();
      }
    } else if (
      masterSettings.has_valid_expiry &&
      masterSettings?.survey_validity_type == 'both'
    ) {
      if (masterSettings.survey_expiry_date.endDate) {
        // convert date to timestamp
        // check if endDate is greater than current date
        if (
          new Date(masterSettings.survey_expiry_date.endDate).getTime() <
          new Date().getTime()
        ) {
          toast.error('Survey expiry date should be greater than current date');
          return;
        }
        validtill = new Date(
          masterSettings.survey_expiry_date.endDate,
        ).getTime();
      }
      if (masterSettings.survey_audience_size < 0) {
        toast.error('Survey audience size should be greater than 0');
        return;
      }
      audsize = masterSettings.survey_audience_size;
    }

    // create surveyCreationRequest
    var surveyCreationRequest: surveyCreationRequest = {
      titlesBytes: surveyTitleObject.option,
      titleIPFSDigest: surveyTitleObject.optionIPFSHash.digest,
      titleIPFSHashFunction: surveyTitleObject.optionIPFSHash.hashFunction,
      titleIPFSSize: surveyTitleObject.optionIPFSHash.size,
      surveyNonce: surveyNonce,
      descriptionIPFSDigest: surveyIntroTextIPFS.digest,
      descriptionIPFSHashFunction: surveyIntroTextIPFS.hashFunction,
      descriptionIPFSSize: surveyIntroTextIPFS.size,
      isSurveyPrivate: masterSettings.is_survey_private,
      surveyAudienceSize: audsize,
      surveyExpiryDate: validtill,
      publishOnMarketplace: masterSettings.publish_on_marketplace,
      createdBy: currentProfileSelected?.value?.organisationId,
      questions: questionInstanceList,
      audienceFilters: audienceFilterRequestList,
    };
    console.log('surveyCreationRequest', surveyCreationRequest);
    const surveyresp = await createSurvey(surveyCreationRequest);
    if (surveyresp) {
      setHasSurveyCreated(true);
      setSurveyAudience([]);
      setNodes([]);
    }
  };

  const handleButtonClick = async () => {
    console.log('handleButtonClick');
    setIsButtonDisabled(true);
    if (currentAction == 'ANALYSE') {
      await getNewQuestionToCreate();
      await getNewOptionsToCreate();

      console.log(
        'questionsToCreateNodeIndexMap',
        questionsToCreateNodeIndexMap,
      );
      console.log('optionsToCreateNodeIndexMap', optionsToCreateNodeIndexMap);
      setIsAnalysed(true);
      setCurrentAction('CREATE');
    } else if (currentAction == 'CREATE') {
      if (hasToCreateQuestions && !hasSurveyCreated) {
        await handleQuestionsSendClick();
      } else if (hasToCreateOptions && !hasSurveyCreated) {
        await handleSendOptionsClick();
      } else if (!hasSurveyCreated) {
        await handleSendSurveyClick();
      } else {
        router.push('/wallet');
      }
    }
    setIsButtonDisabled(false);
  };

  useEffect(() => {
    if (
      questionsToCreateNodeIndexMap.length == 0 &&
      optionsToCreateNodeIndexMap.length == 0
    ) {
      setHasToCreateOptions(false);
      setHasToCreateQuestions(false);
      setStepsNeedtoPerform([...stepsNeedtoPerform, 'CREATE_SURVEY']);
    }
    if (questionsToCreateNodeIndexMap.length > 0) {
      setHasToCreateQuestions(true);
      setStepsNeedtoPerform([...stepsNeedtoPerform, 'CREATE_QUESTIONS']);
    }
    if (optionsToCreateNodeIndexMap.length > 0) {
      setHasToCreateOptions(true);
      setStepsNeedtoPerform([...stepsNeedtoPerform, 'CREATE_OPTIONS']);
    }
  }, [questionsToCreateNodeIndexMap, optionsToCreateNodeIndexMap]);

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div>
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3
                  className="text-lg leading-6 text-center font-medium text-gray-900"
                  id="modal-headline"
                >
                  Final Steps
                </h3>
                <div className="mt-2">
                  <div className="text-sm text-gray-500 text-center">
                    {!isAnalysed && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `We need to analyse the survey to ensure everything's in order.<br />
                          Click 'Analyse Now' to start. Once analysed, no edits are possible. 
                          If needed, make edits before continuing.<br />(This may take a few 
                            seconds to complete..)<br/>"
                          `,
                        }}
                      />
                    )}
                    {isAnalysed && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `Perfect ! Everthing looks good .... <br /> Lets get started with the next steps.. <br/>`,
                        }}
                      />
                    )}
                    {isAnalysed && hasToCreateQuestions && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `We've identified <b>${questionsToCreateNodeIndexMap.length} questions</b> for creation. <br/>Click 'Create Questions' to begin. <br/>This action is irreversible and incurs gas fees, so ensure your wallet has sufficient balance.<br/> Note: The process may take up to a minute. <br/> `,
                        }}
                      />
                    )}
                    {isAnalysed &&
                      !hasToCreateQuestions &&
                      questionsToCreateNodeIndexMap.length > 0 &&
                      `${questionsToCreateNodeIndexMap.length} questions created successfully..`}
                    {isAnalysed &&
                      !hasToCreateQuestions &&
                      hasToCreateOptions && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              "We've found ${optionsToCreateNodeIndexMap.length} new questions. Click 'Create Options' to begin. <br/> Options will be created on the blockchain, preventing further edits. Ensure sufficient wallet balance for gas fees. <br/>(May take up to a minute to complete..)<br/>",
                          }}
                        />
                      )}

                    {isAnalysed &&
                      !hasToCreateQuestions &&
                      !hasToCreateOptions &&
                      optionsToCreateNodeIndexMap.length > 0 &&
                      `${optionsToCreateNodeIndexMap.length} questions were edited  successfully..`}
                    {isAnalysed &&
                      !hasToCreateQuestions &&
                      !hasToCreateOptions &&
                      !hasSurveyCreated &&
                      `Perfect! Almost There.. Click on "Create Survey" to submit your survey to blockchain. `}
                    {isAnalysed &&
                      !hasToCreateQuestions &&
                      !hasToCreateOptions &&
                      hasSurveyCreated && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `Your survey is now live. <br/>
                      Although you must add balance to the survey account to invite responses.<br/>
                      Please head to you wallet to transfer the gas.<br/>`,
                          }}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              className="w-full inline-flex justify-center rounded-md border border-transparent "
              // disabled={isButtonDisabled}
              isLoading={isButtonDisabled}
              onClick={() => {
                handleButtonClick();
              }}
            >
              {currentAction == 'ANALYSE' &&
                isButtonDisabled == false &&
                `Analyse Now `}
              {currentAction == 'ANALYSE' &&
                isButtonDisabled == true &&
                `Analyzing... `}
              {currentAction == 'CREATE' &&
                hasToCreateQuestions &&
                hasToCreateOptions &&
                `Create Questions`}
              {currentAction == 'CREATE' &&
                hasToCreateQuestions &&
                !hasToCreateOptions &&
                `Create Questions`}
              {currentAction == 'CREATE' &&
                !hasToCreateQuestions &&
                hasToCreateOptions &&
                `Create Options`}
              {currentAction == 'CREATE' &&
                !hasToCreateQuestions &&
                !hasToCreateOptions &&
                !hasSurveyCreated &&
                `Create Survey`}
              {currentAction == 'CREATE' &&
                !hasToCreateQuestions &&
                !hasToCreateOptions &&
                hasSurveyCreated &&
                `Head To Wallet`}
            </Button>
          </div>
        </div>
      </div>

      {/* <h1>Survey Submit</h1>
      <button
        onClick={async () => {
          await getNewQuestionToCreate();
          await getNewOptionsToCreate();
          console.log(
            'questionsToCreateNodeIndexMap',
            questionsToCreateNodeIndexMap,
          );
          console.log(
            'optionsToCreateNodeIndexMap',
            optionsToCreateNodeIndexMap,
          );
        }}
      >
        Submit Survey
      </button>
      {stepsNeedtoPerform.includes('CREATE_QUESTIONS') && (
        <button onClick={handleQuestionsSendClick}>create questions</button>
      )}
      {stepsNeedtoPerform.includes('CREATE_OPTIONS') && (
        <button onClick={handleSendOptionsClick}>create options</button>
      )}
      {stepsNeedtoPerform.includes('CREATE_SURVEY') && (
        <button onClick={handleSendSurveyClick}>create survey</button>
      )}
      <button
        onClick={() => {
          console.log('nodes', nodes);
        }}
      >
        Show Nodes
      </button>
      <button
        onClick={() => {
          console.log('surveyAudience', surveyAudience);
        }}
      >
        Show Audience
      </button> */}
    </div>
  );
}
