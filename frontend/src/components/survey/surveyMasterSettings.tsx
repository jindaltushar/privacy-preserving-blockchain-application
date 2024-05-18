'use client';
import { useEffect, useState } from 'react';
import { Transition } from '@/components/ui/transition';
import { useRecoilState } from 'recoil';
import Image from '@/components/ui/image';
import { Warning } from '@/components/icons/warning';
import votePool from '@/assets/images/vote-pool.svg';
import Button from '@/components/ui/button';
import { ExportIcon } from '@/components/icons/export-icon';
import InputLabel from '@/components/ui/input-label';
import cn from 'classnames';
import { Switch } from '@/components/ui/switch';
import SurveyValidityType from './survey-validity-props';
import { masterSettingsAtom } from '@/stores/atoms';
import ToggleBar from '@/components/ui/toggle-bar';
import { Editor } from 'novel-lightweight';
import AudienceFilter from '@/components/survey/audienceFilter';
import Input from '@/components/ui/forms/input';
import { surveyAudienceAtom, SurveyIntroTextAtom } from '@/stores/atoms';
import { SurveyAudienceFilter } from '@/app/shared/types';
import { generateRandomString } from '@/app/shared/utils';
import { toast } from 'sonner';
import {
  PrevResponseOptions,
  TokenReserveOptions,
  AvailableChains,
  PublicActionOptions,
} from '@/components/survey/audienceFilter';

export const emptyAudienceFilter: SurveyAudienceFilter = {
  filter_type: PublicActionOptions[0],
  address_list: [],
  prev_response_value_questionId: null,
  prev_response_value_matchType: PrevResponseOptions[0],
  prev_response_value_options: [],
  prev_response_fetchedQuestions: [],
  prev_response_fetchedOptions: [],
  prev_response_selectedQues: '',
  prev_response_selectedOptions: [],
  token_reserve_selectedToken: TokenReserveOptions[0],
  token_reserve_minAmount: null,
  token_reserve_selectedChain: null,
  token_reserve_contractAddress: '',
  nft_token_selectedchain: AvailableChains[0],
  nft_token_nftContractAddress: '',
  survey_answered_id: null,
};

