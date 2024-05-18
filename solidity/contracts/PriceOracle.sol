//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {QuestionType,AnswerType} from './Types.sol';
import "./ContractStore.sol";
interface IStdReference {
    /// A structure returned whenever someone requests for standard reference data.
    struct ReferenceData {
        uint256 rate; // base/quote exchange rate, multiplied by 1e18.
        uint256 lastUpdatedBase; // UNIX epoch of the last time when base price gets updated.
        uint256 lastUpdatedQuote; // UNIX epoch of the last time when quote price gets updated.
    }

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(string memory _base, string memory _quote)
        external
        view
        returns (ReferenceData memory);

    /// Similar to getReferenceData, but with multiple base/quote pairs at once.
    function getReferenceDataBulk(string[] memory _bases, string[] memory _quotes)
        external
        view
        returns (ReferenceData[] memory);
}

contract PriceOracle  {
    IStdReference ref;
    ContractStore public contractStore;

    uint256 public price;
    uint64[6] public rewardForSecrecyPoints;
    uint64[3] public rewardForResponseType;

    constructor(IStdReference _ref,uint64[6] memory _rewardForSecrecyPoints, uint64[3] memory _rewardForResponseType, address _contract_store) {
        ref = _ref;
        rewardForSecrecyPoints = _rewardForSecrecyPoints;
        rewardForResponseType = _rewardForResponseType;
        contractStore = ContractStore(_contract_store);
    }

    function getPrivacyPointsForPrivacyLevel(uint256 privacyLevel) public view returns (uint64) {
       if(privacyLevel == 0){
           return rewardForSecrecyPoints[0];
        }
        else if(privacyLevel == 1){
            return rewardForSecrecyPoints[1];
        }
        else if(privacyLevel == 2){
            return rewardForSecrecyPoints[2];
        }
        else if(privacyLevel == 3){
            return  rewardForSecrecyPoints[3];
        }
        else if(privacyLevel == 4){
            return rewardForSecrecyPoints[4];
        }
        else if(privacyLevel == 5){
            return rewardForSecrecyPoints[5];
        }
        else{
            return rewardForSecrecyPoints[5];
        }
    }

    struct PrivacyObject {
        uint64 privacyLevel;
        uint64 privacyPoints;
    }
    function getPrivacyPoints() public view returns (PrivacyObject[] memory) {
        PrivacyObject[] memory privacyPoints = new PrivacyObject[](6);
        privacyPoints[0] = PrivacyObject(0, rewardForSecrecyPoints[0]);
        privacyPoints[1] = PrivacyObject(1, rewardForSecrecyPoints[1]);
        privacyPoints[2] = PrivacyObject(2, rewardForSecrecyPoints[2]);
        privacyPoints[3] = PrivacyObject(3, rewardForSecrecyPoints[3]);
        privacyPoints[4] = PrivacyObject(4, rewardForSecrecyPoints[4]);
        privacyPoints[5] = PrivacyObject(5, rewardForSecrecyPoints[5]);
        return privacyPoints;
    }

    function getPriceForResponseType(AnswerType ansType) public view returns (uint64){
        if(ansType == AnswerType.PUBLIC){
            return rewardForResponseType[0];
        }
        else if(ansType == AnswerType.ANALYSIS){
            return rewardForResponseType[1];
        }
        else if(ansType == AnswerType.PRIVATE){
            return rewardForResponseType[2];
        }
        else{
            return rewardForResponseType[2];
        }
    }

    struct PriceObject {
        AnswerType ansType;
        uint64 price;
    }

    function getPriceForAnswerType() public view returns (PriceObject[] memory) {
        PriceObject[] memory priceForAnswerType = new PriceObject[](3);
        priceForAnswerType[0] = PriceObject(AnswerType.PUBLIC, rewardForResponseType[0]);
        priceForAnswerType[1] = PriceObject(AnswerType.ANALYSIS, rewardForResponseType[1]);
        priceForAnswerType[2] = PriceObject(AnswerType.PRIVATE, rewardForResponseType[2]);
        return priceForAnswerType;
    }

    function getPrice(string memory a, string memory b) external view returns (uint256){
        IStdReference.ReferenceData memory data = ref.getReferenceData(a,b);
        return data.rate;
    }

    function getRewardsToAnswerForATypeOfQuestionAndPrivacy(AnswerType ansType, uint64 privacyLevel) public view returns (uint256){
        return getPriceForResponseType(ansType) * getPrivacyPointsForPrivacyLevel(privacyLevel);
    }

    struct QuestionObjectForRewardCalculation{
        AnswerType qType;
        uint64 privacyLevel;
    }

    function getRewardsToAnswerSurvey(QuestionObjectForRewardCalculation[] memory questions) public view returns (uint256){
        uint256 totalRewards = 0;
        for(uint i = 0; i < questions.length; i++){
            totalRewards += getRewardsToAnswerForATypeOfQuestionAndPrivacy(questions[i].qType, questions[i].privacyLevel);
        }
        return totalRewards;
    }

    function setRewardForSecrecyPoints(uint64[6] memory _rewardForSecrecyPoints) public  {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));
        rewardForSecrecyPoints = _rewardForSecrecyPoints;
    }

    function setRewardForResponseType(uint64[3] memory _rewardForResponseType) public  {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));
        rewardForResponseType = _rewardForResponseType;
    }

    function getGasPrice(string memory action) external pure returns(uint256){
        if(keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("createQuestion"))){
            return 100;
        }
        else if(keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("answerQuestion"))){
            return 200;
        }
        else if(keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("changeAnswer"))){
            return 300;
        }
        else if(keccak256(abi.encodePacked(action)) == keccak256(abi.encodePacked("deleteQuestion"))){
            return 400;
        }
        else{
            return 500;
        }
    }

}
