'use client';
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { Toaster, toast } from 'sonner';
import { LoadingOverlayContext } from '@/app/shared/LoadingOverlayContext';
interface SignerProviderProps {
  children: ReactNode;
}
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import { use } from 'chai';

export const isAddress = (address: string) => {
  return ethers.utils.isAddress(address);
};

export interface SignerProviderContextProps {
  signerProvider: ethers.providers.Web3Provider | null;
  currentAccount: string;
  connectWallet: () => Promise<void>;
  fetchContract: (
    Token: string,
    abi: any,
    provider: ethers.providers.Web3Provider,
  ) => { reader: ethers.Contract; writer: ethers.Contract };
  createSignature: (signature: string) => ethers.Signature;
  disconnectWallet: () => Promise<void>;
  connectWalletOnClick: (account: string | null) => () => void;
  checkIfMetaMaskIsInstalled: () => boolean;
}

export const SignerProviderContext = createContext<SignerProviderContextProps>(
  {} as SignerProviderContextProps,
);

export const SignerProvider: React.FC<SignerProviderProps> = ({
  children,
}: SignerProviderProps) => {
  const [signerProvider, setSignerProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const { setIsLoading } = React.useContext(LoadingOverlayContext);
  const HARDHAT_NETWORK_ID = '23295';
  const [isActiveProfileOrganisation, setIsActiveProfileOrganisation] =
    useRecoilState(isActiveProfileOrganisationAtom);

  const connectWalletOnClick = (account: string | null = null) => {
    setIsLoading(true);
    const refreshEthConnection = async () => {
      console.log('account in connectwalletonclick is ', account);
      try {
        if (typeof window !== 'undefined') {
          const ethereum = (window as any).ethereum;
          if (!ethereum) {
            toast.error('MetaMask not found.', {
              description:
                'Wallets such as Metamask are required to interact with Web3 Applications.Please install metamask and refresh.',
              duration: 500000,
            });
            return;
          }
          _checkNetwork();
          account
            ? await checkIfWalletIsConnected(account)
            : await checkIfWalletIsConnected();

          const provider = sapphire.wrap(
            new ethers.providers.Web3Provider(ethereum),
          );
          setSignerProvider(provider);
        }
      } catch (error) {
        console.error('Error refreshing Eth connection:', error);
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        console.log('Account changed:', accounts[0]);
        setIsActiveProfileOrganisation(false);
      } else {
        setCurrentAccount('');
        console.error('Connect MetaMask! No account found');
      }
    };

    const handleChainChanged = (chainId: string) => {
      refreshEthConnection();
    };

    refreshEthConnection();

    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        // check if event listeners are already attached
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);
      }
    }
    setIsLoading(false);
    return () => {
      if (typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
          ethereum.off('accountsChanged', handleAccountsChanged);
          ethereum.off('chainChanged', handleChainChanged);
        }
      }
    };
  };

  const checkIfMetaMaskIsInstalled = () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      toast.error('MetaMask not found.', {
        description:
          'Wallets such as Metamask are required to interact with Web3 Applications.Please install metamask and refresh.',
        duration: 500000,
      });
      return false;
    } else return true;
  };

  const _switchChain = async () => {
    const ethereum = (window as any).ethereum;
    try {
      const chainIdHex = '0x5aff';
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      console.error('Error switching chain:', error);
      toast.error('Error switching chain');
    }
  };

  const _checkNetwork = () => {
    const ethereum = (window as any).ethereum;
    try {
      if (ethereum.net_version !== HARDHAT_NETWORK_ID) {
        _switchChain();
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const checkIfWalletIsConnected = async (account: string | null = null) => {
    const ethereum = (window as any).ethereum;
    try {
      if (!ethereum) {
        toast.error('MetaMask not found.', {
          description:
            'Wallets such as Metamask are required to interact with Web3 Applications.Please install metamask and refresh.',
          duration: 500000,
        });
        return;
      }
      await ethereum.request({ method: 'eth_requestAccounts' });
      // check if account exist in metamask
      const accounts = await ethereum.request({
        method: 'eth_accounts',
      });
      if (accounts.length) {
        if (account && account in accounts) {
          if (account !== accounts[0]) {
            console.log(
              'You had previously connected with a different account ',
              account,
              ' but now your default account is',
              accounts[0],
            );
          }
          setCurrentAccount(account);
        }
        setCurrentAccount(accounts[0]);
      } else {
        console.error('Connect MetaMask! No account found');
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const disconnectWallet = async () => {
    const ethereum = (window as any).ethereum;
    try {
      if (!ethereum) {
        toast.error('MetaMask not found.', {
          description:
            'Wallets such as Metamask are required to interact with Web3 Applications.Please install metamask and refresh.',
          duration: 500000,
        });
        return;
      }
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      setCurrentAccount('');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const fetchContract = (
    Token: string,
    abi: any,
    provider: ethers.providers.Web3Provider,
  ) => {
    const reader = new ethers.Contract(Token, abi, provider);
    const writer = new ethers.Contract(
      Token,
      abi,
      sapphire.wrap(provider.getSigner()),
    );
    return { reader, writer };
  };

  const createSignature = (signature: string) => {
    return ethers.utils.splitSignature(signature);
  };

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    try {
      if (!ethereum) {
        toast.error('MetaMask not found.', {
          description:
            'Wallets such as Metamask are required to interact with Web3 Applications.Please install metamask and refresh.',
          duration: 500000,
        });
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    console.log('signerProviderChaged', signerProvider);
  }, [signerProvider]);

  return (
    <SignerProviderContext.Provider
      value={{
        signerProvider,
        currentAccount,
        connectWallet,
        fetchContract,
        createSignature,
        disconnectWallet,
        connectWalletOnClick,
        checkIfMetaMaskIsInstalled,
      }}
    >
      {children}
      <Toaster richColors />
    </SignerProviderContext.Provider>
  );
};
