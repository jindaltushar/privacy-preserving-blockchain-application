'use client';

import Button from '@/components/ui/button/button';

import UpdateSurveyStatus from './invest-day';
import AmountPerInvestment from './amount-per-investment';
import AdvanceSetting from './advance-setting';
import { useModal } from '@/components/modal-views/context';
import { Listbox } from '@/components/ui/listbox';
import InputLabel from '@/components/ui/input-label';
import { ChevronDown } from '@/components/icons/chevron-down';
import { Transition } from '@/components/ui/transition';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/forms/input';
import { SurveyStatus } from '@/app/shared/types';
import Datepicker, { DateRangeType } from 'react-tailwindcss-datepicker';
import cn from 'classnames';
import { formatBalance } from '@/app/shared/utils';
export const statusObject = [
  {
    name: 'ACTIVE',
    value: 0,
  },
  {
    name: 'PAUSED',
    value: 1,
  },
  {
    name: 'EXPIRED',
    value: 2,
  },
  {
    name: 'CLOSED',
    value: 3,
  },
];

export default function SurveyInfoDIV({
  surveyData,
  surveyStatusNew,
  setSurveyStatusNew,
  targetAudienceNew,
  setTargetAudienceNew,
  validUntilNew,
  setValidUntilNew,
  setShowSaveModal,
  showSaveModal,
  setValidUntilOld,
  costToAnsSurvey,
}) {
  const handleInputChange = (e) => {
    setTargetAudienceNew(e.target.value);
  };
  useEffect(() => {
    console.log('date date is ', surveyData.validUntill);
    try {
      setValidUntilNew({
        startDate: new Date(surveyData.validUntill).toISOString().slice(0, 10),
        endDate: new Date(surveyData.validUntill).toISOString().slice(0, 10),
      });
      setValidUntilOld({
        startDate: new Date(surveyData.validUntill).toISOString().slice(0, 10),
        endDate: new Date(surveyData.validUntill).toISOString().slice(0, 10),
      });
      console.log('target aud', surveyData.targetAudience);
      console.log('survey status', surveyData.status);
      setTargetAudienceNew(surveyData.targetAudience);
      const val = statusObject.filter(
        (status) => status.value === surveyData.status,
      )[0];
      setSurveyStatusNew(val);
    } catch {
      console.log('error in date');
    }
  }, [surveyData]);

  return (
    <>
      {surveyData && (
        <form
          noValidate
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col rounded-lg bg-white p-4 shadow-card dark:bg-light-dark sm:p-6 lg:h-full 2xl:px-8"
        >
          <div className="flex-grow">
            <div className="grid grid-cols-1 gap-6">
              {/* <InvestDay />
            <AmountPerInvestment /> */}
              <div>
                <div>
                  <div className="mt-1 grid grid-cols-1 gap-4 text-sm 2xl:mt-1 2xl:gap-6">
                    <button
                      className="group flex items-center justify-between"
                      // onClick={() => openModal('PROFIT_TRANSFER_PREVIEW')}
                    >
                      <span>Survey Type</span>
                      <span className="flex items-center gap-2">
                        <span>
                          {surveyData.isSurveyPrivate ? 'Private' : 'Public'}
                        </span>
                        {/* <ChevronForward className="w-4 transition-transform group-hover:-translate-x-1" /> */}
                      </span>
                    </button>

                    <button
                      className="group flex items-center justify-between"
                      // onClick={() => openModal('PROFIT_TRANSFER_PREVIEW')}
                    >
                      <span>Created By</span>
                      <span className="flex items-center gap-2">
                        <span>{surveyData.createdBy}</span>
                        {/* <ChevronForward className="w-4 transition-transform group-hover:-translate-x-1" /> */}
                      </span>
                    </button>

                    <button
                      className="group flex items-center justify-between"
                      // onClick={() => openModal('PROFIT_TRANSFER_PREVIEW')}
                    >
                      <span>Created At</span>
                      <span className="flex items-center gap-2">
                        <span>
                          {surveyData?.createdAt?.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true, // or false for 24-hour format
                          })}
                        </span>
                        {/* <ChevronForward className="w-4 transition-transform group-hover:-translate-x-1" /> */}
                      </span>
                    </button>

                    <button
                      className="group flex items-center justify-between"
                      // onClick={() => openModal('PROFIT_TRANSFER_PREVIEW')}
                    >
                      <span>Publish on Marketplace</span>
                      <span className="flex items-center gap-2">
                        <span>
                          {surveyData.publishOnMarketplace ? 'Yes' : 'No'}
                        </span>
                        {/* <ChevronForward className="w-4 transition-transform group-hover:-translate-x-1" /> */}
                      </span>
                    </button>

                    <button
                      className="group flex items-center justify-between"
                      // onClick={() => openModal('PROFIT_TRANSFER_PREVIEW')}
                    >
                      <span>Max cost per Respondant</span>
                      <span className="flex items-center gap-2">
                        <span>
                          {costToAnsSurvey
                            ? formatBalance(costToAnsSurvey)
                            : 'calculating ...'}
                        </span>
                        {/* <ChevronForward className="w-4 transition-transform group-hover:-translate-x-1" /> */}
                      </span>
                    </button>
                    {/* <Survey Status update listbox /> */}
                    <div>
                      <InputLabel
                        className="!mb-2 sm:!mb-3"
                        titleClassName="!capitalize !font-normal"
                        title="Survey Stutus"
                      />
                      <div className="relative">
                        <Listbox
                          value={surveyStatusNew}
                          onChange={setSurveyStatusNew}
                        >
                          <Listbox.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-gray-200/50 px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
                            <div className="flex items-center">
                              {surveyStatusNew.name}
                            </div>
                            <ChevronDown />
                          </Listbox.Button>
                          <Transition
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-light-dark xs:p-2">
                              {statusObject.map((option) => (
                                <Listbox.Option
                                  key={option.value}
                                  value={option}
                                >
                                  {({ selected }) => (
                                    <div
                                      className={cn(
                                        'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100',
                                        selected
                                          ? 'bg-gray-200/70 font-medium dark:bg-gray-600/60'
                                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/70',
                                      )}
                                    >
                                      {option.name}
                                    </div>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </Listbox>
                      </div>
                    </div>
                    <div>
                      <InputLabel
                        className="!mb-2 sm:!mb-3"
                        titleClassName="!capitalize !font-normal"
                        title="Targeted Audience Size"
                      />
                      <Input
                        type="number"
                        placeholder="Target Audience"
                        autoComplete="off"
                        value={targetAudienceNew}
                        onChange={handleInputChange}
                        inputClassName="border-[#E2E8F0] dark:!bg-light-dark reset-password-pin-code appearance-none rounded-lg placeholder:!text-gray-500 !bg-gray-200/50 !text-sm !font-medium pr-16 pl-4"
                      />
                    </div>
                    <div>
                      <InputLabel
                        className="!mb-2 sm:!mb-3"
                        titleClassName="!capitalize !font-normal"
                        title="Survey Valid Until"
                      />
                      <Datepicker
                        useRange={false}
                        asSingle={true}
                        value={validUntilNew}
                        onChange={setValidUntilNew}
                        minDate={new Date()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            shape="rounded"
            className="mt-8 w-full !font-bold uppercase dark:bg-blue-800"
            disabled={showSaveModal}
            onClick={() => {
              setShowSaveModal(true);
            }}
          >
            Save Status
          </Button>
        </form>
      )}
    </>
  );
}
