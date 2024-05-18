import { ListboxOption } from '@/components/ui/list-box';
export type bytes32 = string;
import { PrevRespProps } from '@/components/survey/audienceFilter';
export interface userSignupRequest {
  user: string;
  firstName: bytes32;
  lastName: bytes32;
  bio: bytes32;
  digest: bytes32;
  hashFunction: number;
  size: number;
  profileAvatar: number;
  twitter_handle: bytes32;
  facebook_handle: bytes32;
  instagram_handle: bytes32;
  external_link: bytes32;
  password: bytes32;
}

export interface rsvType {
  r: string;
  s: string;
  v: number;
}

export interface changedAnswerRequest {
  questionId: number;
  qType: number;
  optionIndexes: number[];
  value: number;
  answerType: number;
  digest: bytes32;
  hashFunction: number;
  size: number;
}

export interface IPFSHash {
  digest: bytes32;
  hashFunction: number;
  size: number;
}

export interface UserSearchResultStruct {
  username: bytes32;
  userId: number;
  isOrganisation: boolean;
  firstName: bytes32;
  lastName: bytes32;
  profilePhotoHash: IPFSHash;
  profileAvatar: number;
}

export enum UserOnBoardingStatus {
  NOT_ONBOARDED,
  SIGNUP_AGE_CONSENT_GIVEN,
  BASIC_INFO_PROVIDED,
  ONBOARDED,
}

export enum UserHumanityVerificationStatus {
  NOT_VERIFIED,
  PENDING_VERIFICATION,
  VERIFIED,
}

export interface User {
  userId: number;
  userAddress: string;
  firstName: bytes32;
  lastName: bytes32;
  bio: bytes32;
  profilePhotoHash: IPFSHash;
  profileAvatar: number; // Assuming it's a number, you can adjust the type accordingly
  twitter_handle: bytes32;
  facebook_handle: bytes32;
  instagram_handle: bytes32;
  external_link: bytes32;
  password: bytes32;
  createdOn: number; // Assuming it's a number, you can adjust the type accordingly
  onBoardingStatus: UserOnBoardingStatus; // You need to define UserOnBoardingStatus type
  humanityVerificationStatus: UserHumanityVerificationStatus; // You need to define UserHumanityVerificationStatus type
  verificationValidUntil: number;
  username: bytes32 | null;
  isOrganisation: boolean;
}

export interface Organisation {
  organisationId: number;
  organisationName: bytes32;
  organisationBioIPFSHash: IPFSHash;
  organisationProfilePhotoHash: IPFSHash;
  organisationProfileAvatar: number;
  organisationTwitter_handle: bytes32;
  organisationFacebook_handle: bytes32;
  organisationInstagram_handle: bytes32;
  organisationExternal_link: bytes32;
  createdOn: number;
  username: bytes32;
  tags: number[];
}
export interface optionsObject {
  index: number;
  optionString: string;
}
export interface fetchedQuestionResponse {
  id: number;
  question_id: number;
  question_type: number;
  question_string: string;
}
export type RangeTypes = '0-10';
export interface OrganisationCreationRequest {
  organisationUserName: bytes32;
  organisationName: bytes32;
  organisationBioText: string;
  organisationBioIPFSHash: IPFSHash;
  organisationProfilePhotoHash: IPFSHash;
  organisationProfileAvatar: number;
  organisationTwitter_handle: bytes32;
  organisationFacebook_handle: bytes32;
  organisationInstagram_handle: bytes32;
  organisationExternal_link: bytes32;
  tagsIds: number[];
}

export enum QuestionType {
  RADIOBUTTON,
  CHECKBOXES,
  OPENTEXT,
  RANGE,
}

export interface viewMySurveyResponseStruct {
  questionText: string;
  answerText: string[];
  answerTypeText: string;
  PrivacyLevel: number;
}
export interface QuestionOption {
  option: bytes32;
  optionIPFSHash: IPFSHash;
}

export enum AnswerType {
  PUBLIC,
  ANALYSIS,
  PRIVATE,
}

export interface AnswerRequest {
  questionId: number;
  qType: QuestionType;
  optionIndexes: number[];
  value: number;
  answerType: AnswerType;
  answerHashIPFS: IPFSHash;
}

export interface AnswerSurveyRequest {
  user: string;
  answeredInSurveyId: number;
  answers: AnswerRequest[];
}

