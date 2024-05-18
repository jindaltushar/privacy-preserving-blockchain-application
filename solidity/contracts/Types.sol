// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import {SignatureRSV} from '@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol';

enum SurveyAccessType {
    ADMIN,
    PARTICIPANT,
    NONE
}


enum EncodeDataType{
    QuestionString
}

struct DecodeObject{
    EncodeDataType dataType;
    bytes data;
    bytes32 nonce;
}

struct SignIn {
        address user;
        uint256 time;
        SignatureRSV rsv;
    }

struct userSignupRequest {
    address user;
    bytes32 firstName;
    bytes32 lastName;
    bytes32 bio;
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
    uint8 profileAvatar;
    bytes32 twitter_handle;
    bytes32 facebook_handle;
    bytes32 instagram_handle;
    bytes32 external_link;
    bytes32 password;
}

    struct AudienceFilterStructForOrganisationSurveyView {
        FILTER_TYPE filter_type;
        address[] address_list;
        uint256 prev_response_value_questionId;
        IPFSHash questionIPFSHash;
        PREV_RESPONSE_VALUE_MATCH_TYPE prev_response_value_matchType;
        QuestionOption[] prev_response_value_options_optionString;
        TOKENS token_reserve_selectedToken;
        uint256 token_reserve_minAmount;
        CHAINS token_reserve_selectedChain;
        address token_reserve_contractAddress;
        CHAINS nft_token_selectedchain;
        address nft_token_nftContractAddress;
        uint256 survey_answered_id;
        bool active;
    }
    struct QuestionData {
    uint256 questionId;
    uint8 questionType;
    bytes32 questionIpfsDigest;
    uint8 questionipfshashfunction;
    uint8 questionipfshashsize;
    }

struct questionCreateRequest {
    uint8 questionType;
    bool isPrivate;
    bytes32 ipfsHashDigest;
    uint8 ipfsHashHashFunction;
    uint8 ipfsHashSize;
    bytes32 questionNonce;
    bytes32[] QuestionOptionsBytes32;
    bytes32[] QuestionOptionipfsHashDigest;
    uint8[] QuestionOptionipfsHashHashFunction;
    uint8[] QuestionOptionipfsHashSize;
}
    struct QuestionInstanceStructForOrganisationSurveyView {
        uint256 questionId;
        QuestionType qType;
        IPFSHash questionIPFSHash;
        QuestionOption[] selectedOptionsIndexOptionString;
        bool isMandatory;
        bool[3] answerTypeAllowed;
        uint8 privacyLevelRating;
    }


    enum SurveyStatus {
        ACTIVE,
        PAUSED,
        EXPIRED,
        CLOSED

    }struct SurveyAccount{
        uint256 surveyId;
        address surveyAccount;
    }
    struct EthereumKeypair {
    address addr;
    bytes32 secret;
    uint64 nonce;
}


    struct QuestionOption {
        bytes32 option;
        IPFSHash optionIPFSHash;
    }

    struct Question {
        uint256 questionId;
        QuestionType qType;
        bool isPrivate;
        bytes32 nonce;
        IPFSHash questionIPFSHash;
        QuestionOption[] optionsString;
        uint256 createdBy;
    }


    struct changedAnswerRequest{
        uint256 questionId;
        uint8 qType;
        uint256[] optionIndexes;
        uint256 value;
        uint8 answerType;
        bytes32 digest;
        uint8 hashFunction;
        uint8 size;
    }

struct AnswerPair {
        uint256 answerId;
        AnswerType answerType;
    }

enum QuestionType {
        RADIOBUTTON,
        CHECKBOXES,
        OPENTEXT,
        RANGE
    }

    enum AnswerType {
        PUBLIC,
        ANALYSIS,
        PRIVATE
    }

   struct IPFSHash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }

    struct AnswerRequest {
        uint256 questionId;
        QuestionType qType;
        uint256[] optionIndexes;
        uint256 value;
        AnswerType answerType;
        IPFSHash answerHashIPFS;
    }

    struct AnswerSurveyRequest{
        address user;
        uint256 answeredInSurveyId;
        AnswerRequest[] answers;
    }

    struct Answer{
        uint256 answerId;
        QuestionType qType;
        uint256 questionId;
        IPFSHash answerHashIPFS;
        bool isPrivate;
        uint256[] optionIndexes;
        uint256 value;
        AnswerType answerType;
        uint256 answeredInSurveyId;
        bool isActive;
        uint256 answeredOn;
        uint256 answeredBy;
    }

    struct  OrganisationCreationRequest{
        bytes32 organisationUserName;
        bytes32 organisationName;
        IPFSHash organisationBioIPFSHash;
        IPFSHash organisationProfilePhotoHash;
        int8 organisationProfileAvatar;
        bytes32 organisationTwitter_handle;
        bytes32 organisationFacebook_handle;
        bytes32 organisationInstagram_handle;
        bytes32 organisationExternal_link;
        uint256[] tagsIds;
    }

    struct AudienceFilter {
        uint256 questionId; // only for RADIOBUTTON and CHECKBOXES
        uint256 valueIndex;
    }


    struct Survey {
        uint256 surveyId;
        bytes32 surveyTitle;
        IPFSHash surveyTitleIPFS;
        IPFSHash surveyIntroIPFS;
        bool isSurveyPrivate;
        bytes32 surveyNonce;
        QuestionInstance[] questions;
        uint256 createdBy;
        uint256 createdAt;
        uint256 validUntil;
        uint256 targetAudienceSize;
        uint256 targetAudienceReached;
        bool publishOnMarketplace;
        SurveyStatus surveyStatus;
        uint256[] allowedUsers;
        AudienceFilterRequest[] audienceFilters;
    }

    struct Organisation {
        uint256 organisationId;
        bytes32 organisationName;
        IPFSHash organisationBioIPFSHash;
        IPFSHash organisationProfilePhotoHash;
        int8 organisationProfileAvatar;
        bytes32 organisationTwitter_handle;
        bytes32 organisationFacebook_handle;
        bytes32 organisationInstagram_handle;
        bytes32 organisationExternal_link;
        uint256 createdOn;
        bytes32 username;
        uint256[] tags;
    }

 enum UserOnBoardingStatus{
        NOT_ONBOARDED,
        SIGNUP_AGE_CONSENT_GIVEN,
        BASIC_INFO_PROVIDED,
        ONBOARDED
    }
    enum UserHumanityVerificationStatus{
        NOT_VERIFIED,
        PENDING_VERIFICATION,
        VERIFIED
    }

    struct UserSearchResultStruct{
        bytes32 username;
        uint256 userId;
        bool isOrganisation;
        bytes32 firstName;
        bytes32 lastName;
        IPFSHash profilePhotoHash;
        int8 profileAvatar;
    }


