'use client';

import React, { useEffect, useState, useContext, ReactNode } from 'react';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import {
  GaslessContractABI,
  GaslessContractAddress,
} from '@/contracts/constants';
import { selectedProfileAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { AddressesOfOrganisation } from '@/app/shared/types';
import { type BigNumber } from 'ethers';
interface GaslessContractProviderProps {
  children: ReactNode;
}

interface GaslessContractContextValue {
  gaslessReader: any; // Replace 'any' with the actual type of your gaslessReader
  gaslessWriter: any; // Replace 'any' with the actual type of your gaslessWriter
  getOrganisationAccountPublicKey: () => Promise<string>;
  getAllAdminAddresses: () => Promise<string[]>;
  walletTransactFromOrganisation: (
    to: string,
    amount: BigNumber,
  ) => Promise<boolean>;
  walletTransactFromSurvey: (
    to: string,
    surveyId: number,
    amount: BigNumber,
  ) => Promise<boolean>;
  manually_adjust_nonce_for_organisationAccount: (
    nonce: number,
  ) => Promise<boolean>;
  manually_adjust_nonce_for_surveyAccount: (
    surveyId: number,
    nonce: number,
  ) => Promise<boolean>;
  getAddressesOfOrganisation: () => Promise<AddressesOfOrganisation>;

  getOrganisationAccountPublicKeyWithOrgId: (id: number) => Promise<string>;
  getSurveyBalance: (surveyId: number) => Promise<number>;
  getCurrentNonce: (address: string) => Promise<number>;
}

export const GaslessContractContext =
  React.createContext<GaslessContractContextValue>(
    {} as GaslessContractContextValue,
  );

export const GaslessContractProvider: React.FC<
  GaslessContractProviderProps
> = ({ children }) => {
  const { signerProvider, currentAccount, fetchContract, createSignature } =
    useContext(SignerProviderContext);

  const [gaslessReader, setGaslessReader] = useState<any | null>(null);
  const [gaslessWriter, setGaslessWriter] = useState<any | null>(null);
  const selectedProfile = useRecoilValue(selectedProfileAtom);

  var { getIdentity } = useContext(IdentityContext);

  const getOrganisationAccountPublicKey = async (): Promise<string> => {
    // @ts-ignore
    const organisationId = Number(selectedProfile?.value?.organisationId);
    if (gaslessReader && organisationId) {
      try {
        const publicKey =
          await gaslessReader.getOrganisationAccountPublicKey(organisationId);
        return publicKey;
      } catch (error) {
        console.error('Error getting organisation account public key:', error);
      }
    }
  };

  const getOrganisationAccountPublicKeyWithOrgId = async (
    id: number,
  ): Promise<string> => {
    if (gaslessReader) {
      try {
        const publicKey =
          await gaslessReader.getOrganisationAccountPublicKey(id);
        return publicKey;
      } catch (error) {
        console.error('Error getting organisation account public key:', error);
      }
    }
  };

  const getAllAdminAddresses = async (): Promise<string[]> => {
    if (gaslessReader) {
      try {
        const auth = await getIdentity();
        const adminAddresses = await gaslessReader.getAllAdminAddresses(auth);
        return adminAddresses;
      } catch (error) {
        console.error('Error getting all admin addresses:', error);
      }
    }
  };

  const walletTransactFromOrganisation = async (
    to: string,
    amount: BigNumber,
  ): Promise<boolean> => {
    // @ts-ignore
    const organisationId = selectedProfile?.value?.organisationId;
    if (gaslessWriter && organisationId) {
      try {
        const auth = await getIdentity();
        const oldtx = await gaslessReader.walletTransactFromOrganisation(
          to,
          organisationId,
          amount,
          auth,
        );
        console.log(oldtx);
        const tx = await signerProvider.sendTransaction(oldtx);
        const receipt = await tx.wait();
        console.log(receipt);
        if (receipt.status === 1) {
          console.log('Transaction successful');
          return true;
        } else {
          console.log('Transaction failed');
          return false;
        }
      } catch (error) {
        console.error('Error transacting from organisation:', error);
        return false;
      }
    }
  };

  const walletTransactFromSurvey = async (
    to: string,
    surveyId: number,
    amount: BigNumber,
  ): Promise<boolean> => {
    // @ts-ignore
    const organisationId = selectedProfile?.value?.organisationId;
    if (gaslessWriter && organisationId) {
      try {
        const auth = await getIdentity();
        const oldtx = await gaslessReader.walletTransactFromSurvey(
          to,
          surveyId,
          amount,
          auth,
        );
        console.log(oldtx);
        const tx = await signerProvider.sendTransaction(oldtx);
        const receipt = await tx.wait();
        console.log(receipt);
        if (receipt.status === 1) {
          console.log('Transaction successful');
          return true;
        } else {
          console.log('Transaction failed');
          return false;
        }
      } catch (error) {
        console.error('Error transacting from survey:', error);
        return false;
      }
    }
  };

  const manually_adjust_nonce_for_organisationAccount = async (
    nonce: number,
  ) => {
    // @ts-ignore
    const orgId = selectedProfile?.value?.organisationId;
    if (gaslessWriter && orgId) {
      try {
        const tx =
          await gaslessWriter.manually_adjust_nonce_for_organisationAccount(
            orgId,
            nonce,
          );
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error adjusting nonce:', error);
        return false;
      }
    }
  };

  const manually_adjust_nonce_for_surveyAccount = async (
    surveyId: number,
    nonce: number,
  ) => {
    // @ts-ignore
    const orgId = selectedProfile?.value?.organisationId;
    if (gaslessWriter && orgId) {
      try {
        const tx = await gaslessWriter.manually_adjust_nonce_for_surveyAccount(
          surveyId,
          orgId,
          nonce,
        );
        console.log(tx);
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error adjusting nonce:', error);
        return false;
      }
    }
  };

  const getCurrentNonce = async (address: string): Promise<number> => {
    if (signerProvider) {
      try {
        const nonce = await signerProvider.getTransactionCount(address);
        return nonce;
      } catch (error) {
        console.error('Error getting current nonce:', error);
      }
    }
  };

  const getAddressesOfOrganisation =
    async (): Promise<AddressesOfOrganisation> => {
      // @ts-ignore
      const OrganisationId = Number(selectedProfile?.value?.organisationId);
      if (gaslessReader && OrganisationId) {
        const auth = await getIdentity();
        console.log('organisationid', OrganisationId);
        console.log('type of orgamisationid', typeof OrganisationId);
        console.log('auth', auth);
        const addressesResp = await gaslessReader.getAddressesOfOrganisation(
          OrganisationId,
          auth,
        );
        console.log('wallet rep', addressesResp);
        return addressesResp;
      }
    };

  const getSurveyBalance = async (surveyId: number): Promise<number> => {
    const resp = await gaslessReader.checkSurveyAccountBalance(surveyId);
    return Number(resp);
  };
  useEffect(() => {
    const setupContract = async () => {
      if (signerProvider) {
        const { reader, writer } = fetchContract(
          GaslessContractAddress,
          GaslessContractABI,
          signerProvider,
        );
        setGaslessReader(reader);
        setGaslessWriter(writer);
      }

      // Cleanup function to clear states when the component is unmounted
      return () => {
        setGaslessReader(null);
        setGaslessWriter(null);
      };
    };

    setupContract();
  }, [currentAccount]);

  return (
    <GaslessContractContext.Provider
      value={{
        gaslessReader,
        gaslessWriter,
        getOrganisationAccountPublicKey,
        getAllAdminAddresses,
        walletTransactFromOrganisation,
        walletTransactFromSurvey,
        manually_adjust_nonce_for_organisationAccount,
        manually_adjust_nonce_for_surveyAccount,
        getAddressesOfOrganisation,
        getOrganisationAccountPublicKeyWithOrgId,
        getSurveyBalance,
        getCurrentNonce,
      }}
    >
      {children}
    </GaslessContractContext.Provider>
  );
};
