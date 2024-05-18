import React from 'react';

import GaslessContract from './GaslessContract.json';
import GaslessContractAddressFile from './contract-address-GaslessContract.json';
import Profile from './Profile.json';
import ProfileContractAddressFile from './contract-address-Profile.json';
import SurveyContract from './SurveyContract.json';
import SurveyContractAddressFile from './contract-address-SurveyContract.json';
import Vault from './Vault.json';
import VaultContractAddressFile from './contract-address-Vault.json';
import ERC20 from './erc20.json';
import ERC721 from './erc721.json';
import PriceOracle from './PriceOracle.json';
import PriceOracleContractAddressFile from './contract-address-PriceOracle.json';
import ContractStore from './contract-address-ContractStore.json';
import AccessControl from './contract-address-RolesAccessControl.json';
import SurveyBackend from './contract-address-SurveyBackendContract.json';

export const GaslessContractAddress = GaslessContractAddressFile.Token;
export const GaslessContractABI = GaslessContract.abi;
// export const ProfileContractAddress = getContractAddress("Profile");
export const ProfileContractAddress = ProfileContractAddressFile.Token;
export const ProfileContractABI = Profile.abi;

export const SurveyContractAddress = SurveyContractAddressFile.Token;
export const SurveyContractABI = SurveyContract.abi;

export const VaultContractAddress = VaultContractAddressFile.Token;
export const VaultContractABI = Vault.abi;

export const PriceOracleContractAddress = PriceOracleContractAddressFile.Token;
export const PriceOracleContractABI = PriceOracle.abi;

export const ContractStoreAddress = ContractStore.Token;
export const AccessControlAddress = AccessControl.Token;
export const SurveyBackendAddress = SurveyBackend.Token;

export const ERC20ABI = ERC20;
export const ERC721ABI = ERC721;

export const SAPPHIRE_TESTNET_URL = 'https://testnet.sapphire.oasis.io';

export const INFURA_RPC_GOERLI_URL =
  'https://goerli.infura.io/v3/5e0e179d95dc47eba36b889838dadc99';

export const CHAIN_ID = '23295';

export const Pintara_api_key = key_here;

export const PINTARA_CLOUD_GATEWAY =
  'https://emerald-adverse-crawdad-725.mypinata.cloud';
export const PINTARA_GATEWAY_KEY =key_here;
export const pint =
  'https://emerald-adverse-crawdad-725.mypinata.cloud/{CID}?pinataGatewayToken={Gateway API Key}';

export const REACT_APP_PINATA_API_KEY = key_here;
export const REACT_APP_PINATA_API_SECRET =key_here;

export const CENTRAL_SERVER_URL = 'http://localhost:3005/api';
