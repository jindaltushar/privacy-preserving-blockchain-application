'use client';

import { useEffect, useState, useContext } from 'react';
import CoinSlider from '@/components/ui/coin-card';
import { SiEthereum } from 'react-icons/si';
import TetherImage from '@/assets/images/coin/tether.svg';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { FaPeopleGroup } from 'react-icons/fa6';
import { RiSurveyFill } from 'react-icons/ri';
import TopupButton from '@/components/ui/topup-button';
import UserIMage from '@/assets/images/user.png';
import AvatarIPFS from '@/components/ui/avatar-ipfs';
import Avatar from '@/components/ui/avatar';
import UniMannheim from '@/assets/images/uniMannheim.png';
import Image from 'next/image';
import { selectedProfileAtom } from '@/stores/atoms';
import ContractsTable from '@/components/contracts/contracts-table';
import Button from '@/components/ui/button';
import {
  getMyRewardsTotal,
  getTotalValueTransactedOnPlatform,
} from '@/app/shared/central-server';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { useRecoilState } from 'recoil';
import { color } from 'framer-motion';
import cn from 'classnames';
function gweiToEther(gwei) {
  return gwei / 1e9; // 1 Gwei = 1e9 Wei
}

export default function ModernScreen() {
  const { currentAccount } = useContext(SignerProviderContext);
  const { totalSurveys } = useContext(SurveyContractContext);
  const { getTotalUserCount } = useContext(ProfileContractContext);
  const [coinsliderData, setCoinSliderData] = useState([]);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [selectedProfile, setSelectedProfile] =
    useRecoilState(selectedProfileAtom);
  useEffect(() => {
    const insidefn = async () => {
      const totalUsers = await getTotalUserCount();
      const surveycount = await totalSurveys();
      const rewardsTraded = await getTotalValueTransactedOnPlatform();
      setCoinSliderData([
        {
          id: '1',
          name: 'Total Users',
          symbol: 'Users',
          logo: <FaPeopleGroup size={160} color={'white'} />,
          balance: totalUsers,
        },
        {
          id: '2',
          name: 'Total Surveys',
          symbol: 'Surveys',
          logo: <RiSurveyFill size={140} color={'white'} />,
          balance: surveycount,
          color: '#E1F9F1',
        },
        {
          id: '3',
          name: 'Rewards Traded On Platform',
          symbol: 'ETH',
          logo: <SiEthereum size={130} color={'white'} />,
          balance: gweiToEther(rewardsTraded.total).toFixed(2),
          color: '#DBE3FF',
        },
      ]);
      const rewards = await getMyRewardsTotal(currentAccount);
      if (rewards.total) {
        setEarnedRewards(rewards.total);
      }
    };
    insidefn();
  }, []);
  useEffect(() => {
    console.log('selected profile print from modern scren', selectedProfile);
  }, [selectedProfile]);
  return (
    <>
      <div className="flex flex-wrap">
        <div className="mb-8 w-full sm:mb-0 sm:w-1/2 sm:ltr:pr-6 sm:rtl:pl-6 md:w-[calc(100%-256px)] lg:w-[calc(100%-288px)] 2xl:w-[calc(100%-320px)] 3xl:w-[calc(100%-358px)]">
          <CoinSlider coins={coinsliderData} />
        </div>
        <div className="w-full sm:w-1/2 md:w-64 lg:w-72 2xl:w-80 3xl:w-[358px]">
          <div className="flex h-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
            {selectedProfile &&
              selectedProfile?.value &&
              selectedProfile?.value.profilePhotoHash &&
              selectedProfile?.value.profilePhotoHash.size != 0 && (
                <AvatarIPFS
                  hash={selectedProfile?.value.profilePhotoHash}
                  alt="Author"
                  className="mx-auto mb-6"
                  size="lg"
                />
              )}
            {selectedProfile &&
              selectedProfile?.value &&
              selectedProfile?.value.organisationProfilePhotoHash &&
              selectedProfile?.value.organisationProfilePhotoHash.size != 0 && (
                <AvatarIPFS
                  hash={selectedProfile?.value.organisationProfilePhotoHash}
                  alt="Author"
                  className="mx-auto mb-6"
                  size="lg"
                />
              )}
            {((selectedProfile &&
              selectedProfile?.value &&
              selectedProfile?.value.organisationProfilePhotoHash &&
              selectedProfile?.value.organisationProfilePhotoHash.size == 0 &&
              selectedProfile) ||
              (selectedProfile?.value &&
                selectedProfile?.value.profilePhotoHash &&
                selectedProfile?.value.profilePhotoHash.size == 0)) && (
              <Avatar
                image={UserIMage}
                alt="Author"
                className="mx-auto mb-6"
                size="lg"
              />
            )}

            <h3 className="mb-2 text-center text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 3xl:mb-3">
              Earned Rewards{' '}
            </h3>
            <div className="mb-7 text-center font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
              {gweiToEther(earnedRewards).toFixed(2)} ETH
            </div>
            <TopupButton />
          </div>
        </div>
        <div>
          <div className="flex flex-wrap mt-5">
            <div
              className={cn(
                'w-full lg:w-[calc(100%-288px)] ltr:lg:pr-6 rtl:lg:pl-6 2xl:w-[calc(100%-320px)] 3xl:w-[calc(100%-358px)]',
              )}
            >
              <ContractsTable />
            </div>
            <div
              className={cn(
                'order-first w-full mb-8 grid w-full grid-cols-1 gap-6 sm:mb-10 sm:grid-cols-2 lg:order-1 lg:mb-0 lg:flex lg:w-72 lg:flex-col 2xl:w-80 3xl:w-[358px]',
              )}
            >
              <div className="rounded-tl-lg w-full rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8 flex flex-col items-center justify-center min-w-[500px]">
                <div className="mb-5">
                  <Image
                    src={UniMannheim}
                    alt="Uni Mannheim"
                    width={200}
                    className="align-center"
                  />
                </div>
                <h3 className="mt-5 text-center text-lg font-semibold text-gray-900 dark:text-white">
                  About Us
                </h3>
                <p className="mt-2 text-justify text-sm text-gray-500 dark:text-gray-400">
                  This project is a part of master thesis, developed at
                  University of Mannheim. The objective is to provide a platform
                  for conducting surveys and rewarding users for their
                  participation while preserving their privacy. The application
                  is built using state of the art technologies like IPFS, EVM,
                  Solidity, Next.js, and more. The application is deployed on
                  Oasis Sapphire mainnet.
                </p>
                <Button className="mt-10 mb-10 mx-5 w-full" shape="rounded">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