struct User {
        uint256 userId;
        address userAddress;
        bytes32 firstName;
        bytes32 lastName;
        bytes32 bio;
        IPFSHash profilePhotoHash;
        uint8 profileAvatar;
        bytes32 twitter_handle;
        bytes32 facebook_handle;
        bytes32 instagram_handle;
        bytes32 external_link;
        bytes32 password;
        uint256 createdOn;
        UserOnBoardingStatus onBoardingStatus;
        UserHumanityVerificationStatus humanityVerificationStatus;
        uint256 verificationValidUntil;
        bytes32 username;
        bool isOrganisation;
    }

    struct userAnswerToSurveyRequest{
        uint256 surveyId;
        AnswerRequest[] answers;
    }


   struct OptionsToCreate{
    uint256 questionId;
    bytes32 optionString;
    bytes32 optionDigest;
    uint8 optionHashFunction;
    uint8 optionSize;
   }


enum FILTER_TYPE {
    ADDRESS_LIST,
    PREV_RESPONSE_VALUE,
    TOKEN_RESERVE,
    NFT_TOKEN,
    SURVEY_ANSWERED
    }
    
enum PREV_RESPONSE_VALUE_MATCH_TYPE {
    EQUALS,
    IS_IN
}

enum TOKENS {
    NONE,
    ROSE,
    ETH 
}

enum CHAINS {
    NONE,
    OASIS_SAPPHIRE,
    ETHEREUM
}

struct AudienceFilterRequest {
    FILTER_TYPE filter_type;
    address[] address_list;
    uint256 prev_response_value_questionId;
    PREV_RESPONSE_VALUE_MATCH_TYPE prev_response_value_matchType;
    uint256[] prev_response_value_options;
    TOKENS token_reserve_selectedToken;
    uint256 token_reserve_minAmount;
    CHAINS token_reserve_selectedChain;
    address token_reserve_contractAddress;
    CHAINS nft_token_selectedchain;
    address nft_token_nftContractAddress;
    uint256 survey_answered_id;
    bool active;

}


struct QuestionInstance {
  uint256 questionId;
    uint256[] selectedOptionsIndex;
    bool isMandatory;
    bool[3] answerTypeAllowed;
    uint8 privacyLevelRating;
}

struct surveyCreationRequest {
    bytes32 titlesBytes;
    bytes32 titleIPFSDigest;
    uint8 titleIPFSHashFunction;
    uint8 titleIPFSSize;
    bytes32 surveyNonce;
    bytes32 descriptionIPFSDigest;
    uint8 descriptionIPFSHashFunction;
    uint8 descriptionIPFSSize;
    bool isSurveyPrivate;
    uint256 surveyAudienceSize;
    uint256 surveyExpiryDate;
    bool publishOnMarketplace;
    uint256 createdBy;
    QuestionInstance[] questions;
    AudienceFilterRequest[] audienceFilters;
}

 struct AnswersOfAQuestionStruct{
        bytes32 answeredBy;
        uint256[] optionIndexes;
        IPFSHash answerHashIPFS;
    }

struct MinimalSurveyView {
    uint256 surveyId;
    bytes32 surveyTitle;
    IPFSHash surveyTitleIPFS;
    bool isSurveyPrivate;
    uint256 validUntil;
    uint256 targetAudienceSize;
    uint256 targetAudienceReached;
    SurveyStatus surveyStatus;
}

struct SurveyListForRespodantStruct {
    uint256 surveyId;
    bytes32 surveyTitle;
    IPFSHash surveyTitleIPFS;
    uint256 validUntil;
    uint256 targetAudienceReached;
    SurveyStatus surveyStatus;
    IPFSHash surveyIntroIPFS;
    uint256 createdBy;
    uint256 createdAt;
}

struct SurveyResponseViewForRespondantStruct {
    uint256 surveyId;
    bytes32 surveyTitle;
    IPFSHash surveyTitleIPFS;
    IPFSHash surveyIntroIPFS;
    uint256 createdBy;
    uint256 createdAt;
    AnswersOfAQuestionStruct[] answers;
    uint256[] answerIds;
    QuestionInstanceStructForOrganisationSurveyView[] questions;
    uint256[][] optionIndexes;
    AnswerType[] answerType;
    bytes32 surveyNonce;
    IPFSHash[] answerHashIPFSs;
}

