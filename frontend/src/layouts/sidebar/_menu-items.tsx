import routes from '@/config/routes';
import { HomeIcon } from '@/components/icons/home';
import { FarmIcon } from '@/components/icons/farm';
import { PoolIcon } from '@/components/icons/pool';
import { ProfileIcon } from '@/components/icons/profile';
import { DiskIcon } from '@/components/icons/disk';
import { ExchangeIcon } from '@/components/icons/exchange';
import { VoteIcon } from '@/components/icons/vote-icon';
import { PlusCircle } from '@/components/icons/plus-circle';
import { CompassIcon } from '@/components/icons/compass';
import { LivePricing } from '@/components/icons/live-pricing';
import { LockIcon } from '@/components/icons/lock-icon';
import { TradingBotIcon } from '@/components/icons/trading-bot-icon';
import { MdCurrencyExchange } from 'react-icons/md';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import { LuWallet } from 'react-icons/lu';

export const SurveyIcon = () => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="4 2 18 20"
      height="19"
      width="19"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17 2V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7V2H17ZM7 6H5V20H19V6H17V8H7V6ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z"></path>
    </svg>
  );
};

export const defaultMenuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
    showToOrganisation: true,
    checkAccess: false,
    showToIndividual: true,
  },
  {
    name: 'Manage Surveys',
    icon: <FarmIcon />,
    href: routes.manageSurveys,
    showToOrganisation: true,
    checkAccess: false,
    showToIndividual: false,
  },
  {
    name: 'Surveys',
    icon: <SurveyIcon />,
    href: '/surveys',
    showToOrganisation: false,
    checkAccess: false,
    showToIndividual: true,
    mrginleft: 2,
  },
  {
    name: 'Respond to survey',
    icon: <HomeIcon />,
    href: '/survey/respond/100',
    showToOrganisation: false,
    checkAccess: false,
    showToIndividual: false,
  },
  {
    name: 'Wallet',
    icon: <LuWallet size={20} />,
    href: routes.wallet,
    showToOrganisation: true,
    checkAccess: false,
    showToIndividual: false,
    mrginleft: 2,
  },
  {
    name: 'Profile',
    icon: <ProfileIcon />,
    href: routes.profile,
    showToOrganisation: false,
    checkAccess: false,
    showToIndividual: true,
  },
  {
    name: 'Organisation',
    icon: <ProfileIcon />,
    href: '/organisation',
    showToOrganisation: true,
    checkAccess: false,
    showToIndividual: false,
  },
  {
    name: 'Currency Exchange',
    icon: <MdCurrencyExchange size={19} />,
    href: 'https://illuminex.xyz/',
    showToOrganisation: true,
    showToIndividual: true,
    checkAccess: false,
    mrginleft: 2,
  },
  {
    name: 'Admin',
    icon: <MdOutlineAdminPanelSettings size={21} />,
    href: '/admin',
    showToOrganisation: false,
    showToIndividual: true,
    checkAccess: true,
    mrginleft: 2,
  },
];

export const MinimalMenuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },
  {
    name: 'Manage Surveys',
    icon: <FarmIcon />,
    href: routes.manageSurveys,
  },
  {
    name: 'Live Pricing',
    icon: <LivePricing />,
    href: routes.livePricing,
  },
  {
    name: 'Trading Bot',
    icon: <TradingBotIcon />,
    href: routes.tradingBot,
  },
  {
    name: 'NFTs',
    icon: <CompassIcon />,
    href: routes.search,
    dropdownItems: [
      {
        name: 'Explore NFTs',
        icon: <CompassIcon />,
        href: routes.search,
      },
      {
        name: 'Create NFT',
        icon: <PlusCircle />,
        href: routes.createNft,
      },
      {
        name: 'NFT Details',
        icon: <DiskIcon />,
        href: routes.nftDetails,
      },
    ],
  },
  {
    name: 'Farm',
    icon: <FarmIcon />,
    href: routes.farms,
  },
  {
    name: 'Swap',
    icon: <ExchangeIcon />,
    href: routes.swap,
  },
  {
    name: 'Pages',
    icon: <VoteIcon />,
    href: routes.pages,
    dropdownItems: [
      {
        name: 'Profile',
        icon: <ProfileIcon />,
        href: routes.profile,
      },
      {
        name: 'Liquidity',
        icon: <PoolIcon />,
        href: routes.liquidity,
      },
      {
        name: 'Vote',
        icon: <VoteIcon />,
        href: routes.vote,
        dropdownItems: [
          {
            name: 'Explore',
            href: routes.vote,
          },
          {
            name: 'Vote with criptic',
            href: routes.proposals,
          },
          {
            name: 'Create proposal',
            href: routes.createProposal,
          },
        ],
      },
      {
        name: 'Authentication',
        icon: <LockIcon className="w-[18px]" />,
        href: routes.signIn,
        dropdownItems: [
          {
            name: 'Sign in',
            href: routes.signIn,
          },
          {
            name: 'Sign up',
            href: routes.signUp,
          },
          {
            name: 'Reset pin',
            href: routes.resetPin,
          },
          {
            name: 'Forget password',
            href: routes.forgetPassword,
          },
        ],
      },
    ],
  },
];
