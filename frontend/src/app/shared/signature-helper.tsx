'use client';

import {
  CHAIN_ID,
  GaslessContractAddress,
  ProfileContractAddress,
} from '@/contracts/constants';
import { ethers } from 'ethers';
import { userSignupRequest, AnswerSurveyRequest } from '@/app/shared/types';

const createSignature = (signature: string) => {
  // return ethers.Signature.from(signature);
  return ethers.utils.splitSignature(signature);
};

export const getAnswerSurveySignature = async (
  signerProvider: ethers.providers.Web3Provider,
  answerSurveyRequest: AnswerSurveyRequest,
) => {
  const signature = await signerProvider.getSigner()._signTypedData(
    {
      name: 'Survey.Gasless',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: GaslessContractAddress,
    },
    {
      AnswerSurveyRequest: [
        { name: 'user', type: 'address' },
        { name: 'answeredInSurveyId', type: 'uint256' },
        { name: 'answers', type: 'AnswerRequest[]' },
      ],
      AnswerRequest: [
        { name: 'questionId', type: 'uint256' },
        { name: 'qType', type: 'uint8' },
        { name: 'optionIndexes', type: 'uint256[]' },
        { name: 'value', type: 'uint256' },
        { name: 'answerType', type: 'uint8' },
        { name: 'answerHashIPFS', type: 'IPFSHash' },
      ],
      IPFSHash: [
        { name: 'digest', type: 'bytes32' },
        { name: 'hashFunction', type: 'uint8' },
        { name: 'size', type: 'uint8' },
      ],
    },
    answerSurveyRequest,
  );

  const sig = createSignature(signature);
  const rsv = {
    r: sig.r,
    s: sig.s,
    v: sig.v,
  };
  return rsv;
};

export const getSignUpSignature = async (
  signerProvider: ethers.providers.Web3Provider,
  userSignupRequest: userSignupRequest,
) => {
  const signature = await signerProvider.getSigner()._signTypedData(
    {
      name: 'Survey.Gasless',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: GaslessContractAddress,
    },
    {
      userSignupRequest: [
        { name: 'user', type: 'address' },
        { name: 'firstName', type: 'bytes32' },
        { name: 'lastName', type: 'bytes32' },
        { name: 'bio', type: 'bytes32' },
        { name: 'digest', type: 'bytes32' },
        { name: 'hashFunction', type: 'uint8' },
        { name: 'size', type: 'uint8' },
        { name: 'profileAvatar', type: 'uint8' },
        { name: 'twitter_handle', type: 'bytes32' },
        { name: 'facebook_handle', type: 'bytes32' },
        { name: 'instagram_handle', type: 'bytes32' },
        { name: 'external_link', type: 'bytes32' },
        { name: 'password', type: 'bytes32' },
      ],
    },
    userSignupRequest,
  );
  const sig = createSignature(signature);
  const rsv = {
    r: sig.r,
    s: sig.s,
    v: sig.v,
  };
  return rsv;
};

export const getSignInSignature = async (
  signerProvider: ethers.providers.Web3Provider,
  currentAccount: string,
) => {
  const time = new Date().getTime();
  console.log('time is :', time);
  console.log('verifyingContract is :', ProfileContractAddress);
  console.log('use is', currentAccount);
  console.log('chainId is :', CHAIN_ID);
  const signature = await signerProvider.getSigner()._signTypedData(
    {
      name: 'Survey.SignIn',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: ProfileContractAddress,
    },
    {
      SignIn: [
        { name: 'user', type: 'address' },
        { name: 'time', type: 'uint256' },
      ],
    },
    {
      user: currentAccount,
      time: time,
    },
  );
  console.log('raw signature without split is :', signature);
  const sig = createSignature(signature);
  const rsv = {
    r: sig.r,
    s: sig.s,
    v: sig.v,
  };
  return { user: currentAccount, time, rsv };
};
