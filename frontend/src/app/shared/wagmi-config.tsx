'use client';

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import {
  configureChains,
  createConfig,
  WagmiConfig as WagmiConfigWrapper,
} from 'wagmi';
import { defineChain } from 'viem';
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { Chain, ChainProviderFn, Connector } from 'wagmi';

export const sapphireWrapConnector = (connector: Connector) => {
  const originalGetProviderFunction = connector.getProvider;

  connector.getProvider = async (...args) => {
    let provider = await originalGetProviderFunction.bind(connector)(...args);

    if (Number(provider.chainId) === sapphireTestnet.id) {
      console.log('Wrapping connector...');

      provider = sapphire.wrap(provider);
    }

    return provider;
  };

  return connector;
};

export const sapphireTestnet = defineChain({
  id: 23295,
  name: 'Oasis Sapphire Testnet',
  network: 'sapphire-testnet',
  nativeCurrency: { name: 'Sapphire Test Rose', symbol: 'TEST', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.sapphire.oasis.dev'],
      webSocket: ['wss://testnet.sapphire.oasis.dev/ws'],
    },
    public: {
      http: ['https://testnet.sapphire.oasis.dev'],
      webSocket: ['wss://testnet.sapphire.oasis.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Oasis Sapphire Testnet Explorer',
      url: 'https://testnet.explorer.sapphire.oasis.dev',
      apiUrl: 'https://testnet.explorer.sapphire.oasis.dev/api',
    },
  },
  testnet: true,
});
const chains = [sapphireTestnet];
const projectId = '882e57d7426200de1ce35607e26a6392';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function WagmiConfig({ children }: React.PropsWithChildren) {
  return (
    <>
      <WagmiConfigWrapper config={wagmiConfig}>{children}</WagmiConfigWrapper>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
