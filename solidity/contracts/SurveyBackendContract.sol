// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ContractStore.sol";
import "./AuthenticatedViewCall.sol";

import {AnswersOfAQuestionStruct,AnswerPair,QuestionData,questionCreateRequest,QuestionInstanceStructForOrganisationSurveyView,AudienceFilterStructForOrganisationSurveyView,MinimalSurveyView,AudienceFilterRequest,TOKENS,CHAINS,PREV_RESPONSE_VALUE_MATCH_TYPE,FILTER_TYPE,surveyCreationRequest,OptionsToCreate,IPFSHash,QuestionType,AnswerType,SurveyStatus,Question,Answer,QuestionInstance,AudienceFilter,Survey,QuestionOption} from "./Types.sol";

contract SurveyBackendContract is AuthenticatedViewCall{

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

    function verifyUserIsMemberOfOrganisation(uint256 organisationId,address user) public view returns (bool){
        uint256[] memory orgIds = contractStore.profileContract().getUsersOrganisationsId(user);
        bool found = false;
        for (uint i = 0; i < orgIds.length; i++){
            if (orgIds[i] == organisationId){
                found = true;
                break;
            }
        }
        return found;
    }


    function createQuestions(
       questionCreateRequest[] calldata _questions,uint256 organisationId,address user)  public {
        //check if auth.user is part of organisation with id organisationId
        require(verifyUserIsMemberOfOrganisation(organisationId,user));
        // create a QuestionData[] of lenght _questions
        QuestionData[] memory data = new QuestionData[](_questions.length);
        for (uint256 i;i<_questions.length;i++){
            if ((_questions[i].questionType == 0 || _questions[i].questionType == 1) && _questions[i].QuestionOptionipfsHashSize.length <2){
                data[i].questionId = 0;
                    continue;
            }
                Question storage newQuestion = questions[questionCounter];
                newQuestion.questionId = questionCounter;
                newQuestion.qType = QuestionType(_questions[i].questionType);
                newQuestion.isPrivate = _questions[i].isPrivate;
                newQuestion.questionIPFSHash = IPFSHash(_questions[i].ipfsHashDigest,_questions[i].ipfsHashHashFunction,_questions[i].ipfsHashSize);
                newQuestion.nonce = _questions[i].questionNonce;
                newQuestion.createdBy = organisationId;
                newQuestion.optionsString = new QuestionOption[](_questions[i].QuestionOptionsBytes32.length);
                for (uint256 j = 0; j < _questions[i].QuestionOptionsBytes32.length; j++){
                    newQuestion.optionsString[j] = QuestionOption(_questions[i].QuestionOptionsBytes32[j],IPFSHash(_questions[i].QuestionOptionipfsHashDigest[j],_questions[i].QuestionOptionipfsHashHashFunction[j],_questions[i].QuestionOptionipfsHashSize[j]));
                }
                if (_questions[i].isPrivate){
                    data[i].questionId = questionCounter;
                    data[i].questionType = _questions[i].questionType;
                    data[i].questionIpfsDigest = 0x0000000000000000000000000000000000000000000000000000000000000000;
                    data[i].questionipfshashfunction = 0;
                    data[i].questionipfshashsize = 0;
                } else{
                data[i].questionId = questionCounter;
                data[i].questionType = _questions[i].questionType;
                data[i].questionIpfsDigest = _questions[i].ipfsHashDigest;
                data[i].questionipfshashfunction = _questions[i].ipfsHashHashFunction;
                data[i].questionipfshashsize = _questions[i].ipfsHashSize;}
                questionCounter++;
            }
        emit QuestionsAdded(data);
    }

    function createOptions(OptionsToCreate[] calldata _options,uint256 organisationId,address user) public  {
        //check if auth.user is part of organisation with id organisationId
        require(verifyUserIsMemberOfOrganisation(organisationId,user));
        uint256[] memory data = new uint256[](_options.length);
        for (uint256 i = 0; i < _options.length; i++){
            Question storage question = questions[_options[i].questionId];
            if (question.questionId == 0){
                data[i] = 0;
                continue;
            }
            if (question.isPrivate){
                data[i] = 0;
                continue;
            }
            if (question.qType != QuestionType.RADIOBUTTON && question.qType != QuestionType.CHECKBOXES){
                data[i] = 0;
                continue;
            }
            if (_options[i].optionString == "" && _options[i].optionSize == 0){
                data[i] = 0;
                continue;
            }
            if(_options[i].optionString != "" && _options[i].optionSize != 0){
                data[i] = 0;
                continue;
            }
            question.optionsString.push(QuestionOption(_options[i].optionString,IPFSHash(_options[i].optionDigest,_options[i].optionHashFunction,_options[i].optionSize)));
            data[i] = question.optionsString.length-1;
        }
        emit OptionsAdded(data);
    }

    function _verifySurveyBeforeCreating(surveyCreationRequest calldata _request,address userAddress) public view {
        // check if auth.user is part of organisation with id organisationId
        require(verifyUserIsMemberOfOrganisation(_request.createdBy,userAddress));
        require(contractStore.profileContract().verifyOrganisationVerificationStatus(_request.createdBy));
        require (_request.questions.length != 0);
        require(verifySurveyCreationValildity(_request.surveyAudienceSize,_request.surveyExpiryDate));
        if (_request.isSurveyPrivate){
            require (_request.surveyNonce != "");
            require(_request.audienceFilters.length != 0);
        } 
        // // check if no two questions are presnet with same question id
        for (uint i = 0; i < _request.questions.length; i++){
            for (uint j = i + 1; j < _request.questions.length ; j++){ 
                require(_request.questions[i].questionId != _request.questions[j].questionId);
            }
        }
        for (uint i = 0; i < _request.questions.length; i++){
            // check if questionId is valid
            require(questions[_request.questions[i].questionId].questionId != 0);
            if(questions[_request.questions[i].questionId].qType == QuestionType.CHECKBOXES || questions[_request.questions[i].questionId].qType == QuestionType.RADIOBUTTON){
                require(_request.questions[i].selectedOptionsIndex.length > 1);
                // // check if ans indexs exists in options
                for (uint j = 0; j < _request.questions[i].selectedOptionsIndex.length; j++){
                    if (_request.questions[i].selectedOptionsIndex[j] >= questions[_request.questions[i].questionId].optionsString.length){
                        revert CanNotAnswerSurvey();
                    }
                }
            }
            if(_request.isSurveyPrivate){
                if (!questions[_request.questions[i].questionId].isPrivate){
                    revert CanNotAnswerSurvey();
                }
                if(questions[_request.questions[i].questionId].createdBy!=_request.createdBy){
                    revert CanNotAnswerSurvey();
                }
                //allowed answer type can only be secret
                if (!(_request.questions[i].answerTypeAllowed[0]==false && _request.questions[i].answerTypeAllowed[1]==false && _request.questions[i].answerTypeAllowed[2]==true)){
                    revert CanNotAnswerSurvey();
                }
            }
            // //check privacy level rating is between 0 to 5
            if (_request.questions[i].privacyLevelRating > 5){
                revert CanNotAnswerSurvey();
            }
        }
        for (uint i=0;i<_request.audienceFilters.length;i++){
            if (_request.audienceFilters[i].filter_type ==FILTER_TYPE.ADDRESS_LIST){
                if (_request.audienceFilters[i].address_list.length == 0){
                    revert CanNotAnswerSurvey();
                }
            }
            if (_request.audienceFilters[i].filter_type == FILTER_TYPE.PREV_RESPONSE_VALUE){
                if (_request.audienceFilters[i].prev_response_value_questionId == 0){
                    revert CanNotAnswerSurvey();
                }
                // check if questionid is valid
                if (questions[_request.audienceFilters[i].prev_response_value_questionId].questionId == 0){
                    revert CanNotAnswerSurvey();
                }
                if (_request.audienceFilters[i].prev_response_value_options.length == 0){
                    revert CanNotAnswerSurvey();
                }
                if (_request.audienceFilters[i].prev_response_value_matchType == PREV_RESPONSE_VALUE_MATCH_TYPE.IS_IN){
                    if (_request.audienceFilters[i].prev_response_value_options.length < 2){
                        revert CanNotAnswerSurvey();
                    }
                }else{
                    if(_request.audienceFilters[i].prev_response_value_options.length != 1){
                        revert CanNotAnswerSurvey();
                    }
                }
                //check if indexes mentioned in prev_response_value_options are valid
                for (uint j = 0; j < _request.audienceFilters[i].prev_response_value_options.length; j++){
                    if (_request.audienceFilters[i].prev_response_value_options[j] >= questions[_request.audienceFilters[i].prev_response_value_questionId].optionsString.length){
                        revert CanNotAnswerSurvey();
                    }
                }
            }
            if (_request.audienceFilters[i].filter_type == FILTER_TYPE.TOKEN_RESERVE){
                // CHECK IF selectedtoken is set or both selected chain and contract addres is set
                if (_request.audienceFilters[i].token_reserve_selectedToken == TOKENS.NONE){
                    if(_request.audienceFilters[i].token_reserve_selectedChain == CHAINS.NONE || _request.audienceFilters[i].token_reserve_contractAddress == address(0)){
                        revert CanNotAnswerSurvey();
                    }
                }
                if(_request.audienceFilters[i].token_reserve_minAmount == 0){
                    revert CanNotAnswerSurvey();
                }
            }
            if (_request.audienceFilters[i].filter_type == FILTER_TYPE.NFT_TOKEN){
                if (_request.audienceFilters[i].nft_token_selectedchain == CHAINS.NONE || _request.audienceFilters[i].nft_token_nftContractAddress == address(0)){
                    revert CanNotAnswerSurvey();
                }
            }
            if (_request.audienceFilters[i].filter_type == FILTER_TYPE.SURVEY_ANSWERED){
                //check if survey id is valid
                if (surveys[_request.audienceFilters[i].survey_answered_id].surveyId == 0){
                    revert CanNotAnswerSurvey();
                }
            }
        }

    }

    function createSurvey(surveyCreationRequest calldata _request) external { 
        _verifySurveyBeforeCreating(_request,msg.sender);
        Survey storage newSurvey = surveys[surveyCounter];
        newSurvey.surveyId = surveyCounter;
        newSurvey.createdBy = _request.createdBy;
        newSurvey.surveyTitle = _request.titlesBytes;
        newSurvey.surveyTitleIPFS = IPFSHash(_request.titleIPFSDigest,_request.titleIPFSHashFunction,_request.titleIPFSSize);
        newSurvey.surveyIntroIPFS = IPFSHash(_request.descriptionIPFSDigest,_request.descriptionIPFSHashFunction,_request.descriptionIPFSSize);
        newSurvey.surveyNonce = _request.surveyNonce;
        newSurvey.isSurveyPrivate = _request.isSurveyPrivate;
        newSurvey.surveyStatus = SurveyStatus.ACTIVE;
        newSurvey.validUntil = _request.surveyExpiryDate;
        newSurvey.targetAudienceSize = _request.surveyAudienceSize;
        newSurvey.targetAudienceReached = 0;
        newSurvey.createdAt = block.timestamp;
        newSurvey.publishOnMarketplace = _request.publishOnMarketplace;
        newSurvey.questions = new QuestionInstance[](_request.questions.length);
        newSurvey.audienceFilters = new AudienceFilterRequest[](_request.audienceFilters.length);
        for (uint i = 0; i < _request.questions.length; i++){
            newSurvey.questions[i] = QuestionInstance(_request.questions[i].questionId,_request.questions[i].selectedOptionsIndex,_request.questions[i].isMandatory,_request.questions[i].answerTypeAllowed,_request.questions[i].privacyLevelRating);
        }
        for (uint i = 0; i < _request.audienceFilters.length; i++){
            newSurvey.audienceFilters[i] = AudienceFilterRequest(_request.audienceFilters[i].filter_type,_request.audienceFilters[i].address_list,_request.audienceFilters[i].prev_response_value_questionId,_request.audienceFilters[i].prev_response_value_matchType,_request.audienceFilters[i].prev_response_value_options,_request.audienceFilters[i].token_reserve_selectedToken,_request.audienceFilters[i].token_reserve_minAmount,_request.audienceFilters[i].token_reserve_selectedChain,_request.audienceFilters[i].token_reserve_contractAddress,_request.audienceFilters[i].nft_token_selectedchain,_request.audienceFilters[i].nft_token_nftContractAddress,_request.audienceFilters[i].survey_answered_id,_request.audienceFilters[i].active);
            if(_request.audienceFilters[i].filter_type == FILTER_TYPE.ADDRESS_LIST){
                for (uint j = 0; j < _request.audienceFilters[i].address_list.length; j++){
                    userPrivateSurveyInvitations[_request.audienceFilters[i].address_list[j]].push(surveyCounter);
                }
            }
        }
        organisationsAllSurveys[_request.createdBy].push(surveyCounter);
        if (_request.isSurveyPrivate){
            // add survey to the allowed surveys of the organisation
            emit SurveyCreated(surveyCounter,"",IPFSHash(0,0,0),IPFSHash(0,0,0));
        }
        else{
            emit SurveyCreated(surveyCounter,_request.titlesBytes,IPFSHash(_request.titleIPFSDigest,_request.titleIPFSHashFunction,_request.titleIPFSSize),IPFSHash(_request.descriptionIPFSDigest,_request.descriptionIPFSHashFunction,_request.descriptionIPFSSize));
        }
        surveyCounter++;
        contractStore.gaslessContract().newSurveyCreated(newSurvey.surveyId,newSurvey.createdBy);
    }

    function _canAnswerSurvey(uint256 surveyId,address userAddress) internal view returns (bool){
        //get userid from auth.user
        // check if survey id is valiid
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(userAddress);
        require(contractStore.profileContract().verifyUserHumanity(userId));
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

    function getValidityType( uint256 surveyAudienceSize,uint256 surveyExpiryDate) public pure returns (uint8 val){
        if (surveyAudienceSize == 0 && surveyExpiryDate == 0){
            return 0; // no validity
        }
        if (surveyAudienceSize == 0 && surveyExpiryDate != 0){
            return 1; // timed expiry
        }
        if (surveyAudienceSize != 0 && surveyExpiryDate == 0){
            return 2; // audience size
        }
        if (surveyAudienceSize != 0 && surveyExpiryDate != 0){
            return 3;  // audience size and timed expiry
        }
    }

    function verifySurveyCreationValildity(uint256 surveyAudienceSize,uint256 surveyExpiryDate) public view returns (bool val) {
        uint8 surveyValidityType = getValidityType(surveyAudienceSize,surveyExpiryDate);
        if (surveyValidityType == 0){
            return true;
        }
        if (surveyValidityType == 1){
            if (surveyExpiryDate < block.timestamp){
                revert CanNotAnswerSurvey();
            }
            return true;
        }
        if (surveyValidityType == 2){
            return true;
        }
        if (surveyValidityType == 3){
            if (surveyExpiryDate < block.timestamp){
                revert CanNotAnswerSurvey();
            }
            return true;
        }
    }

    function SubmitAnswerToSurvey(uint256 surveyId,uint256[] calldata questionIndex,bytes32[] calldata answerHashIPFSDigest,uint8[] calldata answerHashIPFSHashFunction, uint8[] calldata answerHashIPFSHashSize, uint256[][] calldata  optionIndexes,AnswerType[] calldata ansType,address userAddress) external {
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(userAddress);
        if(!_canAnswerSurvey(surveyId,userAddress)){
            revert CanNotAnswerSurvey();
        }
        uint256[] memory questionIds = new uint256[](questionIndex.length);
        for (uint i = 0; i < questionIndex.length; i++){
            questionIds[i] = surveys[surveyId].questions[questionIndex[i]].questionId;
        }
        uint256[] memory answerIds = new uint256[](questionIndex.length);
        // okay till here
        uint256 amountToSend = 0;
        for (uint i = 0; i < questionIndex.length; i++){
            uint8 privacyLevelRating = surveys[surveyId].questions[questionIndex[i]].privacyLevelRating;
            //translate local index of option in questionInstance to global index of option in question
            uint256[] memory globalOptionIndexes ;
            if(questions[questionIds[i]].qType == QuestionType.CHECKBOXES || questions[questionIds[i]].qType == QuestionType.RADIOBUTTON){
                globalOptionIndexes = new uint256[](optionIndexes[i].length);
                for (uint j = 0; j < optionIndexes[i].length; j++){
                globalOptionIndexes[j] = surveys[surveyId].questions[questionIndex[i]].selectedOptionsIndex[optionIndexes[i][j]];
                }
            }else{
                if(questions[questionIds[i]].qType == QuestionType.RANGE){
                globalOptionIndexes = new uint256[](1);
                globalOptionIndexes[0] = optionIndexes[i][0];
                }else{
                    globalOptionIndexes = new uint256[](0);
                }
            }
            
            Answer storage newAnswer = answers[answerCounter];
            newAnswer.answerId = answerCounter;
            newAnswer.questionId = questionIds[i];
            newAnswer.qType = questions[questionIds[i]].qType;
            newAnswer.answerHashIPFS = IPFSHash(answerHashIPFSDigest[i],answerHashIPFSHashFunction[i],answerHashIPFSHashSize[i]);
            newAnswer.optionIndexes = globalOptionIndexes;
            newAnswer.answerType = ansType[i];
            newAnswer.answeredInSurveyId = surveyId;
            newAnswer.isActive = true;
            newAnswer.answeredBy = userId;
            newAnswer.answeredOn = block.timestamp;
            answerIds[i] = answerCounter;
            // get the rewards to answer this question from PriceOracle
            uint256 amount = contractStore.priceOracle().getRewardsToAnswerForATypeOfQuestionAndPrivacy(ansType[i],privacyLevelRating);
            amountToSend+=amount;
            answerCounter++;
            usersAllAnswers[userId].push(newAnswer.answerId);
            questionAnswers[questionIds[i]].push(AnswerPair(newAnswer.answerId,newAnswer.answerType));
            // check if newAnswer.answeredBy already exist in questionAnsweredBy[questionIds[i]]
            bool found = false;
            for (uint j = 0; j < questionAnsweredBy[questionIds[i]].length; j++){
                if (questionAnsweredBy[questionIds[i]][j] == userId){
                    found = true;
                    break;
                }
            }
            if (!found){
                questionAnsweredBy[questionIds[i]].push(userId);
            }
            surveyAnswers[surveyId].push(newAnswer.answerId);
        }
        // update response count of the survey
        surveys[surveyId].targetAudienceReached++;
        usersAllSurveysAnswered[userId].push(surveyId);
        //check if survey target audience is not 0 and target audience reached is equal to target audience size then change the status of the survey to closed
        if (surveys[surveyId].targetAudienceSize != 0 && surveys[surveyId].targetAudienceReached >= surveys[surveyId].targetAudienceSize){
            surveys[surveyId].surveyStatus = SurveyStatus.EXPIRED;
        }
        // remove the survey from the userPrivateSurveyInvitations
        uint256 index = 0;
        bool found = false;
        for (uint i = 0; i < userPrivateSurveyInvitations[userAddress].length; i++){
            if (userPrivateSurveyInvitations[userAddress][i] == surveyId){
                index = i;
                found = true;
                break;
            }
        }
        if (found){
            for (uint i = index; i < userPrivateSurveyInvitations[userAddress].length-1; i++){
                userPrivateSurveyInvitations[userAddress][i] = userPrivateSurveyInvitations[userAddress][i+1];
            }
            userPrivateSurveyInvitations[userAddress].pop();
        }

        bytes memory txrequest = contractStore.gaslessContract().payRespondant(surveyId,userAddress,amountToSend);
        bytes32 _surveyIDencrypted = keccak256(contractStore.gaslessContract().SapphireEncrypt(abi.encode(surveyId),0x7365637265740000000000000000000000000000000000000000000000000000));
        emit SurveyAnswered(_surveyIDencrypted,block.timestamp);
        emit TxRequest(txrequest);
        
    }

    function editSurvey(uint256 surveyId,SurveyStatus newstatus,address[] calldata newAddressList,uint256 new_audience_size,uint256 new_expiry_time) external {
        //require surveyId is valid
        require(surveys[surveyId].surveyId != 0);
        //get the creator of the survey
        uint256 organisationId = surveys[surveyId].createdBy;
        //check if the caller is the creator of the survey
        uint256[] memory orgIds = contractStore.profileContract().getUsersOrganisationsId(msg.sender);
        bool found = false;
        for (uint i = 0; i < orgIds.length; i++){
            if (orgIds[i] == organisationId){
                found = true;
                break;
            }
        }
        require(found);
        require(newstatus != SurveyStatus.EXPIRED );

        require(surveys[surveyId].surveyStatus != SurveyStatus.CLOSED && surveys[surveyId].surveyStatus != SurveyStatus.EXPIRED);
        require(new_audience_size>=surveys[surveyId].targetAudienceReached);
        require(new_expiry_time>block.timestamp);
        if(surveys[surveyId].surveyStatus != newstatus){
            surveys[surveyId].surveyStatus = newstatus;
        }
        //find index of audienceFilters where filter type is address list
        if (newAddressList.length != 0){
        uint256 index = 0;
        for (uint i = 0; i < surveys[surveyId].audienceFilters.length; i++){
            if (surveys[surveyId].audienceFilters[i].filter_type == FILTER_TYPE.ADDRESS_LIST){
                index = i;
                break;
            }
        }
        for (uint i = 0; i < newAddressList.length; i++){
                surveys[surveyId].audienceFilters[index].address_list.push(newAddressList[i]);
                userPrivateSurveyInvitations[newAddressList[i]].push(surveyId);
            }
        }
        if (surveys[surveyId].targetAudienceSize != new_audience_size){
            surveys[surveyId].targetAudienceSize = new_audience_size;
        }
        if (surveys[surveyId].validUntil != new_expiry_time){
            surveys[surveyId].validUntil = new_expiry_time;
        }
    }

    function revokeAccessToSurvey(uint256 surveyId,address userAddress) external payable{
        //require surveyId is valid
        require(surveys[surveyId].surveyId != 0);
        //get the creator of the survey
        uint256 organisationId = surveys[surveyId].createdBy;
        //check if userAddress is in the address list filter of the survey
        require(msg.value == contractStore.gaslessContract().getAmountPaid(surveyId,userAddress));
        // delete all answerids of the user from surveyAnswers[surveyId];
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(userAddress);
        uint256[] memory userAnswers = usersAllAnswers[userId];
        for (uint i = 0; i < userAnswers.length; i++){
                for (uint j = 0; j < surveyAnswers[surveyId].length; j++){
                    if (surveyAnswers[surveyId][j] == userAnswers[i]){
                        for (uint k = j; k < surveyAnswers[surveyId].length-1; k++){
                            surveyAnswers[surveyId][k] = surveyAnswers[surveyId][k+1];
                        }
                        surveyAnswers[surveyId].pop();
                    }
                }
        }
        // remove usersAllSurveysAnswered[userId].push(surveyId);
        for (uint i = 0; i < usersAllSurveysAnswered[userId].length; i++){
            if (usersAllSurveysAnswered[userId][i] == surveyId){
                for (uint j = i; j < usersAllSurveysAnswered[userId].length-1; j++){
                    usersAllSurveysAnswered[userId][j] = usersAllSurveysAnswered[userId][j+1];
                }
                usersAllSurveysAnswered[userId].pop();
            }
        }
        organisationNotifications[organisationId].push(abi.encode(keccak256(abi.encodePacked(userId,surveyId)),surveyId));
        payable(contractStore.gaslessContract().getAddressOfOrganisation(organisationId)).transfer(msg.value);

    }

}