export type RadioProps = {
  type: 'radio';
  data: {
    qn: string;
    ans?: number[];
    privacySetting?: number;
    required?: boolean;
    other?: true;
    optionOptions?: string[];
    otherQn?: string;
    questionId?: number;
    answerTypeAllowed?: boolean[];
    type?: RangeTypes;
    strAns?: string[];
    optionStrings?: optionsObject[];
  };
  error?: string;
};
export type CheckboxProps = {
  type: 'checkbox';
  data: {
    qn: string;
    ans?: number[];
    privacySetting?: number;
    required?: boolean;
    other?: true;
    optionOptions?: string[];
    otherQn?: string;
    questionId?: number;
    answerTypeAllowed?: boolean[];
    type?: RangeTypes;
    strAns?: string[];
    optionStrings?: optionsObject[];
  };
  error?: string;
};

export type RangeProps = {
  type: 'range';
  data: {
    qn: string;
    ans?: number[];
    privacySetting?: number;
    required?: boolean;
    other?: true;
    optionOptions?: string[];
    otherQn?: string;
    questionId?: number;
    answerTypeAllowed?: boolean[];
    type?: RangeTypes;
    optionStrings?: optionsObject[];
  };
  error?: string;
};

export type TextProps = {
  type: 'text';
  data: {
    qn: string;
    ans?: number[];
    privacySetting?: number;
    required?: boolean;
    other?: true;
    optionOptions?: string[];
    otherQn?: string;
    questionId?: number;
    answerTypeAllowed?: boolean[];
    type?: RangeTypes;
    optionStrings?: optionsObject[];
  };
  error?: string;
};

export type Validation = { required?: boolean; match?: RegExp };

export type NodeType = 'radio' | 'checkbox' | 'text' | 'range';
export type Node = RadioProps | RangeProps | CheckboxProps | TextProps;

export type TextFormProps = TextProps & { values?: { value: string } };
export type RadioFormProps = RadioProps & { values?: { selected: string } };
export type RangeFormProps = RangeProps & {
  values?: { values: string[]; selected: string };
};
export type CheckboxFormProps = CheckboxProps & { values?: string[] };
export type FormProps =
  | TextFormProps
  | RadioFormProps
  | RangeFormProps
  | CheckboxFormProps;

export interface SurveyAudienceFilter {
  filter_type: ListboxOption;
  address_list: string[];
  prev_response_value_questionId: number;
  prev_response_value_matchType: ListboxOption;
  prev_response_value_options: number[];
  prev_response_fetchedQuestions: fetchedQuestionResponse[];
  prev_response_fetchedOptions: ListboxOption[];
  prev_response_selectedQues: string;
  prev_response_selectedOptions: ListboxOption[];
  token_reserve_selectedToken: ListboxOption;
  token_reserve_minAmount: number;
  token_reserve_selectedChain: ListboxOption;
  token_reserve_contractAddress: string;
  nft_token_selectedchain: ListboxOption;
  nft_token_nftContractAddress: string;
  survey_answered_id: number;
}

export interface questionCreateRequest {
  questionType: number;
  isPrivate: boolean;
  ipfsHashDigest: bytes32;
  ipfsHashHashFunction: number;
  ipfsHashSize: number;
  questionNonce: bytes32;
  QuestionOptionsBytes32: bytes32[];
  QuestionOptionipfsHashDigest: bytes32[];
  QuestionOptionipfsHashHashFunction: number[];
  QuestionOptionipfsHashSize: number[];
}

export interface OptionsToCreate {
  questionId: number;
  optionString: string;
  optionDigest: string;
  optionHashFunction: number;
  optionSize: number;
}
export interface SurveyCreatedResponse {
  surveyId: number;
  titleBytes: bytes32;
  titleIPFS: IPFSHash;
  introIPFS: IPFSHash;
}
export interface SurveyCreationVerifiedResponse {
  cipher: string;
  nonce: string;
}

export interface AudienceFilterRequest {
  filter_type: number;
  address_list: string[];
  prev_response_value_questionId: number;
  prev_response_value_matchType: number;
  prev_response_value_options: number[];
  token_reserve_selectedToken: number;
  token_reserve_minAmount: number;
  token_reserve_selectedChain: number;
  token_reserve_contractAddress: string;
  nft_token_selectedchain: number;
  nft_token_nftContractAddress: string;
  survey_answered_id: number;
  active: boolean;
}

export interface QuestionInstance {
  questionId: number;
  selectedOptionsIndex: number[];
  isMandatory: boolean;
  answerTypeAllowed: [boolean, boolean, boolean];
  privacyLevelRating: number;
}

