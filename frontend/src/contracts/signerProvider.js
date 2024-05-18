import React, { useState, useEffect } from "react";
const ethers = require("ethers");
import * as sapphire from "@oasisprotocol/sapphire-paratime";
// create a context and state for the ethereum provider and signer

export const SignerProviderContext = React.createContext();

export const SignerProvider = ({ children }) => {
  const [signerProvider, setSignerProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");

  // set authData and authvalidity in cookie

  const HARDHAT_NETWORK_ID = "23295";
  useEffect(() => {
    const inFunction = async () => {
      checkIfWalletIsConnected();
      _checkNetwork();
      const provider = sapphire.wrap(
        new ethers.providers.Web3Provider(window.ethereum)
      );
      const signer = provider.getSigner();
      setSignerProvider(provider);
    };
    inFunction();
  }, []);

  const _switchChain = async () => {
    const chainIdHex = "0x5aff";
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  };

  // This method checks if the selected network is Localhost:8545
  const _checkNetwork = () => {
    if (window.ethereum.net_version !== HARDHAT_NETWORK_ID) {
      _switchChain();
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        return setOpenError(true), setError("Install Metamask");
      }
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        return (
          setOpenError(true), setError("Connect Metamask! No account found")
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchContract = (Token, abi, provider) => {
    const reader = new ethers.Contract(Token, abi, provider);
    const writer = new ethers.Contract(
      Token,
      abi,
      sapphire.wrap(provider.getSigner())
    );
    return { reader, writer };
  };

  const createSignature = (signature) => {
    // return ethers.Signature.from(signature);
    return ethers.utils.splitSignature(signature);
  };
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        return setOpenError(true), setError("Install Metamask");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SignerProviderContext.Provider
      value={{
        signerProvider,
        currentAccount,
        connectWallet,
        fetchContract,
        createSignature,
      }}
    >
      {children}
    </SignerProviderContext.Provider>
  );
};