export default function SurveyMasterSettings() {
  const [masterSettings, setMasterSettings] =
    useRecoilState(masterSettingsAtom);
  const [haveValidExpiry, setHaveValidExpiry] = useState(false);
  const [validty, setValidity] = useState('');
  const [surveyIntro, setSurveyIntro] = useRecoilState(SurveyIntroTextAtom);
  const [surveyAudience, setSurveyAudience] =
    useRecoilState(surveyAudienceAtom);

  function addEmptyFilter() {
    setSurveyAudience((prevSurveyAudience) => {
      // Ensure surveyAudience is an array
      if (!Array.isArray(prevSurveyAudience)) {
        console.error('surveyAudience is not an array.');
        return prevSurveyAudience; // Return previous state unchanged
      }
      // Append emptyAudienceFilter to the array
      if (masterSettings.is_survey_private) {
        if (surveyAudience.length > 0) {
          toast.error(
            'Private Survey can not have more than one audience filter',
          );
          return [...prevSurveyAudience];
        } else {
          return [...prevSurveyAudience, emptyAudienceFilter];
        }
      } else {
        // check if address filter already exist
        const addressFilterFilter = prevSurveyAudience.find(
          (filter) => filter.filter_type.value === 'address',
        );
        if (addressFilterFilter) {
          const newEmptyAudienceFilter = {
            ...emptyAudienceFilter,
            filter_type: PublicActionOptions[1],
          };
          return [...prevSurveyAudience, newEmptyAudienceFilter];
        }
      }

      return [...prevSurveyAudience, emptyAudienceFilter];
    });
  }

  useEffect(() => {
    console.log('surveyIntro', surveyIntro);
  }, [surveyIntro]);

  useEffect(() => {
    console.log('mst', masterSettings);
  }, [masterSettings]);

  return (
    <Transition
      show={true}
      enter="transition-opacity duration-250"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-250"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="mx-auto w-full max-w-[1000px]">
        {/* <header className="mb-10 flex flex-col gap-4 rounded-lg bg-white p-5 py-6 shadow-card dark:bg-light-dark xs:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 xs:gap-3 xl:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-dark">
              <Image alt="Vote Pool" src={votePool} width={32} height={32} />
            </div>
            <div>
              <h2 className="mb-2 text-base font-medium uppercase dark:text-gray-100 xl:text-lg">
                You have 100 votes
              </h2>
              <p className="leading-[1.8] text-gray-600 dark:text-gray-400">
                In order to submit a proposal you must have at least 10,000
                CRIPTIC tokens <br className="hidden xl:inline-block" />{' '}
                delegated to you{' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://medium.com/pooltogether/governance-101-fca9ab8b8ba2"
                  className="inline-flex items-center gap-2 text-gray-900 underline transition-opacity duration-200 hover:no-underline hover:opacity-90 dark:text-gray-100"
                >
                  Learn more <ExportIcon className="h-auto w-3" />
                </a>
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Button
              shape="rounded"
              fullWidth={true}
              className="uppercase"
              onClick={() => console.log('woooho')}
            >
              All Proposal
            </Button>
          </div>
        </header> */}
        {/* SURVEY TITLE */}
        <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
          <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
            Title
          </h3>
          <p className="mb-5 leading-[1.8] dark:text-gray-300">
            Your title introduces your survey to the participants. Make sure it
            is clear and to the point.
          </p>
          <Input
            placeholder="Enter title of your proposal"
            defaultValue={masterSettings.name || null}
            onBlur={(e) =>
              setMasterSettings((prev) => ({
                ...prev,
                name: e.currentTarget.value,
              }))
            }
          />
        </div>
        {/* DESCRIPTION */}
        <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
          <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
            Description
          </h3>
          <p className="mb-5 leading-[1.8] dark:text-gray-300">
            Your description should present in full detail what the scope of the
            research. This is where participants will educate themselves on what
            they are responding to.
          </p>
          <Editor
            className={'mb-2'}
            defaultValue={surveyIntro}
            disableLocalStorage={false}
            storageKey={'surveyIntro'}
            onDebouncedUpdate={(editor) => {
              setSurveyIntro(editor?.storage.markdown.getMarkdown());
            }}
            debounceDuration={1000}
            handleImageUpload={async (file) => {
              return 'www.example.com/failed-upload.png';
            }}
          />
        </div>

        {/* Survey Validity */}
        <div className=" p-5  xs:p-6 xs:pb-8">
          <div className="flex items-center justify-between gap-4">
            <InputLabel
              titleClassName="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg"
              subTitleClassName="mb-5 leading-[1.8] dark:text-gray-300"
              title="Survey Validity"
              subTitle="Set an expiry condition for your survey. This will determine how long your survey will be open for responses."
            />
            <div className="shrink-0">
              <Switch
                checked={masterSettings.has_valid_expiry}
                onChange={() => {
                  setMasterSettings({
                    ...masterSettings,
                    ['has_valid_expiry']: !masterSettings.has_valid_expiry,
                  });
                }}
              >
                <div
                  className={cn(
                    masterSettings.has_valid_expiry
                      ? 'bg-brand'
                      : 'bg-gray-200 dark:bg-gray-700',
                    'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300',
                  )}
                >
                  <span
                    className={cn(
                      masterSettings.has_valid_expiry
                        ? 'bg-white ltr:translate-x-5 rtl:-translate-x-5 dark:bg-light-dark'
                        : 'bg-white ltr:translate-x-0.5 rtl:-translate-x-0.5 dark:bg-light-dark',
                      'inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-200',
                    )}
                  />
                </div>
              </Switch>
            </div>
          </div>
          {masterSettings.has_valid_expiry && (
            <SurveyValidityType
              value={masterSettings.survey_validity_type}
              onChange={(value) => {
                setMasterSettings({
                  ...masterSettings,
                  ['survey_validity_type']: value,
                });
              }}
            />
          )}
        </div>
        {/* Publish on Marketplace */}
        <div className="mb-8">
          <ToggleBar
            title="Publish on Marketplace"
            subTitle="Other Researchers will be able to purchase the dataset from marketplace once the survey has concluded"
            icon={<Warning />}
            checked={masterSettings.publish_on_marketplace}
            onChange={() =>
              setMasterSettings({
                ...masterSettings,
                ['publish_on_marketplace']:
                  !masterSettings.publish_on_marketplace,
              })
            }
          />
        </div>

        {/* Audience Filter */}
        <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
          <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
            Audience Filter
          </h3>
          <p className="mb-5 leading-[1.8] dark:text-gray-300">
            Enter the on-chain actions this proposal should take. Actions are
            executed in the order laid out here (ie. Action #1 fires, then
            Action #2, etc.)
          </p>
          {surveyAudience.map((filterObj, index) => (
            <AudienceFilter
              key={index + generateRandomString(30)}
              audiencefilterindex={index}
            />
          ))}
          <Button
            variant="ghost"
            className="mt-2 dark:text-white xs:mt-3"
            onClick={addEmptyFilter}
          >
            Add {surveyAudience.length > 0 ? 'another' : ''} filter
          </Button>
        </div>
      </div>
    </Transition>
  );
}
