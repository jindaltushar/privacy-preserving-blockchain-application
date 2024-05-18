'use client';

import React, {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import Cookies from 'js-cookie';

import { getSignInSignature } from './signature-helper';
import {
  SignerProviderContext,
  SignerProviderContextProps,
} from '@/app/shared/signerProvider';
import { set } from 'lodash';
import { LoadingOverlayContext } from '@/app/shared/LoadingOverlayContext';
interface IdentityContextProps {
  getIdentity: () => Promise<authData>;
  flushIdentity: () => void;
  userIdentity: authData;
}

export interface authData {
  user: string | null;
  time: number;
  rsv: {
    r: string;
    s: string;
    v: number;
  };
}

export const IdentityContext = createContext<IdentityContextProps>(
  {} as IdentityContextProps,
);

interface IdentityProviderProps {
  children: ReactNode;
}

export const IdentityProvider: React.FC<IdentityProviderProps> = ({
  children,
}: IdentityProviderProps) => {
  var { signerProvider, currentAccount, connectWalletOnClick } =
    useContext<SignerProviderContextProps>(SignerProviderContext);

  var [userIdentity, setUserIdentity] = React.useState<authData>(
    {} as authData,
  );
  var { setIsLoading } = useContext(LoadingOverlayContext);

  const getIdentity = async (): Promise<authData> => {
    const storedAuthData = Cookies.get('authData');
    console.log('storedAuthData', storedAuthData);
    if (!signerProvider && !storedAuthData) {
      console.log('StoredAuthData is null');
      setUserIdentity({
        user: null,
        time: 0,
        rsv: {
          r: '',
          s: '',
          v: 0,
        },
      });
      return {
        user: null,
        time: 0,
        rsv: {
          r: '',
          s: '',
          v: 0,
        },
      };
    }

    if (storedAuthData) {
      const authData = JSON.parse(storedAuthData);
      if (!currentAccount) {
        console.log(
          'no current account but stored data , so connecting wallet with stored user',
        );
        connectWalletOnClick(authData.user);
        console.log('returning getide');
        return authData;
      }
      if (
        authData.time + 86350000 < new Date().getTime() ||
        authData.user !== currentAccount
      ) {
        console.log(
          'stored data is expired or user changed so flushing identity',
        );
        console.log(
          'user is ',
          authData.user,
          ' and currentAccount is ',
          currentAccount,
        );
        console.log(
          'stored time is ',
          authData.time,
          ' and current time is ',
          new Date().getTime(),
        );
        flushIdentity();
        return getIdentity();
      } else {
        return authData;
      }
    } else {
      console.log('signature requested from getIdentity');
      const authData = await getSignInSignature(
        signerProvider!,
        currentAccount,
      );
      console.log('setting cookies');
      Cookies.set('authData', JSON.stringify(authData));
      setUserIdentity(authData);
      return authData;
    }
  };

  const flushIdentity = () => {
    Cookies.remove('authData');
  };

  useEffect(() => {
    const init = async () => {
      // setIsLoading(true);
      await getIdentity();
      console.log('called getidentity from identity context useeffect');
      // setIsLoading(false);
    };
    if (signerProvider) {
      init();
    }
  }, [signerProvider]);

  return (
    <IdentityContext.Provider
      value={{
        getIdentity,
        flushIdentity,
        userIdentity,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};
