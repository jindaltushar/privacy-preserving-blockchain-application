// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ContractStore.sol";
import "./AuthenticatedViewCall.sol";
import "./ISurveyBackendContract.sol";

import {SurveyResponseViewForRespondantStruct,AnswersOfAQuestionStruct,AnswerPair,QuestionData,questionCreateRequest,QuestionInstanceStructForOrganisationSurveyView,AudienceFilterStructForOrganisationSurveyView,MinimalSurveyView,AudienceFilterRequest,TOKENS,CHAINS,PREV_RESPONSE_VALUE_MATCH_TYPE,FILTER_TYPE,surveyCreationRequest,OptionsToCreate,IPFSHash,QuestionType,AnswerType,SurveyStatus,Question,Answer,QuestionInstance,AudienceFilter,Survey,QuestionOption} from "./Types.sol";

contract SurveyContract is AuthenticatedViewCall{

    error DelegateCallFailed();
    error QuestionIsPrivate();
    error UserNotPartOfOrganisation();
    error CanNotAnswerSurvey();
    mapping(uint256 => Question) private questions;
    mapping(uint256 => Answer) private answers;
    mapping(uint256 => Survey) private surveys;
    mapping(uint256 => uint256[]) private organisationsAllSurveys;
    mapping(uint256 => uint256[]) private usersAllAnswers;
    mapping(uint256 => AnswerPair[]) private questionAnswers;
   mapping (uint256 => uint256[]) private questionAnsweredBy;
   mapping(uint256=>uint256[]) private surveyAnswers; //mapping of surveyid to all its answers ids
   mapping(uint256=>uint256[]) private usersAllSurveysAnswered; //mapping of all the survey ids which a user has answered
   mapping(address=>uint256[]) private userPrivateSurveyInvitations; //mapping of all the private survey ids which a user has been invited to
   mapping(uint256=>bytes[]) private organisationNotifications;
    //DAO IS PROFILE

    ContractStore public contractStore;

    event SurveyCreated(uint256 indexed surveyId,bytes32 surveyTitle,IPFSHash surveyTitleIPFS,IPFSHash surveyIntroIPFS);

    event OptionsAdded(uint256[] data);

    event QuestionsAdded(QuestionData[] data);

    event SurveyAnswered(bytes32 indexed surveyId,uint256 indexed blocktime);

    event TxRequest(bytes data);

    uint256 private questionCounter;
    uint256 private surveyCounter;
    uint256 private answerCounter;
    uint256 public surveyPrice;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor (address _contractStore) {
        contractStore = ContractStore(_contractStore);
        questionCounter = 100;
        surveyCounter = 100;
        answerCounter = 100;
        surveyPrice = 0.1 ether;
    }

    function _performDelegation(bytes memory dataToSend) internal {
        (bool success,) = contractStore.surveyBackendContractAddress().delegatecall(dataToSend);
        if(!success){
            revert DelegateCallFailed();
        }
    }
    //delegated
    function createQuestions(
       questionCreateRequest[] calldata _questions,uint256 organisationId
        )   public {
        //delegate call
        _performDelegation(abi.encodeWithSelector(
            ISurveyBackendContract.createQuestions.selector,
            _questions,
            organisationId,
            msg.sender
        ));
        
    }
    //delegated
    function createOptions(OptionsToCreate[] calldata _options,uint256 organisationId) public  {
        _performDelegation(abi.encodeWithSelector(
            ISurveyBackendContract.createOptions.selector,
            _options,
            organisationId,
            msg.sender
        ));
    }

    function getQuestionOptions(uint256 _questionId) public view returns (QuestionOption[] memory optionsString) {
        if (questions[_questionId].isPrivate == true){
            revert QuestionIsPrivate();}
        if (questions[_questionId].qType == QuestionType.RADIOBUTTON || questions[_questionId].qType == QuestionType.CHECKBOXES){
            return questions[_questionId].optionsString;
        }
    }

    //delegated
    function createSurvey(surveyCreationRequest calldata _request) public {
        _performDelegation(abi.encodeWithSelector(
            ISurveyBackendContract.createSurvey.selector,
            _request
        ));
    }


    function getAllSurveysOfOrganisation(uint256 organisationId,SignIn calldata auth) public view  returns (MinimalSurveyView[] memory){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        if(!contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,organisationId)){
            revert UserNotPartOfOrganisation();
        
        }
        uint256[] memory surveyIds = organisationsAllSurveys[organisationId];
        MinimalSurveyView[] memory surveysData = new MinimalSurveyView[](surveyIds.length);
        for (uint i = 0; i < surveyIds.length; i++){
            surveysData[i] = MinimalSurveyView(surveys[surveyIds[i]].surveyId,surveys[surveyIds[i]].surveyTitle,surveys[surveyIds[i]].surveyTitleIPFS,surveys[surveyIds[i]].isSurveyPrivate,surveys[surveyIds[i]].validUntil,surveys[surveyIds[i]].targetAudienceSize,surveys[surveyIds[i]].targetAudienceReached,surveys[surveyIds[i]].surveyStatus);
        }
        return surveysData;
    }

    function getSurveyQuestionsData(uint256 surveyId) internal view returns (QuestionInstanceStructForOrganisationSurveyView[] memory){
        Survey memory surveyData = surveys[surveyId];
        QuestionInstanceStructForOrganisationSurveyView[] memory questionsData = new QuestionInstanceStructForOrganisationSurveyView[](surveyData.questions.length);
        for (uint i = 0; i < surveyData.questions.length; i++){
            uint256 questionId = surveyData.questions[i].questionId;
            questionsData[i] = QuestionInstanceStructForOrganisationSurveyView(questionId,questions[questionId].qType,questions[questionId].questionIPFSHash,questions[questionId].optionsString,surveyData.questions[i].isMandatory,surveyData.questions[i].answerTypeAllowed,surveyData.questions[i].privacyLevelRating);
            // add only those option strings which are selected
            if (questions[questionId].qType == QuestionType.RADIOBUTTON || questions[questionId].qType == QuestionType.CHECKBOXES){
                QuestionOption[] memory selectedOptions = new QuestionOption[](surveyData.questions[i].selectedOptionsIndex.length);
                for (uint j = 0; j < surveyData.questions[i].selectedOptionsIndex.length; j++){
                    selectedOptions[j] = questions[questionId].optionsString[surveyData.questions[i].selectedOptionsIndex[j]];
                }
                questionsData[i].selectedOptionsIndexOptionString = selectedOptions;
            }
        }
        return questionsData;
    }

    function getAudienceDataOfSurvey(uint256 surveyId) internal view returns (AudienceFilterStructForOrganisationSurveyView[] memory){
        Survey memory surveyData = surveys[surveyId];
        AudienceFilterStructForOrganisationSurveyView[] memory audienceFiltersData = new AudienceFilterStructForOrganisationSurveyView[](surveyData.audienceFilters.length);
        for (uint i = 0; i < surveyData.audienceFilters.length; i++){
            audienceFiltersData[i] = AudienceFilterStructForOrganisationSurveyView(surveyData.audienceFilters[i].filter_type,surveyData.audienceFilters[i].address_list,surveyData.audienceFilters[i].prev_response_value_questionId,questions[surveyData.audienceFilters[i].prev_response_value_questionId].questionIPFSHash,surveyData.audienceFilters[i].prev_response_value_matchType,questions[surveyData.audienceFilters[i].prev_response_value_questionId].optionsString,surveyData.audienceFilters[i].token_reserve_selectedToken,surveyData.audienceFilters[i].token_reserve_minAmount,surveyData.audienceFilters[i].token_reserve_selectedChain,surveyData.audienceFilters[i].token_reserve_contractAddress,surveyData.audienceFilters[i].nft_token_selectedchain,surveyData.audienceFilters[i].nft_token_nftContractAddress,surveyData.audienceFilters[i].survey_answered_id,surveyData.audienceFilters[i].active);
            // add only those options strings which are selected
            if (surveyData.audienceFilters[i].filter_type == FILTER_TYPE.PREV_RESPONSE_VALUE){
                if (questions[surveyData.audienceFilters[i].prev_response_value_questionId].qType == QuestionType.RADIOBUTTON || questions[surveyData.audienceFilters[i].prev_response_value_questionId].qType == QuestionType.CHECKBOXES){
                    QuestionOption[] memory selectedOptions = new QuestionOption[](surveyData.audienceFilters[i].prev_response_value_options.length);
                    for (uint j = 0; j < surveyData.audienceFilters[i].prev_response_value_options.length; j++){
                        selectedOptions[j] = questions[surveyData.audienceFilters[i].prev_response_value_questionId].optionsString[surveyData.audienceFilters[i].prev_response_value_options[j]];
                    }
                    audienceFiltersData[i].prev_response_value_options_optionString = selectedOptions;
                }
            }
        }
        return audienceFiltersData;
    }

    function getOrganisationViewofSurvey(uint256 surveyId,SignIn calldata auth) public view  returns (Survey memory surveyData,QuestionInstanceStructForOrganisationSurveyView[] memory questionsData,AudienceFilterStructForOrganisationSurveyView[] memory audienceFiltersData,bytes32  surveyIDencrypted){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        if(!contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,surveys[surveyId].createdBy)){
            revert UserNotPartOfOrganisation();
        }
        surveyData = surveys[surveyId];
        questionsData = getSurveyQuestionsData(surveyId);
        audienceFiltersData = getAudienceDataOfSurvey(surveyId);
        bytes32 _surveyIDencrypted = keccak256(contractStore.gaslessContract().SapphireEncrypt(abi.encode(surveyData.surveyId),0x7365637265740000000000000000000000000000000000000000000000000000));
        return (surveyData,questionsData,audienceFiltersData,_surveyIDencrypted);

    }

    function checkRespondantOnChainFilters(uint256 surveyId,SignIn calldata auth) public view  returns (AudienceFilterStructForOrganisationSurveyView[] memory){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        if(!_canAnswerSurvey(surveyId,auth.user)){
            revert CanNotAnswerSurvey();
        
        }
        // check if the user is in the address list filter of the survey
        Survey memory surveyData = surveys[surveyId];
        AudienceFilterStructForOrganisationSurveyView[] memory audienceFiltersData = new AudienceFilterStructForOrganisationSurveyView[](surveyData.audienceFilters.length);
        // return only those filters where filter type is TOKEN_RESERVE or NFT_TOKEN
        uint256 counter = 0;
        for (uint i = 0; i < surveyData.audienceFilters.length; i++){
            if (surveyData.audienceFilters[i].filter_type == FILTER_TYPE.TOKEN_RESERVE || surveyData.audienceFilters[i].filter_type == FILTER_TYPE.NFT_TOKEN){
                audienceFiltersData[counter] = AudienceFilterStructForOrganisationSurveyView(surveyData.audienceFilters[i].filter_type,surveyData.audienceFilters[i].address_list,surveyData.audienceFilters[i].prev_response_value_questionId,questions[surveyData.audienceFilters[i].prev_response_value_questionId].questionIPFSHash,surveyData.audienceFilters[i].prev_response_value_matchType,questions[surveyData.audienceFilters[i].prev_response_value_questionId].optionsString,surveyData.audienceFilters[i].token_reserve_selectedToken,surveyData.audienceFilters[i].token_reserve_minAmount,surveyData.audienceFilters[i].token_reserve_selectedChain,surveyData.audienceFilters[i].token_reserve_contractAddress,surveyData.audienceFilters[i].nft_token_selectedchain,surveyData.audienceFilters[i].nft_token_nftContractAddress,surveyData.audienceFilters[i].survey_answered_id,surveyData.audienceFilters[i].active);
                counter++;
            }
        }
        return audienceFiltersData;
    }

    function getRespondantViewOfSurvey(uint256 surveyId,SignIn calldata auth) public view  returns (bytes32 surveyTitle,IPFSHash memory surveyTitleIPFS,IPFSHash memory surveyIntroIPFS,bytes32 surveyNonce,bytes32 orgUserName,QuestionInstanceStructForOrganisationSurveyView[] memory questionsData){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        if(!_canAnswerSurvey(surveyId,auth.user)){
            revert CanNotAnswerSurvey();
        }
        Survey memory surveyData = surveys[surveyId];
        bytes32 _surveyTitle = surveyData.surveyTitle;
        IPFSHash memory _surveyTitleIPFS = surveyData.surveyTitleIPFS;
        IPFSHash memory _surveyIntroIPFS = surveyData.surveyIntroIPFS;
        bytes32 _surveyNonce = surveyData.surveyNonce;
        bytes32 _orgUserName = contractStore.profileContract().getOrganisationUsernameFromId(surveyData.createdBy);
        QuestionInstanceStructForOrganisationSurveyView[] memory _questionsData = getSurveyQuestionsData(surveyId);
        return (_surveyTitle,_surveyTitleIPFS,_surveyIntroIPFS,_surveyNonce,_orgUserName,_questionsData);
    }

    function _canAnswerSurvey(uint256 surveyId,address userAddress) internal view returns (bool){
        //get userid from auth.user
        // check if survey id is valiid
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(userAddress);
        if (surveys[surveyId].surveyId == 0){
            return false;
        }
        if (surveys[surveyId].surveyStatus != SurveyStatus.ACTIVE){
            return false;
        }
        //check if user has already answered the survey
        for (uint i = 0; i < surveyAnswers[surveyId].length; i++){
            if (answers[surveyAnswers[surveyId][i]].answeredBy == userId){
                return false;
            }
        }
        // if filter length of survey is 0 then return true
        if (surveys[surveyId].audienceFilters.length == 0){
            return true;
        }
        // check if user.address is in the address list filter of the survey or has answered the requested survey
        for (uint i = 0; i < surveys[surveyId].audienceFilters.length; i++){
            if (surveys[surveyId].audienceFilters[i].filter_type == FILTER_TYPE.ADDRESS_LIST){
                for (uint j = 0; j < surveys[surveyId].audienceFilters[i].address_list.length; j++){
                    if (surveys[surveyId].audienceFilters[i].address_list[j] == userAddress){
                        return true;
                    }
                }
            }
            if (surveys[surveyId].audienceFilters[i].filter_type == FILTER_TYPE.SURVEY_ANSWERED){
                uint256[] memory userAnswers = usersAllAnswers[userId];
                for (uint j = 0; j < userAnswers.length; j++){
                    if (userAnswers[j] == surveys[surveyId].audienceFilters[i].survey_answered_id){
                        return true;
                    }
                }
            }
        }
        bool masterCanAnswer = true;
        // check if this user answered the previous response value question then check if the answer matches the filter
        for(uint i = 0; i < surveys[surveyId].audienceFilters.length; i++){
            bool canAnswer = true;
            if (surveys[surveyId].audienceFilters[i].filter_type == FILTER_TYPE.PREV_RESPONSE_VALUE){
                canAnswer = false;
                uint256[] memory userAnswers = usersAllAnswers[userId]; // answer ids of the user
                // for each answer id check if the answer id question id is same as filter
                for (uint j = 0; j < userAnswers.length; j++){
                    if (answers[userAnswers[j]].questionId == surveys[surveyId].audienceFilters[i].prev_response_value_questionId){
                        // check if the answer matches the filter
                        if (surveys[surveyId].audienceFilters[i].prev_response_value_matchType == PREV_RESPONSE_VALUE_MATCH_TYPE.EQUALS){
                            for (uint k = 0 ;k <answers[userAnswers[j]].optionIndexes.length; k++){
                                if (surveys[surveyId].audienceFilters[i].prev_response_value_options[0] == answers[userAnswers[j]].optionIndexes[k]){
                                    canAnswer = true;
                                    break;
                                }
                            }
                        }
                        if (surveys[surveyId].audienceFilters[i].prev_response_value_matchType == PREV_RESPONSE_VALUE_MATCH_TYPE.IS_IN){
                            for (uint k = 0; k < surveys[surveyId].audienceFilters[i].prev_response_value_options.length; k++){
                                for (uint l = 0; l < answers[userAnswers[j]].optionIndexes.length; l++){
                                    if (surveys[surveyId].audienceFilters[i].prev_response_value_options[k] == answers[userAnswers[j]].optionIndexes[l]){
                                        canAnswer = true;
                                        break;
                                    }
                                }
                                if(canAnswer){
                                    break;
                                }
                            }
                            if(canAnswer){
                                break;
                            }
                        }
                        if(canAnswer){
                            break;
                        }
                    }
                }
                
            }
            masterCanAnswer = masterCanAnswer && canAnswer;
            if(!masterCanAnswer){
                return false;
            }
        }
        return true;
    }

    function getSurveyCreatedBy(uint256 surveyId) public view returns (uint256){
        require(contractStore.gaslessContractAddress() == msg.sender);
        return surveys[surveyId].createdBy;
    }
    //delegated
    function SubmitAnswerToSurveyWithProxy(uint256 surveyId,uint256[] calldata questionIndex,bytes32[] calldata answerHashIPFSDigest,uint8[] calldata answerHashIPFSHashFunction, uint8[] calldata answerHashIPFSHashSize, uint256[][] calldata  optionIndexes,AnswerType[] calldata ansType,address userAddress) external {
        require( msg.sender == contractStore.gaslessContractAddress());
        _performDelegation(abi.encodeWithSelector(
            ISurveyBackendContract.SubmitAnswerToSurvey.selector,
            surveyId,
            questionIndex,
            answerHashIPFSDigest,
            answerHashIPFSHashFunction,
            answerHashIPFSHashSize,
            optionIndexes,
            ansType,userAddress));
    }

    function findIndexes(uint[] memory _answers, uint[] memory _questInstance) internal pure returns (uint[] memory) {
        uint[] memory indexes = new uint[](_answers.length);
        for (uint i = 0; i < _answers.length; i++) {
            uint _answer = _answers[i];
            for (uint j = 0; j < _questInstance.length; j++) {
                if (_questInstance[j] == _answer) {
                    indexes[i] = j;
                    break;
                }
            }
        }
        return indexes;
    }

    function getAnswersOfQuestionInSurvey(uint256 surveyId,uint256 questionIndexId,SignIn calldata auth) public view  returns (AnswersOfAQuestionStruct[] memory){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        if(!contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,surveys[surveyId].createdBy)){
            revert UserNotPartOfOrganisation();
        }

        // list of all answerids for this questionid in this surveyid
        uint256[] memory questionAnswerIds;
        uint256 count = 0;
        // get questionid from questionIndexId
        uint256 questionId = surveys[surveyId].questions[questionIndexId].questionId;
        
        for (uint i = 0; i < surveyAnswers[surveyId].length; i++) {
            if (answers[surveyAnswers[surveyId][i]].questionId == questionId) {
                count++;
            }
        }
        
        questionAnswerIds = new uint256[](count);
        count= 0;
        for (uint i = 0; i < surveyAnswers[surveyId].length; i++) {
            if (answers[surveyAnswers[surveyId][i]].questionId == questionId) {
                questionAnswerIds[count] = surveyAnswers[surveyId][i];
                count++;
            }
        }

        //getting selectedOptionIndexes of the Question Instance 
        uint256[] memory globalIndexes;
        for (uint i = 0; i < surveys[surveyId].questions.length; i++){
            if(surveys[surveyId].questions[i].questionId == questionId){
                globalIndexes = surveys[surveyId].questions[i].selectedOptionsIndex;
                break;
            }
        }
        QuestionType qType = questions[questionId].qType;
        // from these answerids create questionAnswers[] struct
        AnswersOfAQuestionStruct[] memory answersData = new AnswersOfAQuestionStruct[](questionAnswerIds.length);
        for (uint i = 0; i < questionAnswerIds.length; i++){
            uint256[] memory options;
            bytes32 encodedAnsweredBy;
            // if response type is analysis then set encodedAnsweredBy to bytes32(0)
            if (answers[questionAnswerIds[i]].answerType == AnswerType.ANALYSIS){
                encodedAnsweredBy = bytes32(0);
            }else{
            encodedAnsweredBy = keccak256(abi.encodePacked(answers[questionAnswerIds[i]].answeredBy,surveyId));}
            //convert global answer id to local answer id
            if(qType==QuestionType.RADIOBUTTON || qType==QuestionType.CHECKBOXES){
                options = findIndexes(answers[questionAnswerIds[i]].optionIndexes,globalIndexes);
            }else{
                options = answers[questionAnswerIds[i]].optionIndexes;
            
            }
            answersData[i] = AnswersOfAQuestionStruct(encodedAnsweredBy,options,answers[questionAnswerIds[i]].answerHashIPFS);
        }
        return answersData;
    }
    // delegated
    function editSurvey(uint256 surveyId,SurveyStatus newstatus,address[] calldata newAddressList,uint256 new_audience_size,uint256 new_expiry_time) public {
        _performDelegation(abi.encodeWithSelector(
            ISurveyBackendContract.editSurvey.selector,
            surveyId,
            newstatus,
            newAddressList,
            new_audience_size,
            new_expiry_time
        ));
    }

    function getSurveysActiveStatus() public view returns (SurveyStatus[] memory,bool[] memory ){
        SurveyStatus[] memory surveyStatuses = new SurveyStatus[](surveyCounter-100);
        bool[] memory surveyIsPrivate = new bool[](surveyCounter-100);
        for (uint i = 0; i < surveyStatuses.length; i++){
            surveyStatuses[i] = surveys[i+100].surveyStatus;
            surveyIsPrivate[i] = surveys[i+100].isSurveyPrivate;
        }
        return (surveyStatuses,surveyIsPrivate);
    }

    function getMyPrivateInvitations(SignIn calldata auth) external view returns (uint256[] memory) {
        require(isAuthenticated(auth, contractStore.profileContractAddress()));
        return userPrivateSurveyInvitations[auth.user];
    }

    function getMyAnsweredSurveys(SignIn calldata auth) external view returns (uint256[] memory) {
        require(isAuthenticated(auth, contractStore.profileContractAddress()));
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(auth.user);
        return usersAllSurveysAnswered[userId];
    }

    function getSurveyBasicInfo(uint256 surveyId,SignIn calldata auth,bool getAnsweredAt) external view returns (bytes32 surveyTitle,IPFSHash memory surveyTitleIPFS,IPFSHash memory surveyIntroIPFS,uint256 createdBy,uint256 createdAt,uint256 answeredAt,uint256 validTill){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(auth.user);
        if(surveys[surveyId].isSurveyPrivate){
            //check if surveyid exists in userPrivateSurveyInvitations
            bool isUserInvited = false;
            for (uint i = 0; i < userPrivateSurveyInvitations[auth.user].length; i++){
                if (userPrivateSurveyInvitations[auth.user][i] == surveyId){
                    isUserInvited = true;
                    break;
                }
            }
            //check if survey exists in users answered surveys'
            for (uint i = 0; i < usersAllSurveysAnswered[userId].length; i++){
                if (usersAllSurveysAnswered[userId][i] == surveyId){
                    isUserInvited = true;
                    break;
                }
            }
            require(isUserInvited);
        }
        surveyTitle = surveys[surveyId].surveyTitle;
        surveyTitleIPFS = surveys[surveyId].surveyTitleIPFS;
        surveyIntroIPFS = surveys[surveyId].surveyIntroIPFS;
        createdBy = surveys[surveyId].createdBy;
        createdAt = surveys[surveyId].createdAt;
        validTill = surveys[surveyId].validUntil;
        answeredAt =0 ;
        if (getAnsweredAt){
            // check if surveyid exist in usersAllSurveysAnswered for user
            for (uint i = 0; i < usersAllSurveysAnswered[userId].length; i++){
                if (usersAllSurveysAnswered[userId][i] == surveyId){
                    answeredAt = answers[surveyAnswers[surveyId][0]].answeredOn;
                    break;
                }
            }
        }
        return (surveyTitle,surveyTitleIPFS,surveyIntroIPFS,createdBy,createdAt,answeredAt,validTill);
    }

    function viewMySurveyResponse(uint256 surveyId,SignIn calldata auth) public view returns (SurveyResponseViewForRespondantStruct memory){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(auth.user);
        // get all the questionids of the survey, and for those questionids find user answers
        uint256[] memory questionIds = new uint256[](surveys[surveyId].questions.length);
        for (uint i = 0; i < surveys[surveyId].questions.length; i++){
            questionIds[i] = surveys[surveyId].questions[i].questionId;
        }
        uint256[] memory userAnswers = usersAllAnswers[userId];
        uint256[] memory questionAnswerIds = new uint256[](surveys[surveyId].questions.length);
        for (uint i = 0; i < userAnswers.length; i++){
            for (uint j = 0; j < questionIds.length; j++){
                if (answers[userAnswers[i]].questionId == questionIds[j] && answers[userAnswers[i]].answeredInSurveyId == surveyId){
                    questionAnswerIds[j] = userAnswers[i];
                    break;
                }
            }
        }
        // create new SurveyResponseViewForRespondantStruct struct
        SurveyResponseViewForRespondantStruct memory surveyResponseData;
        surveyResponseData.surveyId = surveyId;
        surveyResponseData.surveyTitle = surveys[surveyId].surveyTitle;
        surveyResponseData.surveyTitleIPFS = surveys[surveyId].surveyTitleIPFS;
        surveyResponseData.surveyIntroIPFS = surveys[surveyId].surveyIntroIPFS;
        surveyResponseData.createdBy = surveys[surveyId].createdBy;
        surveyResponseData.createdAt = surveys[surveyId].createdAt;
        surveyResponseData.answers = new AnswersOfAQuestionStruct[](questionAnswerIds.length);
        surveyResponseData.answerIds = questionAnswerIds;
        surveyResponseData.questions = getSurveyQuestionsData(surveyId);
        surveyResponseData.optionIndexes = new uint256[][](questionAnswerIds.length);
        surveyResponseData.answerType = new AnswerType[](questionAnswerIds.length);
        surveyResponseData.surveyNonce = surveys[surveyId].surveyNonce;
        surveyResponseData.answerHashIPFSs = new IPFSHash[](questionAnswerIds.length);
        for (uint i = 0; i < questionAnswerIds.length; i++){
            surveyResponseData.optionIndexes[i] = answers[questionAnswerIds[i]].optionIndexes;
            surveyResponseData.answerType[i] = answers[questionAnswerIds[i]].answerType;
            surveyResponseData.answerHashIPFSs[i] = answers[questionAnswerIds[i]].answerHashIPFS;
        }
        return surveyResponseData;
    }

    function totalSurveys() public view returns (uint256){
        return surveyCounter-100;
    }

    // delegated
    function revokeAccess(uint256 surveyId) public payable{
        _performDelegation(abi.encodeWithSelector(
            ISurveyBackendContract.revokeAccessToSurvey.selector,
            surveyId,
            msg.sender
        ));
    }

    function getMyNotifications(uint256 organisationId) public view returns (bytes[] memory){
        return organisationNotifications[organisationId];
    }

}