import { atom, selector } from 'recoil';
import {
  type Node,
  type FormProps,
  type SurveyAudienceFilter,
  IPFSHash,
} from '@/app/shared/types';
import { DateRangeType } from 'react-tailwindcss-datepicker';
export const rangeValues = {
  '0-10': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
};
import { BigNumber } from 'ethers';
import { MutableRefObject } from 'react';
import { PrevResponseOptions } from '@/components/survey/audienceFilter';

export const masterSettingsAtom = atom<{
  name: string;
  audience: string;
  is_survey_private: boolean;
  publish_on_marketplace: boolean;
  survey_visibility: null | string;
  survey_validity_type: null | string;
  survey_expiry_date: DateRangeType;
  survey_audience_size: number;
  introduction: string;
  has_valid_expiry: boolean;
}>({
  key: 'masterSettingsAtom',
  default: {
    name: null,
    audience: 'audience',
    is_survey_private: false,
    publish_on_marketplace: false,
    survey_visibility: null,
    survey_validity_type: null,
    has_valid_expiry: false,
    survey_expiry_date: { startDate: null, endDate: null },
    survey_audience_size: 0,
    introduction: '',
  },
});

export const isSurveyPrivacySetAtom = atom<boolean>({
  key: 'isSurveyPrivacySetAtom',
  default: false,
});

export const nodesAtom = atom<Node[]>({
  key: 'nodesAtom',
  default: [],
});

export const nodesToFormNodesSelector = selector({
  key: 'nodesToFormNodesSelector',
  get: ({ get }) => {
    const nodes = get(nodesAtom);
    const formNodes: FormProps[] = nodes.map((node) => {
      switch (node.type) {
        case 'text':
          return { ...node, type: 'text', values: { value: '' } };

        case 'radio':
          return { ...node, type: 'radio', values: { selected: '0' } };

        case 'range':
          return {
            ...node,
            type: 'range',
            values: { values: rangeValues[node.data.type], selected: '0' },
          };

        case 'checkbox':
          return { ...node, type: 'checkbox', values: { values: [] } };

        default:
          return node;
      }
    }) as FormProps[];
    return formNodes;
  },
});

export const selectedNodeIndexAtom = atom<number | undefined>({
  key: 'selectedNodeIndexAtom',
  default: undefined,
});

export const formAtom = atom<FormProps[]>({
  key: 'formAtom',
  default: [],
});

export const currentFormIndexAtom = atom<number>({
  key: 'currentFormIndexAtom',
  default: 0,
});

export const selectedProfileAtom = atom<{}>({
  key: 'selectedProfileAtom',
  default: {},
});

export const isActiveProfileOrganisationAtom = atom<boolean>({
  key: 'isActiveProfileOrganisationAtom',
  default: false,
});

export const viewMasterSurveySetttingsAtom = atom<boolean>({
  key: 'viewMasterSurveySetttingsAtom',
  default: false,
});

export const surveyAudienceAtom = atom<SurveyAudienceFilter[]>({
  key: 'surveyAudienceAtom',
  default: [],
});

export const prevResponseInputRef = atom<MutableRefObject<HTMLInputElement>>({
  key: 'prevResponseInputRef',
  default: null,
});

export const previewSurveyAtom = atom<boolean>({
  key: 'previewSurveyAtom',
  default: false,
});

export const showSurveyFinalCreatePageAtom = atom<boolean>({
  key: 'showSurveyFinalCreatePageAtom',
  default: false,
});

export const SurveyIntroTextAtom = atom<string>({
  key: 'SurveyIntroTextAtom',
  default: '',
});

export const walletAmountAtom = atom<string>({
  key: 'walletAmountAtom',
  default: '',
});

export const walletSurveyIdAtom = atom<number>({
  key: 'walletSurveyIdAtom',
  default: 0,
});

export const totalRewardsAtom = atom<number>({
  key: 'totalRewardsAtom',
  default: null,
});

export const exchangeOasisUSDPriceAtom = atom<BigNumber>({
  key: 'exchangeOasisUSDPriceAtom',
  default: BigNumber.from(0),
});

export const preferedCurrencyAtom = atom<string>({
  key: 'preferedCurrencyAtom',
  default: 'USD',
});

export const QuestionInfoDrawerAtom = atom<{
  originalData: any; // You can replace 'any' with the specific type of your originalData if known
  [key: string]: any; // This allows for any other keys of type 'any'
}>({
  key: 'QuestionInfoDrawerAtom',
  default: { originalData: null }, // Providing a default value for originalData
});

export const OrganisationIdUsernameMapping = atom<{
  [key: number]: {
    username: string;
    profilePic: IPFSHash;
  };
}>({
  key: 'OrganisationIdUsernameMapping',
  default: {},
});

export const submittingResponseStatus = atom<[boolean, boolean]>({
  key: 'submittingResponseStatus',
  default: [false, false],
});

export const profileAdminRolesAtom = atom<[boolean, boolean]>({
  key: 'profileAdminRoles',
  default: [false, false],
});
