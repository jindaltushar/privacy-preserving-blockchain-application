'use client';
import React, { useEffect, useContext } from 'react';
import TransactionInfo from '@/components/ui/transaction-info';
import {
  totalRewardsAtom,
  exchangeOasisUSDPriceAtom,
  preferedCurrencyAtom,
} from '@/stores/atoms';
import { PriceOracleContext } from '@/contracts-context/PriceOracleContractContext';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Transition } from '@/components/ui/transition';
import Image from 'next/image';
import { BigNumber } from 'ethers';
import WalletImage from '@/assets/images/wallet.png';
import { formatBalance } from '@/app/shared/utils';

const SurveyRespondSidebarComponent = () => {
  const { getPriceIn } = useContext(PriceOracleContext);
  const [priceRate, setPriceRate] = useRecoilState(exchangeOasisUSDPriceAtom);
  const preferedCurrency = useRecoilValue(preferedCurrencyAtom);
  const totalRewards = useRecoilValue(totalRewardsAtom);
  useEffect(() => {
    const insidefn = async () => {
      var price = await getPriceIn('USD');
      if (preferedCurrency == 'EUR') {
        price = BigNumber.from(String(Math.round(Number(price) * 0.93)));
      }
      setPriceRate(price);
    };
    insidefn();
  }, [preferedCurrency]);
  if (totalRewards !== null) {
    return (
      <Transition
        appear={true}
        show={true}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="relative mt-20 hidden flex-col items-center rounded-lg bg-gray-200 p-6 dark:bg-[#333E59] lg:flex">
          <Image src={WalletImage} alt="Wallet" width={100} height={100} />
          <h2 className="mb-7 mt-5 text-center text-[20px] font-semibold leading-8 text-light-dark dark:text-white">
            Your Rewards
          </h2>
          <TransactionInfo
            label={'Receive'}
            value={formatBalance(Number(totalRewards))}
            // value={totalRewards}
          />
          <TransactionInfo
            label={'Equivalent'}
            value={`${preferedCurrency == 'USD' ? '$' : '€'} ${(
              Number(totalRewards) / Number(priceRate)
            ).toFixed(3)}`}
          />
        </div>
      </Transition>
    );
  }
};

export default SurveyRespondSidebarComponent;
