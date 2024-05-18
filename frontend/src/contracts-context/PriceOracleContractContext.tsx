'use client';

import {
  PriceOracleContractAddress,
  PriceOracleContractABI,
} from '@/contracts/constants';
import { ethers } from 'ethers';
import { SignerProviderContext } from '../app/shared/signerProvider';
import React, { useEffect, useState, useContext, ReactNode } from 'react';
import { BigNumber } from 'ethers';
import { QuestionObjectForRewardCalculation } from '@/app/shared/types';
import { PrivacyObject, PriceObject } from '@/app/shared/types';
interface PriceOracleContractProviderProps {
  children: ReactNode;
}

interface PriceOracleContractContextValue {
  priceOracleReader: any; // Replace 'any' with the actual type of your gaslessReader
  priceOracleWriter: any; // Replace 'any' with the actual type of your gaslessWriter
  getPriceIn: (currency: string) => Promise<BigNumber>;
  getPrivacyPoints: () => Promise<PrivacyObject[]>;
  getPriceForAnswerType: () => Promise<PriceObject[]>;
  getRewardsToAnswerSurvey: (
    query: QuestionObjectForRewardCalculation[],
  ) => Promise<number>;
}

export const PriceOracleContext =
  React.createContext<PriceOracleContractContextValue>(
    {} as PriceOracleContractContextValue,
  );

export const PriceOracleProvider: React.FC<
  PriceOracleContractProviderProps
> = ({ children }) => {
  const { signerProvider, currentAccount, fetchContract, createSignature } =
    useContext(SignerProviderContext);

  const [priceOracleReader, setPriceOracleReader] = useState<any | null>(null);
  const [priceOracleWriter, setPriceOracleWriter] = useState<any | null>(null);

  useEffect(() => {
    const setupContract = async () => {
      if (signerProvider) {
        const { reader, writer } = fetchContract(
          PriceOracleContractAddress,
          PriceOracleContractABI,
          signerProvider,
        );
        setPriceOracleReader(reader);
        setPriceOracleWriter(writer);
      }

      // Cleanup function to clear states when the component is unmounted
      return () => {
        setPriceOracleReader(null);
        setPriceOracleWriter(null);
      };
    };
    setupContract();
  }, [currentAccount]);

  const getPriceIn = async (currency: string): Promise<BigNumber> => {
    if (priceOracleReader) {
      try {
        const price = await priceOracleReader.getPrice('ROSE', currency);
        return price;
      } catch (error) {
        console.error('Error fetching price', error);
      }
    }
  };

  const getPrivacyPoints = async (): Promise<PrivacyObject[]> => {
    if (priceOracleReader) {
      try {
        const privacyPoints = await priceOracleReader.getPrivacyPoints();
        return privacyPoints;
      } catch (error) {
        console.error('Error fetching privacy points', error);
      }
    }
  };

  const getPriceForAnswerType = async (): Promise<PriceObject[]> => {
    if (priceOracleReader) {
      try {
        const price = await priceOracleReader.getPriceForAnswerType();
        return price;
      } catch (error) {
        console.error('Error fetching price for answer type', error);
      }
    }
  };

  const getRewardsToAnswerSurvey = async (
    query: QuestionObjectForRewardCalculation[],
  ): Promise<number> => {
    if (priceOracleReader) {
      try {
        const rewards = await priceOracleReader.getRewardsToAnswerSurvey(query);
        return rewards;
      } catch (error) {
        console.error('Error fetching rewards to answer survey', error);
      }
    }
  };

  return (
    <PriceOracleContext.Provider
      value={{
        priceOracleReader,
        priceOracleWriter,
        getPriceIn,
        getPrivacyPoints,
        getPriceForAnswerType,
        getRewardsToAnswerSurvey,
      }}
    >
      {children}
    </PriceOracleContext.Provider>
  );
};
