'use client';
import FormBuilder from '@/components/form-viewer';
import { useContext, useState, useEffect } from 'react';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { useEthereum } from '@/app/shared/web3-provider';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { useModal } from '@/components/modal-views/context';
import { m } from 'framer-motion';
import {
  reverseFormattedOptionObject,
  bytes32ToString,
} from '@/app/shared/utils';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import { readIPFS } from '@/app/shared/ipfs';
import {
  isActiveProfileOrganisationAtom,
  totalRewardsAtom,
} from '@/stores/atoms';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useRouter } from 'next/navigation';

export default function RespondantSurveyPage({
  params,
}: {
  params: {
    surveyId: string;
  };
}) {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  const [rewards, setRewards] = useRecoilState(totalRewardsAtom);
  if (isActiveProfileOrganisation) {
    router.push('/');
  }
  const { surveyId } = params;
  const [actionHappening, setActionHappening] = useState(
    'Verifying your eligibility...',
  );
  const [verifyingParticipation, setVerifyingParticipation] = useState(true);
  const [stepData, setStepData] = useState(null);
  const { checkEtherBalance, checkERC20Balance, hasERC721Balance } =
    useEthereum();
  const {
    checkRespondantOnChainFilters,
    getRespondantViewOfSurvey,
    decodeString,
  } = useContext(SurveyContractContext);
  const { getSurveyBalance } = useContext(GaslessContractContext);
  const { currentAccount } = useContext(SignerProviderContext);
  const { openModal } = useModal();
  useEffect(() => {
    const insidefn = async () => {
      var filters = [];

      try {
        filters = await checkRespondantOnChainFilters(Number(surveyId));
      } catch {
        toast.error('Sorry You can not answer this survey!');
        router.push('/surveys');
        return;
      }

      var all_filters_resolved_true = true;

      if (filters.length > 0) {
        const filterResults = await Promise.all(
          filters.map(async (filter) => {
            if (filter.filter_type === 0) {
              return true; // Continue for type 0 filter
            } else {
              if (filter.filter_type === 2) {
                // coin reserve
                if (filter.token_reserve_selectedToken == 1) {
                  // rose coin
                  const balanceRequired = Number(
                    ethers.utils.formatEther(
                      Number(filter.token_reserve_minAmount),
                    ),
                  );
                  const currentBalance = Number(
                    await checkEtherBalance(23295, currentAccount),
                  );
                  return currentBalance >= balanceRequired;
                } else if (filter.token_reserve_selectedToken == 2) {
                  // ether coin
                  const balanceRequired = Number(
                    ethers.utils.formatEther(
                      Number(filter.token_reserve_minAmount),
                    ),
                  );
                  const currentBalance = Number(
                    await checkEtherBalance(5, currentAccount),
                  );
                  return currentBalance >= balanceRequired;
                } else if (filter.token_reserve_selectedToken == 0) {
                  // other erc20 token
                  const balanceRequired = Number(
                    ethers.utils.formatEther(
                      Number(filter.token_reserve_minAmount),
                    ),
                  );
                  const contractAddress = filter.token_reserve_contractAddress;
                  const chain = filter.token_reserve_selectedChain;
                  if (chain == 1) {
                    // sapphire chain
                    const currentBalance = Number(
                      await checkERC20Balance(
                        23295,
                        contractAddress,
                        currentAccount,
                      ),
                    );
                    return currentBalance >= balanceRequired;
                  } else if (chain == 2) {
                    // ethereum chain
                    const currentBalance = Number(
                      await checkERC20Balance(
                        5,
                        contractAddress,
                        currentAccount,
                      ),
                    );
                    return currentBalance >= balanceRequired;
                  }
                }
              } else if (filter.filter_type === 3) {
                // NFT Token reserve
                const contractAdd = filter.nft_token_nftContractAddress;
                const chain = filter.nft_token_selectedchain;
                if (chain == 1) {
                  // sapphire chain
                  const currentBalance = Number(
                    await hasERC721Balance(23295, contractAdd, currentAccount),
                  );
                  return currentBalance >= 1;
                } else {
                  const currentBalance = Number(
                    await hasERC721Balance(5, contractAdd, currentAccount),
                  );
                  return currentBalance >= 1;
                }
              }
            }
          }),
        );
        // Check if all filter results are true
        all_filters_resolved_true = filterResults.every((result) => result);
      }

      var resp = undefined;
      if (all_filters_resolved_true) {
        const survBal = await getSurveyBalance(Number(surveyId));
        try {
          const survBal = await getSurveyBalance(Number(surveyId));
          // check if survBal is less than 1 ether
          const oneEtherInWei = 10 ** 18;
          if (survBal < oneEtherInWei) {
            toast.error(
              'Sorry the survey does not have enough tokens to pay for response!',
            );
            router.push('/surveys');
            return;
          }
          resp = await getRespondantViewOfSurvey(Number(surveyId));
        } catch {
          toast.error('Error requesting survey data!');
          router.push('/surveys');
          return;
        }
      } else {
        toast.error('Sorry You do not meet the requirements set in Survey!');
        router.push('/surveys');
        return;
      }

      if (resp) {
        openModal('DCA_STEPPER');
        setActionHappening('Survey data received! Decoding the survey....');
        //create empty stepData list
        var stepData = [];
        //format survey data received
        //format title from response
        var is_survey_private = false;
        //check if surveyNonce is empty bytes32 string
        if (
          resp.surveyNonce !=
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        ) {
          is_survey_private = true;
        }
        var title = await reverseFormattedOptionObject({
          option: resp.surveyTitle,
          optionIPFSHash: resp.surveyTitleIPFS,
        });
        // resolve survey Intro
        var intro = (await readIPFS(resp.surveyIntroIPFS)).introString;
        //decode the intro
        if (is_survey_private) {
          intro = await decodeString(intro, resp.surveyNonce);
        }
        console.log(intro);
        var orgUsername = bytes32ToString(resp.orgUserName);
        var surveyNonce = resp.surveyNonce;
        // intro stepdata object
        var step1 = {
          id: 1,
          type: 'section',
          isIntro: true,
          isEnd: false,
          content: [
            { type: 'text', isTitle: true, isOrgName: false, value: title },
            { type: 'text', isTitle: false, isOrgName: false, value: intro },
            {
              type: 'text',
              isTitle: false,
              isOrgName: true,
              value: orgUsername,
            },
          ],
        };

        stepData.push(step1);
        // Parallelize the async calls within the loop
        await Promise.all(
          resp.questionsData.map(async (question, i) => {
            // create question stepData obj
            var questionStepData = {
              id: i + 2,
              question_id: i + 1,
              type: 'question',
            };
            //get question string
            var questionString = (await readIPFS(question.questionIPFSHash))
              .questionString;
            if (is_survey_private) {
              //decode the questionstring
              questionString = await decodeString(questionString, surveyNonce);
            }
            questionStepData['title'] = questionString;
            if (question.isMandatory) {
              questionStepData['subtitle'] = 'This question is mandatory';
              questionStepData['required'] = true;
            } else {
              questionStepData['required'] = false;
              questionStepData['subtitle'] = '';
            }
            questionStepData['allowedResp'] = question.answerTypeAllowed;
            questionStepData['privacySetting'] = question.privacyLevelRating;
            questionStepData['content'] = [{}];
            //get question type
            if (question.qType == 0) {
              questionStepData['content'][0]['type'] = 'radio';
            } else if (question.qType == 1) {
              questionStepData['content'][0]['type'] = 'checkbox';
            } else if (question.qType == 2) {
              questionStepData['content'][0]['type'] = 'input';
            } else if (question.qType == 3) {
              questionStepData['content'][0]['type'] = 'range';
            }
            questionStepData['content'][0]['values'] = [];
            if (question.qType == 0 || question.qType == 1) {
              for (
                var j = 0;
                j < question.selectedOptionsIndexOptionString.length;
                j++
              ) {
                var option =
                  question.selectedOptionsIndexOptionString[j].option;
                var optionIPFSHash =
                  question.selectedOptionsIndexOptionString[j].optionIPFSHash;
                var optionString = await reverseFormattedOptionObject({
                  option: option,
                  optionIPFSHash: optionIPFSHash,
                });
                questionStepData['content'][0]['values'].push({
                  id: j,
                  label: optionString,
                });
              }
            } else if (question.qType == 3) {
              questionStepData['content'][0]['placeholder'] =
                'Your Response goes here...';
            }
            stepData.push(questionStepData);
          }),
        );

        var endStepData = {
          id: stepData.length + 1,
          type: 'section',
          should_save: true,
          hide_next_button: true,
          isIntro: false,
          isEnd: true,
          content: [
            {
              type: 'text',
              isTitle: true,
              value: 'Thank you participating in the survey!',
            },
            {
              type: 'text',
              isTitle: false,
              value:
                'Your response will only be saved if you have verified your Humanity.',
            },
          ],
        };
        //arrange stepdata array based on id
        stepData.push(endStepData);
        stepData.sort((a, b) => a.id - b.id);
        setStepData(stepData);
        setVerifyingParticipation(false);
      }
    };
    insidefn();
    setRewards(0);
    return () => {
      setStepData(null);
      setRewards(0);
    };
  }, []);

  return (
    <>
      {verifyingParticipation && (
        // show loading button in the center of page and below it show, verifying your eligibility
        <div className="flex flex-col justify-center items-center h-[80%]">
          <Box sx={{ width: '80%' }}>
            <LinearProgress />
          </Box>
          <p className="text-center pt-4">{actionHappening}</p>
        </div>
      )}
      {stepData && <FormBuilder stepsData={stepData} surveyId={surveyId} />}
    </>
  );
}