export interface surveyCreationRequest {
  titlesBytes: bytes32;
  titleIPFSDigest: bytes32;
  titleIPFSHashFunction: number;
  titleIPFSSize: number;
  surveyNonce: bytes32;
  descriptionIPFSDigest: bytes32;
  descriptionIPFSHashFunction: number;
  descriptionIPFSSize: number;
  isSurveyPrivate: boolean;
  surveyAudienceSize: number;
  surveyExpiryDate: number;
  publishOnMarketplace: boolean;
  createdBy: number;
  questions: QuestionInstance[];
  audienceFilters: AudienceFilterRequest[];
}

export interface MinimalSurveyView {
  surveyId: number;
  surveyTitle: bytes32;
  surveyTitleIPFS: IPFSHash;
  isSurveyPrivate: boolean;
  validUntil: number;
  targetAudienceSize: number;
  targetAudienceReached: number;
  surveyStatus: SurveyStatus;
}

export enum SurveyStatus {
  ACTIVE,
  PAUSED,
  EXPIRED,
  CLOSED,
}

export interface QuestionInstanceStructForOrganisationSurveyView {
  questionId: number;
  qType: QuestionType;
  questionIPFSHash: IPFSHash;
  selectedOptionsIndexOptionString: QuestionOption[];
  isMandatory: boolean;
  answerTypeAllowed: [boolean, boolean, boolean];
  privacyLevelRating: number;
}

export interface AudienceFilterStructForOrganisationSurveyView {
  filter_type: number;
  address_list: string[];
  prev_response_value_questionId: number;
  questionIPFSHash: IPFSHash;
  prev_response_value_matchType: number;
  prev_response_value_options_optionString: QuestionOption[];
  token_reserve_selectedToken: number;
  token_reserve_minAmount: number;
  token_reserve_selectedChain: number;
  token_reserve_contractAddress: string;
  nft_token_selectedchain: number;
  nft_token_nftContractAddress: string;
  survey_answered_id: number;
  active: boolean;
}

export interface Survey {
  surveyId: number;
  surveyTitle: bytes32;
  surveyTitleIPFS: IPFSHash;
  surveyIntroIPFS: IPFSHash;
  isSurveyPrivate: boolean;
  surveyNonce: bytes32;
  questions: QuestionInstance[];
  createdBy: number;
  createdAt: number;
  validUntil: number;
  targetAudienceSize: number;
  targetAudienceReached: number;
  publishOnMarketplace: boolean;
  surveyStatus: SurveyStatus;
  allowedUsers: number[];
  audienceFilters: AudienceFilterRequest[];
}

export interface AnswersOfAQuestionStruct {
  answeredBy: bytes32;
  optionIndexes: number[];
  answerHashIPFS: IPFSHash;
}

export interface SurveyAccount {
  surveyId: number;
  surveyAccount: string;
}

export interface AddressesOfOrganisation {
  orgAddress: string;
  surveyAccounts: SurveyAccount[];
}

export interface PrivacyObject {
  privacyLevel: number;
  privacyPoints: number;
}

export interface PriceObject {
  ansType: AnswerType;
  price: number;
}

export interface SurveyInfoStruct {
  surveyTitle: string;
  surveyIntro: string;
  createdBy: number;
  createdAt: number;
  answeredAt: number;
  validTill: number;
}

export interface SurveyResponseViewForRespondantStruct {
  surveyId: number;
  surveyTitle: bytes32;
  surveyTitleIPFS: IPFSHash;
  surveyIntroIPFS: IPFSHash;
  createdBy: number;
  createdAt: number;
  answers: AnswersOfAQuestionStruct[];
  answerIds: number[];
  questions: QuestionInstanceStructForOrganisationSurveyView[];
  optionIndexes: number[][];
  answerType: AnswerType[];
  surveyNonce: bytes32;
  answerHashIPFSs: IPFSHash[];
}

export interface SurveyStatusAndPrivacyInfo {
  surveyId: number;
  surveyStatus: SurveyStatus;
  surveyPrivacy: boolean;
}

export interface QuestionObjectForRewardCalculation {
  qType: AnswerType;
  privacyLevel: number;
}

export interface QuestionsTableData {
  questionIndex: number;
  qTypeImage: any;
  qTypeName: string;
  questionString: string;
  questionId: number;
  questionIdSecond: number;
  answerTypeAllowed: Array<boolean>;
  isMandatory: boolean;
  privacyLevelRating: number;
  questionOptionIndexesString: Array<any>;
}
