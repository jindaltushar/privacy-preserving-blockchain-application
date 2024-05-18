'use client';

import React, { useEffect, useState, useContext, ReactNode } from 'react';
import {
  bytes32ToString,
  reverseFormattedOptionObject,
  stringToBytes32,
} from '@/app/shared/utils';
import { ethers } from 'ethers';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import {
  SurveyContractABI,
  SurveyContractAddress,
} from '@/contracts/constants';
import { selectedProfileAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { toast } from 'sonner';
import {
  QuestionOption,
  questionCreateRequest,
  OptionsToCreate,
  surveyCreationRequest,
  SurveyCreatedResponse,
  MinimalSurveyView,
  QuestionInstanceStructForOrganisationSurveyView,
  AudienceFilterStructForOrganisationSurveyView,
  Survey,
  IPFSHash,
  SurveyStatus,
  AnswersOfAQuestionStruct,
  SurveyInfoStruct,
  SurveyResponseViewForRespondantStruct,
  SurveyStatusAndPrivacyInfo,
  QuestionType,
  viewMySurveyResponseStruct,
} from '@/app/shared/types';
import { readIPFS } from '@/app/shared/ipfs';
import { reportSuccessfulRewards } from '@/app/shared/central-server';
interface SurveyContractProviderProps {
  children: ReactNode;
}

interface SurveyContractContextValue {
  surveyReader: any; // Replace 'any' with the actual type of your surveyReader
  surveyWriter: any; // Replace 'any' with the actual type of your surveyWriter
  getQuestionOptions: (questionId: number) => Promise<QuestionOption[]>;
  encodeString: (data: string) => Promise<{ cipher: string; nonce: string }>;
  createQuestions: (questions: questionCreateRequest[]) => Promise<any>;
  createOptions: (options: OptionsToCreate[]) => Promise<any>;
  verifySurveyBeforeCreating: (
    request: surveyCreationRequest,
  ) => Promise<boolean>;
  createSurvey: (
    surveyCreationRequest: surveyCreationRequest,
  ) => Promise<SurveyCreatedResponse>;
  getAllSurveysOfOrganisation: () => Promise<MinimalSurveyView[]>;
  getOrganisationViewofSurvey: (surveyId: number) => Promise<{
    surveyData: Survey;
    questionsData: QuestionInstanceStructForOrganisationSurveyView[];
    audienceFiltersData: AudienceFilterStructForOrganisationSurveyView[];
    surveyIDencrypted: string;
  }>;
  canAnswerSurvey: (surveyId: number) => Promise<string>;
  checkRespondantOnChainFilters: (
    surveyId: number,
  ) => Promise<AudienceFilterStructForOrganisationSurveyView[]>;
  getRespondantViewOfSurvey: (surveyId: number) => Promise<{
    surveyTitle: string;
    surveyTitleIPFS: IPFSHash;
    surveyIntroIPFS: IPFSHash;
    surveyNonce: string;
    orgUserName: string;
    questions: QuestionInstanceStructForOrganisationSurveyView[];
  }>;
  decodeString: (ciphertext: string, nonce: string) => Promise<string>;
  encodeTextAnswer: (
    surveyId: number,
    text: string,
  ) => Promise<{ cypherForOrganisation: string; cypherForUser: string }>;
  decodeTextAnswerForOrganisation: (cypher: string) => Promise<string>;
  decodeTextAnswerForUser: (cypher: string) => Promise<string>;
  SubmitAnswerToSurvey: (
    surveyId: number,
    questionIndex: number[],
    answerHashIPFSDigest: string[],
    answerHashIPFSHashFunction: number[],
    answerHashIPFSHashSize: number[],
    optionIndexes: number[][],
    ansType: number[],
  ) => Promise<any>;
  getAnswersOfQuestionInSurvey: (
    surveyId: number,
    questionId: number,
  ) => Promise<AnswersOfAQuestionStruct[]>;
  SubmitAnswerToSurveyGasless: (
    surveyId: number,
    questionIndex: number[],
    answerHashIPFSDigest: string[],
    answerHashIPFSHashFunction: number[],
    answerHashIPFSHashSize: number[],
    optionIndexes: number[][],
    ansType: number[],
  ) => Promise<any>;
  editSurvey: (
    surveyId: number,
    status: SurveyStatus,
    addressList: string[],
    new_audience_size: number,
    new_expiry_time: number,
  ) => Promise<boolean>;
  getSurveysActiveStatus: () => Promise<SurveyStatusAndPrivacyInfo[]>;
  getMyPrivateInvitations: () => Promise<number[]>;
  getMyAnsweredSurveys: () => Promise<number[]>;
  getSurveyBasicInfo: (
    surveyId: number,
    getAnsweredTime: boolean,
  ) => Promise<SurveyInfoStruct>;
  viewMySurveyResponse: (
    surveyId: number,
  ) => Promise<viewMySurveyResponseStruct[]>;
  totalSurveys: () => Promise<number>;
  revokeAccess: (surveyId: number) => Promise<boolean>;
  getMyNotifications: () => Promise<{ user: string; surveyId: number }[]>;
}

export const SurveyContractContext =
  React.createContext<SurveyContractContextValue>(
    {} as SurveyContractContextValue,
  );

export const SurveyContractProvider: React.FC<SurveyContractProviderProps> = ({
  children,
}) => {
  const { signerProvider, currentAccount, fetchContract, createSignature } =
    useContext(SignerProviderContext);
  var { gaslessReader, gaslessWriter } = useContext(GaslessContractContext);
  const { isGaslessActionAllowed, currentProfileSelected } = useContext(
    ProfileContractContext,
  );
  const selectedProfile = useRecoilValue(selectedProfileAtom);
  const [surveyReader, setSurveyReader] = useState<any | null>(null);
  const [surveyWriter, setSurveyWriter] = useState<any | null>(null);
  var { getIdentity } = useContext(IdentityContext);

  const getQuestionOptions = async (questionId: number) => {
    if (surveyReader) {
      try {
        const options = await surveyReader.getQuestionOptions(questionId);
        return options;
      } catch (error) {
        console.error('getQuestionOptions: error', error);
        return [];
      }
    }
  };

  const encodeString = async (data: string) => {
    var auth = await getIdentity();
    const resp: { cipher: string; nonce: string } = await gaslessReader.encode(
      auth,
      data,
    );
    return resp;
  };

  const decodeString = async (ciphertext: string, nonce: string) => {
    const resp = await gaslessReader.decode(ciphertext, nonce);
    return resp;
  };

  const createQuestions = async (questions: questionCreateRequest[]) => {
    // get current active user identity
    const organisationId = currentProfileSelected?.value?.organisationId;
    const tx = await surveyWriter.createQuestions(questions, organisationId);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      toast.success('Successfully created questions');
      const logs = receipt.logs;
      let toreturn: any;
      logs.forEach((log) => {
        const parsedLog = surveyReader.interface.parseLog(log);
        if (parsedLog.name === 'QuestionsAdded') {
          // Do something with the event data
          toreturn = parsedLog.args;
        }
      });
      return toreturn;
    }
  };

  const createOptions = async (options: OptionsToCreate[]) => {
    // get current active user identity
    const organisationId = currentProfileSelected?.value?.organisationId;
    const tx = await surveyWriter.createOptions(options, organisationId);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      toast.success('Successfully created options');
      const logs = receipt.logs;
      let toreturn: any;
      logs.forEach((log) => {
        const parsedLog = surveyReader.interface.parseLog(log);
        if (parsedLog.name === 'OptionsAdded') {
          // Do something with the event data
          console.log('Event emitted OptionsAdded:', parsedLog.args);
          toreturn = parsedLog.args;
        }
      });
      return toreturn;
    }
  };

  const verifySurveyBeforeCreating = async (
    request: surveyCreationRequest,
  ): Promise<boolean> => {
    const auth = await getIdentity();
    const resp = await surveyReader.verifySurveyBeforeCreating(request, auth);
    return resp;
  };

  const canAnswerSurvey = async (surveyId: number): Promise<string> => {
    const auth = await getIdentity();
    const resp = await surveyReader.canAnswerSurvey(surveyId, auth);
    return resp;
  };

  const createSurvey = async (
    surveyCreationRequest: surveyCreationRequest,
  ): Promise<SurveyCreatedResponse> => {
    const tx = await surveyWriter.createSurvey(surveyCreationRequest);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      toast.success('Successfully created Survey');
      console.log('logs', receipt.logs);
      const logs = receipt.logs;
      let toreturn: any;
      logs.forEach((log) => {
        const parsedLog = surveyReader.interface.parseLog(log);
        if (parsedLog.name === 'SurveyCreated') {
          // Do something with the event data
          console.log('Event emitted SurveyCreated:', parsedLog.args);
          toreturn = parsedLog.args;
        }
      });
      return toreturn;
    }
  };

  const getAllSurveysOfOrganisation = async (): Promise<
    MinimalSurveyView[]
  > => {
    const orgId = currentProfileSelected?.value?.organisationId;
    if (!orgId) {
      return null;
    }
    const auth = await getIdentity();
    const surveys = await surveyReader.getAllSurveysOfOrganisation(orgId, auth);
    return surveys;
  };

  const getOrganisationViewofSurvey = async (
    surveyId: number,
  ): Promise<{
    surveyData: Survey;
    questionsData: QuestionInstanceStructForOrganisationSurveyView[];
    audienceFiltersData: AudienceFilterStructForOrganisationSurveyView[];
    surveyIDencrypted: string;
  }> => {
    const auth = await getIdentity();
    const survey = await surveyReader.getOrganisationViewofSurvey(
      surveyId,
      auth,
    );
    return survey;
  };

  const checkRespondantOnChainFilters = async (
    surveyId: number,
  ): Promise<AudienceFilterStructForOrganisationSurveyView[]> => {
    const auth = await getIdentity();
    const resp = await surveyReader.checkRespondantOnChainFilters(
      surveyId,
      auth,
    );
    console.log('checkRespondantOnChainFilters', resp);
    return resp;
  };

  const getRespondantViewOfSurvey = async (
    surveyId: number,
  ): Promise<{
    surveyTitle: string;
    surveyTitleIPFS: IPFSHash;
    surveyIntroIPFS: IPFSHash;
    surveyNonce: string;
    orgUserName: string;
    questions: QuestionInstanceStructForOrganisationSurveyView[];
  }> => {
    const auth = await getIdentity();
    const resp = await surveyReader.getRespondantViewOfSurvey(surveyId, auth);
    console.log('getRespondantViewOfSurvey', resp);
    return resp;
  };

  const encodeTextAnswer = async (
    surveyId: number,
    text: string,
  ): Promise<{ cypherForOrganisation: string; cypherForUser: string }> => {
    const auth = await getIdentity();
    const resp = await gaslessReader.encodeTextAnswer(surveyId, text, auth);
    return resp;
  };

  const decodeTextAnswerForOrganisation = async (
    cypher: string,
  ): Promise<string> => {
    const auth = await getIdentity();
    // @ts-ignore
    const organisationId = Number(selectedProfile?.value?.organisationId);
    const resp = await gaslessReader.decodeTextAnswerForOrganisation(
      organisationId,
      cypher,
      auth,
    );
    return resp;
  };

  const decodeTextAnswerForUser = async (cypher: string): Promise<string> => {
    const auth = await getIdentity();
    const resp = await gaslessReader.decodeTextAnswerForUser(cypher, auth);
    return resp;
  };

  const SubmitAnswerToSurvey = async (
    surveyId: number,
    questionIndex: number[],
    answerHashIPFSDigest: string[],
    answerHashIPFSHashFunction: number[],
    answerHashIPFSHashSize: number[],
    optionIndexes: number[][],
    ansType: number[],
  ) => {
    const tx = await surveyWriter.SubmitAnswerToSurvey(
      surveyId,
      questionIndex,
      answerHashIPFSDigest,
      answerHashIPFSHashFunction,
      answerHashIPFSHashSize,
      optionIndexes,
      ansType,
    );
    const receipt = await tx.wait();
    console.log('submit ans', tx);
    if (receipt.status === 1) {
      toast.success('Successfully submitted answers');
      console.log('logs', receipt.logs);
      const logs = receipt.logs;
      let toreturn: any;
      logs.forEach((log) => {
        const parsedLog = surveyReader.interface.parseLog(log);
        if (parsedLog.name === 'SurveyAnswered') {
          // Do something with the event data
          console.log('Event emitted SurveyAnswered:', parsedLog.args);
          toreturn = parsedLog.args;
        }
      });
      return toreturn;
    }
  };

  const SubmitAnswerToSurveyGasless = async (
    surveyId: number,
    questionIndex: number[],
    answerHashIPFSDigest: string[],
    answerHashIPFSHashFunction: number[],
    answerHashIPFSHashSize: number[],
    optionIndexes: number[][],
    ansType: number[],
  ) => {
    toast.loading(
      'Submitting your answers... Kindly Wait, It may take upto a minute. Please do not refresh.',
      { id: 'submitting' },
    );
    const auth = await getIdentity();
    // try {
    const oldtx = await gaslessReader.makeAnswerSurveyTransaction(
      surveyId,
      questionIndex,
      answerHashIPFSDigest,
      answerHashIPFSHashFunction,
      answerHashIPFSHashSize,
      optionIndexes,
      ansType,
      auth,
    );
    console.log('submit ans', oldtx);
    const tx = await signerProvider.sendTransaction(oldtx);
    const receipt = await tx.wait();
    console.log('submit ans', receipt);
    let toreturn: any;
    let txdata: any;
    if (receipt.status === 1) {
      toast.success('Collecting Rewards...');
      console.log('logs', receipt.logs);
      const logs = receipt.logs;
      logs.forEach((log) => {
        const parsedLog = surveyReader.interface.parseLog(log);
        if (parsedLog.name === 'SurveyAnswered') {
          // Do something with the event data
          console.log('Event emitted SurveyAnswered:', parsedLog.args);
          toreturn = parsedLog.args;
        }
        if (parsedLog.name === 'TxRequest') {
          console.log('Event emitted TxRequest:', parsedLog.args);
          txdata = parsedLog.args;
        }
      });
    } else {
      return false;
    }
    if (txdata) {
      const newtx = await signerProvider.sendTransaction(txdata.data);
      const newreceipt = await newtx.wait();
      console.log('submit ans', newreceipt);
      if (newreceipt.status === 1) {
        await reportSuccessfulRewards(newreceipt.blockNumber);
        toast.success('Successfully received your rewards');
        toast.success('Successfully submitted answers', { id: 'submitting' });
        console.log('logs', newreceipt.logs);
        return true;
      } else {
        toast.error(
          'Error submitting answers. Please try again later. Make sure you are verified on ORCP.',
          { id: 'submitting' },
        );
        return false;
      }
    } else {
      return false;
    }
    // } catch (error) {
    //   console.error('submit ans', error);
    //   toast.error(
    //     'Error submitting answers. Please try again later. Make sure you are verified on ORCP.',
    //     { id: 'submitting' },
    //   );
    //   return false;
    // }
  };

  const getAnswersOfQuestionInSurvey = async (
    surveyId: number,
    questionId: number,
  ): Promise<AnswersOfAQuestionStruct[]> => {
    const auth = await getIdentity();
    const resp = await surveyReader.getAnswersOfQuestionInSurvey(
      surveyId,
      questionId,
      auth,
    );
    return resp;
  };

  const revokeAccess = async (surveyId: number) => {
    //get msg value to send
    const msgValue = await gaslessReader.getAmountPaid(
      surveyId,
      currentAccount,
    );
    if (msgValue == 0 || msgValue == null || msgValue == undefined) {
      toast.error(
        'You were not paid for this survey. You cannot revoke access.',
      );
      return false;
    }
    console.log('amount received is :', Number(msgValue));
    toast.loading('Revoking access... Kindly Wait', { id: 'revoking' });
    const tx = await surveyWriter.revokeAccess(surveyId, {
      value: msgValue,
    });
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      toast.success('Successfully revoked access');
      return true;
    } else {
      return false;
    }
  };

  const editSurvey = async (
    surveyId: number,
    status: SurveyStatus,
    addressList: string[],
    new_audience_size: number,
    new_expiry_time: number,
  ) => {
    const tx = await surveyWriter.editSurvey(
      surveyId,
      status,
      addressList,
      new_audience_size,
      new_expiry_time,
    );
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      toast.success('Successfully edited Survey');
      return true;
    } else {
      return false;
    }
  };

  const getSurveysActiveStatus = async (): Promise<
    SurveyStatusAndPrivacyInfo[]
  > => {
    const surveyStatus = await surveyReader.getSurveysActiveStatus();
    console.log('surveyStatus', surveyStatus);
    const surveyStatusObj: SurveyStatusAndPrivacyInfo[] = [];

    // Iterate over each sublist in surveyStatus
    for (var i = 0; i < surveyStatus[0].length; i++) {
      // Create a new object with the desired key-value pairs
      var newObj = {
        surveyId: i + 100,
        surveyStatus: surveyStatus[0][i],
        surveyPrivacy: surveyStatus[1][i],
      };

      // Push the new object to the convertedList array
      surveyStatusObj.push(newObj);
    }
    return surveyStatusObj;
  };

  const getMyNotifications = async () => {
    // get organisation id
    const orgId = currentProfileSelected?.value?.organisationId;
    if (!orgId) {
      return null;
    }
    const result = await surveyReader.getMyNotifications(orgId);
    const abiTypes = ['bytes32', 'uint256'];
    const tosend = [];
    for (let i = 0; i < result.length; i++) {
      const decodedData = ethers.utils.defaultAbiCoder.decode(
        abiTypes,
        result[i],
      );
      // get questionText
      tosend.push({
        user: decodedData[0],
        surveyId: decodedData[1],
      });
    }
    return tosend;
  };

  const getMyPrivateInvitations = async () => {
    const auth = await getIdentity();
    const surveyIds = await surveyReader.getMyPrivateInvitations(auth);
    var newsurveysId = [];
    if (surveyIds && surveyIds.length > 0) {
      newsurveysId = surveyIds.map((surveyId: any) => {
        return Number(surveyId);
      });
    }
    return newsurveysId;
  };

  const getMyAnsweredSurveys = async () => {
    const auth = await getIdentity();
    const surveyIds = await surveyReader.getMyAnsweredSurveys(auth);
    var newsurveysId = [];
    if (surveyIds && surveyIds.length > 0) {
      newsurveysId = surveyIds.map((surveyId: any) => {
        return Number(surveyId);
      });
    }
    return newsurveysId;
  };

  const getSurveyBasicInfo = async (
    surveyId: number,
    getAnsweredTime: boolean,
  ): Promise<SurveyInfoStruct> => {
    const auth = await getIdentity();
    try {
      const surveyInfo = await surveyReader.getSurveyBasicInfo(
        surveyId,
        auth,
        getAnsweredTime,
      );
      console.log(
        'survey info raw is',
        surveyInfo,
        'and get answered time is',
        getAnsweredTime,
        'and received time is',
        surveyInfo.answeredAt,
      );
      const newSurveyInfo = {
        surveyTitle: await reverseFormattedOptionObject({
          option: surveyInfo.surveyTitle,
          optionIPFSHash: surveyInfo.surveyTitleIPFS,
        }),
        surveyIntro: (await readIPFS(surveyInfo.surveyIntroIPFS)).introString,
        createdBy: Number(surveyInfo.createdBy),
        createdAt: Number(surveyInfo.createdAt),
        answeredAt: Number(surveyInfo.answeredAt),
        validTill: Number(surveyInfo.validTill),
      };
      return newSurveyInfo;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const viewMySurveyResponse = async (
    surveyId: number,
  ): Promise<viewMySurveyResponseStruct[]> => {
    const auth = await getIdentity();
    const surveyResponse: SurveyResponseViewForRespondantStruct =
      await surveyReader.viewMySurveyResponse(surveyId, auth);
    var responseObj: viewMySurveyResponseStruct[] = [];
    console.log('surveyResponse', surveyResponse);
    for (let i = 0; i < surveyResponse.answers.length; i++) {
      // get questionText
      var obj = {
        questionText: '',
        answerText: [],
        answerTypeText: '',
        PrivacyLevel: 0,
      };
      var qStringIPFS = await readIPFS(
        surveyResponse.questions[i].questionIPFSHash,
      );
      var qString = qStringIPFS.questionString;
      if (surveyResponse.surveyNonce != stringToBytes32('')) {
        qString = await decodeString(qString, surveyResponse.surveyNonce);
      }
      obj.questionText = qString;
      // get answerText
      if (surveyResponse.answerHashIPFSs[i].size != 0) {
        var cipherIPFS = await readIPFS(surveyResponse.answerHashIPFSs[i]);
        var cipher = cipherIPFS.cipherForUser;
        // if (surveyResponse.surveyNonce != stringToBytes32('')) {
        console.log('decoding......');
        var aText = await decodeTextAnswerForUser(cipher);
        console.log('decoded text', aText);
        // }
        obj.answerText = [aText];
      } else {
        if (surveyResponse.questions[i].qType == QuestionType.RANGE) {
          try {
            obj.answerText = [surveyResponse.optionIndexes[i][0].toString()];
          } catch (e) {
            obj.answerText = [''];
          }
        } else {
          var newAnsText = [];
          for (let j = 0; j < surveyResponse.optionIndexes[i].length; j++) {
            var option = await reverseFormattedOptionObject(
              surveyResponse.questions[i].selectedOptionsIndexOptionString[j],
            );
            newAnsText.push(' ' + option + ' ');
          }
          obj.answerText = newAnsText;
        }
      }
      // get answerTypeText
      if (surveyResponse.questions[i].qType == QuestionType.RANGE) {
        obj.answerTypeText = 'Range';
      } else if (surveyResponse.questions[i].qType == QuestionType.CHECKBOXES) {
        obj.answerTypeText = 'Multiple Choice';
      } else if (surveyResponse.questions[i].qType == QuestionType.OPENTEXT) {
        obj.answerTypeText = 'Text';
      } else {
        obj.answerTypeText = 'Single Choice';
      }
      // get PrivacyLevel
      obj.PrivacyLevel = surveyResponse.questions[i].privacyLevelRating;
      responseObj.push(obj);
    }
    return responseObj;
  };

  const totalSurveys = async () => {
    const totalSurveys = await surveyReader.totalSurveys();
    return Number(totalSurveys);
  };

  useEffect(() => {
    const setupContract = async () => {
      if (signerProvider) {
        const { reader, writer } = fetchContract(
          SurveyContractAddress,
          SurveyContractABI,
          signerProvider,
        );
        setSurveyReader(reader);
        setSurveyWriter(writer);
      }
    };

    setupContract();
  }, [currentAccount]);

  return (
    <SurveyContractContext.Provider
      value={{
        surveyReader,
        surveyWriter,
        getQuestionOptions,
        encodeString,
        createQuestions,
        createOptions,
        verifySurveyBeforeCreating,
        createSurvey,
        getAllSurveysOfOrganisation,
        getOrganisationViewofSurvey,
        canAnswerSurvey,
        checkRespondantOnChainFilters,
        getRespondantViewOfSurvey,
        decodeString,
        encodeTextAnswer,
        decodeTextAnswerForOrganisation,
        decodeTextAnswerForUser,
        SubmitAnswerToSurvey,
        getAnswersOfQuestionInSurvey,
        SubmitAnswerToSurveyGasless,
        editSurvey,
        getSurveysActiveStatus,
        getMyPrivateInvitations,
        getMyAnsweredSurveys,
        getSurveyBasicInfo,
        viewMySurveyResponse,
        totalSurveys,
        revokeAccess,
        getMyNotifications,
      }}
    >
      {children}
    </SurveyContractContext.Provider>
  );
};
