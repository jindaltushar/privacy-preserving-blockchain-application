//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IGatewayTokenVerifier} from "@identity.com/gateway-protocol-eth/contracts/interfaces/IGatewayTokenVerifier.sol";
import "./IGatewayToken.sol";
import "./IMsgExampleBasic.sol";
// Your contract
contract VerifyCivicPassOnFantomTestnet {

    address public gatewayTokenContract;
    IGatewayToken public contractGateway;
    IMsgExampleBasic public MsgExecutorContract;
    address public ProfileContractAddress;
    uint64 public SapphireChainId;
    address public owner;
    constructor(address _gatewayTokenContract) 
         {
            gatewayTokenContract = _gatewayTokenContract;
            contractGateway = IGatewayToken(_gatewayTokenContract);
            SapphireChainId = 23295;
            owner = msg.sender;
    }


    function updateContractAddresses(address _profileContractAddress,address _msgExecutor) external {
        require(msg.sender == owner);
        ProfileContractAddress = _profileContractAddress;
        MsgExecutorContract = IMsgExampleBasic(_msgExecutor);
    }

    function myFunction(address add,uint256 network) internal view returns (bool) {
        IGatewayTokenVerifier verifier = IGatewayTokenVerifier(gatewayTokenContract);
        if (!verifier.verifyToken(add, network)) {
            return false;
        }else{
            return true;
        }
    }
    function newfunction(address owner,bool anyactive)internal view returns (uint256){
        return contractGateway.getTokenIdsByOwnerAndNetwork(owner,10,anyactive)[0];
    }
    function getToken(uint256 tokenId) internal view returns  (address owner, uint8 state, string memory identity, uint256 expiration, uint256 bitmask){
        return contractGateway.getToken(tokenId);
    }
    function getUserCivicVertificationStatus(address user) external payable{
        if(myFunction(user,10)){
            uint256 tokenId = newfunction(user,true);
            (address owner, uint8 state, string memory identity, uint256 expiration, uint256 bitmask) = getToken(tokenId);
            bytes memory data = abi.encode(user,true,expiration);
            MsgExecutorContract.sendMessage{value: msg.value}(ProfileContractAddress,SapphireChainId,data);
        }
    }

}
// uniqobk8oGh4XBLMqM68K8M2zNu3CdYX7q5go7whQiv
// 0xF65b6396dF6B7e2D8a6270E3AB6c7BB08BAEF22E

// delpoyed to fantom at 0x7bbD1C245d418FCa39cB91a8b56dB76B76c79ebc