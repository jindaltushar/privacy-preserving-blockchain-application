'use client';

import Button from '@/components/ui/button';
import SurveyList from '@/components/survey/list';
import ActiveLink from '@/components/ui/links/active-link';
import { FarmsData } from '@/data/static/farms-data';
import { useRouter } from 'next/navigation';
import { Fragment, useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import routes from '@/config/routes';
import cn from 'classnames';
import { Transition } from '@/components/ui/transition';
import { RadioGroup } from '@/components/ui/radio-group';
import { Listbox } from '@/components/ui/listbox';
import { Switch } from '@/components/ui/switch';
import { ChevronDown } from '@/components/icons/chevron-down';
import { SearchIcon } from '@/components/icons/search';
import { useLayout } from '@/lib/hooks/use-layout';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import HorizontalThreeDots from '@/components/icons/horizontal-three-dots';
import { generateRandomString, bytes32ToString } from '@/app/shared/utils';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { MinimalSurveyView, SurveyStatus } from '@/app/shared/types';
import { readIPFS } from '@/app/shared/ipfs';
import { set } from 'lodash';
import { toast } from 'sonner';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
const sort = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Latest' },
  { id: 2, name: 'Time' },
  { id: 3, name: 'Response' },
];

interface SortListProps {
  id: number;
  name: string;
}

async function ResolveTitle(surveys: MinimalSurveyView[]) {
  const surveyPromises: Promise<{ index: number; surveyTitle: string }>[] = [];

  for (let i = 0; i < surveys.length; i++) {
    if (surveys[i].surveyTitleIPFS.size !== 0) {
      surveyPromises.push(
        (async () => {
          try {
            const titleStringData = await readIPFS(surveys[i].surveyTitleIPFS);
            return { index: i, surveyTitle: titleStringData.optionString };
          } catch (error) {
            // Handle error if needed
            return { index: i, surveyTitle: '' }; // or any default value
          }
        })(),
      );
    } else {
      surveyPromises.push(
        Promise.resolve({
          index: i,
          surveyTitle: bytes32ToString(surveys[i].surveyTitle),
        }),
      );
    }
  }
  const resolvedOptions = await Promise.all(surveyPromises);
  return resolvedOptions;
}

