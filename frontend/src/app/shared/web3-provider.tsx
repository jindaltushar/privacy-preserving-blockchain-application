'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ethers, providers, Contract } from 'ethers';
// import erc20 from openzepplin
import {
  ERC20ABI,
  ERC721ABI,
  INFURA_RPC_GOERLI_URL,
  SAPPHIRE_TESTNET_URL,
} from '@/contracts/constants';
// Interface for Ethereum chain configurations
interface ChainConfiguration {
  name: string;
  rpcUrl: string;
}

// Interface for Ethereum context
interface EthereumContextType {
  chainConfigurations: { [key: number]: ChainConfiguration };
  provider: providers.JsonRpcProvider | null;
  setProvider: React.Dispatch<
    React.SetStateAction<providers.JsonRpcProvider | null>
  >;
  isERC20: (chainId: number, contractAddress: string) => Promise<boolean>;
  isERC721: (chainId: number, contractAddress: string) => Promise<boolean>;
  checkEtherBalance: (chainId: number, address: string) => Promise<string>;
  checkERC20Balance: (
    chainId: number,
    contractAddress: string,
    userAddress: string,
  ) => Promise<string>;
  hasERC721Balance: (
    chainId: number,
    contractAddress: string,
    userAddress: string,
  ) => Promise<boolean>;
}

// Ethereum chain configurations
const chainConfigurations: { [key: number]: ChainConfiguration } = {
  23295: {
    name: 'SapphireTestnet',
    rpcUrl: SAPPHIRE_TESTNET_URL,
  },
  5: {
    name: 'Goerli',
    rpcUrl: INFURA_RPC_GOERLI_URL,
  },
  // Add more chain configurations as needed
};

const EthereumContext = createContext<EthereumContextType | undefined>(
  undefined,
);

export const useEthereum = (): EthereumContextType => {
  const context = useContext(EthereumContext);
  if (!context) {
    throw new Error('useEthereum must be used within an EthereumProvider');
  }
  return context;
};

interface EthereumProviderProps {
  children?: ReactNode;
}

const EthereumProvider: React.FC<EthereumProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<providers.JsonRpcProvider | null>(
    null,
  );

  const getProvider = (chainId: number): providers.JsonRpcProvider => {
    const rpcUrl = chainConfigurations[chainId].rpcUrl;
    return new ethers.providers.JsonRpcProvider(rpcUrl);
  };

  // Function to detect if a contract address implements ERC20 standard
  const isERC20 = async (
    chainId: number,
    contractAddress: string,
  ): Promise<boolean> => {
    const provider = getProvider(chainId);
    const contract = new Contract(contractAddress, ERC20ABI, provider);
    try {
      await contract.totalSupply();
      return true;
    } catch (error) {
      console.error('Error checking ERC20:', error);
      return false;
    }
  };

  // Function to detect if a contract address implements ERC721 standard
  const isERC721 = async (
    chainId: number,
    contractAddress: string,
  ): Promise<boolean> => {
    const provider = getProvider(chainId);
    const contract = new Contract(contractAddress, ERC721ABI, provider);
    try {
      await contract.totalSupply();
      return true;
    } catch (error) {
      console.error('Error checking ERC721:', error);
      return false;
    }
  };

  // Function to check the balance of an address in ethers
  const checkEtherBalance = async (
    chainId: number,
    address: string,
  ): Promise<string> => {
    const provider = getProvider(chainId);
    console.log('checkEtherBalance address:', address);

    try {
      const balance = await provider.getBalance(address);
      console.log(
        'checkEtherBalance balance of ',
        chainId,
        address,
        balance.toString(),
      );
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error checking ether balance:', error);
      return '0';
    }
  };

  // Function to check the balance of an address in an ERC20 contract
  const checkERC20Balance = async (
    chainId: number,
    contractAddress: string,
    userAddress: string,
  ): Promise<string> => {
    const provider = getProvider(chainId);
    const contract = new Contract(
      contractAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider,
    );
    try {
      const balance = await contract.balanceOf(userAddress);
      console.log(
        'checkERC20Balance balance of ',
        chainId,
        contractAddress,
        userAddress,
        balance.toString(),
      );
      return balance.toString();
    } catch (error) {
      console.error('Error checking ERC20 balance:', error);
      return '0';
    }
  };

  // Function to check if balance of an account on a contract address is more than 0 for ERC721
  const hasERC721Balance = async (
    chainId: number,
    contractAddress: string,
    userAddress: string,
  ): Promise<boolean> => {
    const provider = getProvider(chainId);
    const contract = new Contract(
      contractAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider,
    );
    try {
      const balance = await contract.balanceOf(userAddress);
      console.log(
        'hasERC721Balance balance of ',
        chainId,
        contractAddress,
        userAddress,
        balance.toString(),
      );
      return parseInt(balance.toString(), 10) > 0;
    } catch (error) {
      console.error('Error checking ERC721 balance:', error);
      return false;
    }
  };

  return (
    <EthereumContext.Provider
      value={{
        chainConfigurations,
        provider,
        setProvider,
        isERC20,
        isERC721,
        checkEtherBalance,
        checkERC20Balance,
        hasERC721Balance,
      }}
    >
      {children}
    </EthereumContext.Provider>
  );
};

export default EthereumProvider;
