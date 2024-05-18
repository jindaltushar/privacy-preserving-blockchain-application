pragma solidity ^0.8.0;

import {questionCreateRequest,OptionsToCreate,surveyCreationRequest,AnswerType,SurveyStatus} from "./Types.sol";

interface ISurveyBackendContract {
    function createQuestions(
        questionCreateRequest[] calldata _questions,
        uint256 organisationId,
        address user
    ) external;

    function createOptions(
        OptionsToCreate[] calldata _options,
        uint256 organisationId,
        address user
    ) external;

    function createSurvey(surveyCreationRequest calldata _request) external;

    function SubmitAnswerToSurvey(
        uint256 surveyId,
        uint256[] calldata questionIndex,
        bytes32[] calldata answerHashIPFSDigest,
        uint8[] calldata answerHashIPFSHashFunction,
        uint8[] calldata answerHashIPFSHashSize,
        uint256[][] calldata optionIndexes,
        AnswerType[] calldata ansType,
        address userAddress
    ) external;
    function editSurvey(uint256 surveyId,SurveyStatus newstatus,address[] calldata newAddressList,uint256 new_audience_size,uint256 new_expiry_time) external; 
    function revokeAccessToSurvey(uint256 surveyId,address userAddress) external payable;
}