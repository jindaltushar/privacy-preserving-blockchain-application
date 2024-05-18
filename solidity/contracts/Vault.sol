//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ContractStore.sol";
import "./AuthenticatedViewCall.sol";

contract Vault is AuthenticatedViewCall{

    ContractStore public contractStore;

    enum PAYMENTSTATUS{
        WAITING_FOR_TIMEOUT,
        DISPUTED,
        APPROVED,
        DISPERSED,
        REVERTED,
        ACCESS_REVOKED
    }


    struct BalancePayment{
        uint256 id;
        bytes32 userUniqueIdentifier;
        address addressToPay;
        uint256 organisationWhoPaid;
        uint256 paymentForSurveyId;
        PAYMENTSTATUS status;
        uint256 amountToReward;
        uint256 createdAt;
        bool adminInvited;
        uint256 validTill; 
        bytes32 encryptionKey;
    }

    mapping(uint256 => BalancePayment) private rewards;
    mapping(uint256 => uint256[]) private surveyIdToRewardsMapping;
    mapping(address => uint256[]) private userAddressToRewardsMapping;
    mapping(uint256 => uint256[]) private organisationToRewardsMapping;
    uint256 private rewardsCount;

    constructor(address _contractStore) payable {
        contractStore = ContractStore(_contractStore);
    }

    function addRewardsRequest(bytes32 _userUniqueIdentifier, address _addressToPay, uint256 _organisationWhoPaid, uint256 _paymentForSurveyId, uint256 _amountToReward, uint256 _validTill) public {
        require(msg.sender==contractStore.surveyContractAddress()|| msg.sender==contractStore.surveyBackendContractAddress());
        require(_validTill > block.timestamp);
        uint256 _createdAt = block.timestamp;
        rewards[rewardsCount] = BalancePayment(rewardsCount,_userUniqueIdentifier, _addressToPay, _organisationWhoPaid, _paymentForSurveyId, PAYMENTSTATUS.WAITING_FOR_TIMEOUT, _amountToReward, _createdAt, false, _validTill, "");
        surveyIdToRewardsMapping[_paymentForSurveyId].push(rewardsCount);
        userAddressToRewardsMapping[_addressToPay].push(rewardsCount);
        organisationToRewardsMapping[_organisationWhoPaid].push(rewardsCount);
        rewardsCount++;
    }

    function requestDispersalTransaction(uint256 rewardsIs,SignIn calldata auth) public view {
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        require(rewards[rewardsIs].addressToPay == auth.user);
        PAYMENTSTATUS status = rewards[rewardsIs].status;
        if(status == PAYMENTSTATUS.WAITING_FOR_TIMEOUT){
            require(rewards[rewardsIs].validTill < block.timestamp);
            
        }if(status == PAYMENTSTATUS.APPROVED){
            
        }
    }
    

}