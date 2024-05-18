'use client';

import type { CoinTypes } from '@/types';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';
import { Oasis } from '@/components/icons/oasis';
import { ChevronDown } from '@/components/icons/chevron-down';
import { useClickAway } from '@/lib/hooks/use-click-away';
import { useLockBodyScroll } from '@/lib/hooks/use-lock-body-scroll';
import { coinList } from '@/data/static/coin-list';
import { SurveyAccount } from '@/app/shared/types';
import { BigNumber as ethBigNumber } from 'ethers';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { set } from 'lodash';
import { useRecoilState } from 'recoil';
import { walletSurveyIdAtom, walletAmountAtom } from '@/stores/atoms';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
// dynamic import
const CoinSelectView = dynamic(
  () => import('@/components/ui/coin-select-view'),
);

interface CoinInputTypes extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  exchangeRate?: ethBigNumber;
  defaultAccountIndex?: number;
  data: SurveyAccount[];
  className?: string;
  disableSelect?: boolean;
  disableInput?: boolean;
  accountBalances?: {};
  preferedCurrency?: string;
  setInteractWithSurveyId?: React.Dispatch<React.SetStateAction<number | null>>;
}

const decimalPattern = /^[0-9]*[.,]?[0-9]*$/;

export default function CoinInput({
  label,
  data,
  defaultAccountIndex = 0,
  exchangeRate,
  disableSelect = false,
  disableInput = false,
  accountBalances,
  preferedCurrency,
  className,
  ...rest
}: CoinInputTypes) {
  let router = useRouter();
  let [value, setValue] = useState('');
  let [surveyId, setSurveyId] = useRecoilState(walletSurveyIdAtom);
  let [amount, setAmount] = useRecoilState(walletAmountAtom);
  let [selectedAccount, setSelectedAccount] = useState(
    data[defaultAccountIndex],
  );
  let [visibleAccountList, setVisibleAccountList] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  useClickAway(modalContainerRef, () => {
    setVisibleAccountList(false);
  });
  useEffect(() => {
    try {
      data[defaultAccountIndex].surveyId;
    } catch {
      toast.error(
        'You must have atleast created one survey to access wallet feature.',
      );
      router.push('/');
      return;
    }
    try {
      if (data[defaultAccountIndex].surveyId != selectedAccount.surveyId) {
        setSelectedAccount(data[defaultAccountIndex]);
        if (!disableSelect) {
          setSurveyId(data[defaultAccountIndex].surveyId);
        }
        console.log('inuseefeet');
        setValue('');
      }
    } catch {
      setSelectedAccount(data[defaultAccountIndex]);
      if (!disableSelect) {
        setSurveyId(data[defaultAccountIndex].surveyId);
      }
      console.log('inuseefeet failed');
      setValue('');
    }
  }, [data]);

  useLockBodyScroll(visibleAccountList);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    if (isNaN(newValue)) {
      setValue('0');
      return;
    }
    console.log('setting new val', newValue);
    setValue(String(newValue));
    setAmount(String(newValue));
  };

  function handleSelectedAccount(coin: SurveyAccount) {
    setSelectedAccount(coin);
    setSurveyId(coin.surveyId);
    setVisibleAccountList(false);
  }

  return (
    <>
      <div
        className={cn(
          'group flex min-h-[70px] rounded-lg border border-gray-200 transition-colors duration-200 hover:border-gray-900 dark:border-gray-700 dark:hover:border-gray-600',
          className,
        )}
      >
        <div className="min-w-[190px] border-r border-gray-200 p-3 transition-colors duration-200 group-hover:border-gray-900 dark:border-gray-700 dark:group-hover:border-gray-600">
          <span className="mb-1.5 block text-xs uppercase text-gray-600 dark:text-gray-400">
            {label}
          </span>
          <button
            disabled={disableSelect}
            onClick={() => setVisibleAccountList(true)}
            className="flex items-center font-medium outline-none dark:text-gray-100"
          >
            <Oasis />
            <span className="ltr:ml-2 rtl:mr-2">
              {!disableSelect
                ? 'Survey #' + selectedAccount?.surveyId + ' '
                : 'Funding Account'}
            </span>
            {!disableSelect && (
              <ChevronDown className="flex align-right ltr:ml-1.5 rtl:mr-1.5" />
            )}
          </button>
        </div>
        <div className="flex flex-1 flex-col text-right">
          <input
            type="text"
            value={value}
            disabled={disableInput}
            placeholder={'0.0 ROSE'}
            inputMode="decimal"
            onChange={handleChange}
            className="w-full rounded-br-lg rounded-tr-lg border-0 pb-0.5 text-right text-lg outline-none focus:ring-0 dark:bg-light-dark"
            {...rest}
          />
          <span className="font-xs px-3 text-gray-400">
            {exchangeRate
              ? `${preferedCurrency == 'USD' ? '$' : '€'} 
                ${(
                  Number(ethers.utils.formatUnits(exchangeRate.toString())) *
                  Number(value)
                ).toFixed(2)}`
              : '$ 0.00'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {visibleAccountList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-gray-700 bg-opacity-60 p-4 text-center backdrop-blur xs:p-5"
          >
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-full align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              ref={modalContainerRef}
              className="inline-block text-left align-middle"
            >
              <CoinSelectView
                onSelect={(selectedAccount) =>
                  handleSelectedAccount(selectedAccount)
                }
                title={'Select Account'}
                data={data}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

CoinInput.displayName = 'CoinInput';