export function SortList({
  sortData,
  surveyData,
  setSurveyData,
  originalData,
  className,
}: {
  sortData: SortListProps[];
  surveyData: MinimalSurveyView[];
  setSurveyData: React.Dispatch<React.SetStateAction<MinimalSurveyView[]>>;
  originalData: MinimalSurveyView[];
  className?: string;
}) {
  const { layout } = useLayout();
  const [selectedItem, setSelectedItem] = useState(sortData[0]);
  useEffect(() => {
    if (selectedItem.name == 'Time') {
      // sort the surveydata based on time
      const sortedData = surveyData.sort((a, b) => a.validUntil - b.validUntil);
      setSurveyData([...sortedData]);
    }
    if (selectedItem.name == 'Response') {
      // sort the surveydata based on response
      const sortedData = surveyData.sort(
        (a, b) => a.targetAudienceReached - a.targetAudienceReached,
      );
      setSurveyData([...sortedData]);
    }
    if (selectedItem.name == 'Latest') {
      // sort the surveydata based on latest
      const sortedData = surveyData.sort((a, b) => a.surveyId - b.surveyId);
      setSurveyData([...sortedData]);
    }
    if (selectedItem.name == 'All') {
      setSurveyData([...originalData]);
    }
  }, [selectedItem]);
  return (
    <div className="relative w-full lg:w-auto">
      <Listbox value={selectedItem} onChange={setSelectedItem}>
        {layout === LAYOUT_OPTIONS.RETRO ? (
          <>
            <Listbox.Button className="hidden h-11 w-full items-center justify-between rounded-lg pr-2 text-sm text-gray-900 dark:text-white lg:flex xl:flex 3xl:hidden">
              <HorizontalThreeDots />
            </Listbox.Button>
            <Listbox.Button
              className={cn(
                'flex h-11 w-full items-center justify-between gap-1 rounded-lg bg-gray-100 px-3 text-sm text-gray-900 dark:bg-gray-800 dark:text-white lg:hidden lg:w-40 xl:hidden xl:w-48 3xl:flex',
                className,
              )}
            >
              {selectedItem.name} <ChevronDown />
            </Listbox.Button>
          </>
        ) : (
          <Listbox.Button
            className={cn(
              'flex h-11 w-full items-center justify-between gap-1 rounded-lg bg-gray-100 px-3 text-sm text-gray-900 dark:bg-gray-800 dark:text-white md:w-36 lg:w-40 xl:w-48',
              className,
            )}
          >
            {selectedItem.name}
            <ChevronDown />
          </Listbox.Button>
        )}
        <Transition
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 -translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <Listbox.Options className="absolute z-20 mt-2 w-full min-w-[150px] origin-top-right rounded-lg bg-white p-3 px-1.5 shadow-large shadow-gray-400/10 ltr:right-0 rtl:left-0 dark:bg-[rgba(0,0,0,0.5)] dark:shadow-gray-900 dark:backdrop-blur">
            {sortData.map((item) => (
              <Listbox.Option key={item.id} value={item}>
                {({ selected }) => (
                  <div
                    className={`block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white  ${
                      selected
                        ? 'my-1 bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
}

function Search({
  surveyData,
  setSurveyData,
  originalData,
}: {
  surveyData: MinimalSurveyView[];
  setSurveyData: React.Dispatch<React.SetStateAction<MinimalSurveyView[]>>;
  originalData: MinimalSurveyView[];
}) {
  const [input, setInput] = useState('');
  useEffect(() => {
    if (input.length === 0) {
      setSurveyData([...originalData]);
    } else {
      const filteredData = surveyData.filter((survey) =>
        survey.surveyTitle.toLowerCase().includes(input.toLowerCase()),
      );
      setSurveyData([...filteredData]);
    }
  }, [input]);
  return (
    <form
      className="relative flex w-full rounded-full lg:w-auto lg:basis-72 xl:w-48"
      noValidate
      role="search"
    >
      <label className="flex w-full items-center">
        <input
          className="h-11 w-full appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pl-10 ltr:pr-5 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
          placeholder="Search Surveys"
          autoComplete="off"
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
        <span className="pointer-events-none absolute flex h-full w-8 cursor-pointer items-center justify-center text-gray-600 hover:text-gray-900 ltr:left-0 ltr:pl-2 rtl:right-0 rtl:pr-2 dark:text-gray-500 sm:ltr:pl-3 sm:rtl:pr-3">
          <SearchIcon className="h-4 w-4" />
        </span>
      </label>
    </form>
  );
}

function StackedSwitch({
  surveyData,
  setSurveyData,
  originalData,
  className,
}: {
  surveyData: MinimalSurveyView[];
  setSurveyData: React.Dispatch<React.SetStateAction<MinimalSurveyView[]>>;
  originalData: MinimalSurveyView[];
  className?: string;
}) {
  const [isStacked, setIsStacked] = useState(false);
  useEffect(() => {
    if (isStacked) {
      const filteredData = surveyData.filter(
        (survey) => !survey.isSurveyPrivate,
      );
      setSurveyData([...filteredData]);
    } else {
      setSurveyData([...originalData]);
    }
  }, [isStacked]);

  return (
    <Switch
      checked={isStacked}
      onChange={setIsStacked}
      className="flex items-center gap-2 text-gray-400 sm:gap-3"
    >
      <div
        className={cn(
          isStacked ? 'bg-brand dark:bg-white' : 'bg-gray-200 dark:bg-gray-500',
          'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300',
        )}
      >
        <span
          className={cn(
            isStacked
              ? 'bg-white ltr:translate-x-5 rtl:-translate-x-5 dark:bg-light-dark'
              : 'bg-white ltr:translate-x-0.5 rtl:-translate-x-0.5 dark:bg-light-dark',
            'inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-200',
          )}
        />
      </div>
      <span className="inline-flex text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-sm">
        PUBLIC SURVEYS ONLY
      </span>
    </Switch>
  );
}

function Status({
  surveyData,
  setSurveyData,
  originalData,
  className,
}: {
  surveyData: MinimalSurveyView[];
  setSurveyData: React.Dispatch<React.SetStateAction<MinimalSurveyView[]>>;
  originalData: MinimalSurveyView[];
  className?: string;
}) {
  const [status, setStatus] = useState('active');
  useEffect(() => {
    if (status == 'active') {
      const filteredData = originalData.filter(
        (survey) => survey.surveyStatus == SurveyStatus.ACTIVE,
      );
      setSurveyData([...filteredData]);
    } else {
      const filteredData = originalData.filter(
        (survey) =>
          survey.surveyStatus == SurveyStatus.CLOSED ||
          survey.surveyStatus == SurveyStatus.EXPIRED ||
          survey.surveyStatus == SurveyStatus.PAUSED,
      );
      setSurveyData([...filteredData]);
    }
  }, [status]);
  return (
    <RadioGroup
      value={status}
      onChange={setStatus}
      className="flex items-center sm:gap-3"
    >
      <RadioGroup.Option value="active">
        {({ checked }) => (
          <span
            className={`relative flex h-11 w-20 cursor-pointer items-center justify-center rounded-lg text-center text-xs font-medium tracking-wider sm:w-24 sm:text-sm ${
              checked ? 'text-white' : 'text-brand dark:text-white/50'
            }`}
          >
            {checked && (
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
                layoutId="statusIndicator"
              />
            )}
            <span className="relative">ACTIVE</span>
          </span>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="inactive">
        {({ checked }) => (
          <span
            className={`relative flex h-11 w-20 cursor-pointer items-center justify-center rounded-lg text-center text-xs font-medium tracking-wider sm:w-24 sm:text-sm ${
              checked ? 'text-white' : 'text-brand dark:text-white/50'
            }`}
          >
            {checked && (
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
                layoutId="statusIndicator"
              />
            )}
            <span className="relative">INACTIVE</span>
          </span>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
}

export default function SurveyListView() {
  const [SurveyData, setSurveyData] = useState<MinimalSurveyView[]>([]);
  const [originalData, setOriginalData] = useState<MinimalSurveyView[]>([]);
  const { getAllSurveysOfOrganisation } = useContext(SurveyContractContext);
  const { currentProfileSelected } = useContext(ProfileContractContext);
  const router = useRouter();
  useEffect(() => {
    const innerfn = async function () {
      var res = await getAllSurveysOfOrganisation();
      // create MinimalSurveyView object of length res
      var temp: MinimalSurveyView[] = [];
      const data = await ResolveTitle(res);
      console.log(res);
      for (let i = 0; i < res.length; i++) {
        temp.push({
          surveyId: Number(res[i].surveyId),
          surveyTitle: data[i].surveyTitle,
          surveyTitleIPFS: res[i].surveyTitleIPFS,
          surveyStatus: res[i].surveyStatus,
          isSurveyPrivate: res[i].isSurveyPrivate,
          validUntil: Number(res[i].validUntil),
          targetAudienceSize: Number(res[i].targetAudienceSize),
          targetAudienceReached: Number(res[i].targetAudienceReached),
        });
      }
      setOriginalData(temp);
      setSurveyData(temp);
    };

    const orgId = currentProfileSelected?.value?.organisationId;
    if (orgId) {
      innerfn();
    } else {
      toast.error('Only Organisations can access this page.');
      // chanage route to home
      router.push(routes.home);
    }
  }, []);
  return (
    <div className="mx-auto w-full">
      <div
        className={cn(
          'mb-6 flex flex-col justify-between gap-4',
          'md:flex-row md:items-center md:gap-6',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Status
            surveyData={SurveyData}
            setSurveyData={setSurveyData}
            originalData={originalData}
          />
          <div className={cn('md:hidden')}>
            <StackedSwitch
              surveyData={SurveyData}
              setSurveyData={setSurveyData}
              originalData={originalData}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 lg:gap-8">
          <div className={cn('hidden shrink-0 ', 'md:block')}>
            <StackedSwitch
              surveyData={SurveyData}
              setSurveyData={setSurveyData}
              originalData={originalData}
            />
          </div>
          <Search
            surveyData={SurveyData}
            setSurveyData={setSurveyData}
            originalData={originalData}
          />
          <SortList
            sortData={sort}
            surveyData={SurveyData}
            setSurveyData={setSurveyData}
            originalData={originalData}
          />
        </div>
      </div>

      <div className="mb-3 hidden grid-cols-3 gap-6 rounded-lg bg-white shadow-card dark:bg-light-dark sm:grid lg:grid-cols-5">
        <span className="px-6 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
          ID
        </span>
        <span className="px-6 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
          Title
        </span>
        <span className="px-6 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
          AR
        </span>
        <span className="hidden px-6 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300 lg:block">
          Privacy
        </span>
        <span className="hidden px-4 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300 lg:block">
          Status
        </span>
      </div>

      {SurveyData.map((survey) => (
        <SurveyList
          key={generateRandomString(37)}
          index={survey.surveyId}
          title={survey.surveyTitle}
          isPrivate={survey.isSurveyPrivate}
          status={survey.surveyStatus}
          validUntil={survey.validUntil}
          targetAudienceSize={survey.targetAudienceSize}
          targetAudienceReached={survey.targetAudienceReached}
        >
          <ActiveLink href={`/survey/orgView/${survey.surveyId}`}>
            <Button shape="rounded" fullWidth size="large">
              Manage Survey
            </Button>
          </ActiveLink>
        </SurveyList>
      ))}
    </div>
  );
}
