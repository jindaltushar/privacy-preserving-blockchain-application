'use client';

import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';
import { RadioGroup } from '@/components/ui/radio-group';
import routes from '@/config/routes';
import { useModal } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import ActiveLink from '@/components/ui/links/active-link';
import { AddressesOfOrganisation } from '@/app/shared/types';
import AnchorLink from '@/components/ui/links/anchor-link';
import { RangeIcon } from '@/components/icons/range-icon';
import { ExportIcon } from '@/components/icons/export-icon';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useLayout } from '@/lib/hooks/use-layout';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';

import { LAYOUT_OPTIONS } from '@/lib/constants';
// dynamic import
const Listbox = dynamic(() => import('@/components/ui/list-box'));

function ActiveNavLink({ href, title, isActive, className }: any) {
  return (
    <ActiveLink
      href={':'}
      className={cn(
        'relative z-[1] inline-flex items-center px-3 py-1.5',
        className,
      )}
      activeClassName="font-medium text-white"
    >
      <span>{title}</span>
      {isActive && (
        <motion.span
          className="absolute bottom-0 left-0 right-0 -z-[1] h-full w-full rounded-lg bg-brand shadow-large"
          layoutId="activeNavLinkIndicator"
        />
      )}
    </ActiveLink>
  );
}

export default function Trade({
  currentActiveTab,
  setCurrentActiveTab,
  addressData,
  children,
}: React.PropsWithChildren<{
  currentActiveTab: String;
  setCurrentActiveTab: React.Dispatch<React.SetStateAction<String>>;
  addressData: AddressesOfOrganisation;
}>) {
  const isMounted = useIsMounted();
  const breakpoint = useBreakpoint();
  const [status, setStatus] = useState('live');
  const { getCurrentNonce } = useContext(GaslessContractContext);
  const { openModal } = useModal();
  return (
    <div className="pt-8 text-sm xl:pt-10">
      <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-5 pt-4 shadow-card dark:bg-light-dark xs:p-6 xs:pt-5">
        {/* <nav className="mb-5 min-h-[40px] border-b border-dashed border-gray-200 pb-4 uppercase tracking-wider dark:border-gray-700 xs:mb-6 xs:pb-5 xs:tracking-wide"> */}
        <nav className="flex items-center justify-between mb-5 min-h-[40px] border-b border-dashed border-gray-200 pb-4 uppercase tracking-wider dark:border-gray-700 xs:mb-6 xs:pb-5 xs:tracking-wide">
          <div style={{ flex: '80%' }}>
            <RadioGroup
              value={currentActiveTab}
              onChange={setCurrentActiveTab}
              className="flex items-center justify-center sm:gap-3 w-full"
            >
              <RadioGroup.Option value="fundingAccount">
                {({ checked }) => (
                  <span
                    className={`relative flex h-11 px-3 cursor-pointer items-center justify-center rounded-lg text-center text-xs font-medium tracking-wider  sm:text-sm ${
                      checked ? 'text-white' : 'text-brand dark:text-white/50'
                    }`}
                  >
                    {checked && (
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
                        layoutId="statusIndicator"
                      />
                    )}
                    <span className="relative">Funding Account</span>
                  </span>
                )}
              </RadioGroup.Option>
              <RadioGroup.Option value="surveyAccount">
                {({ checked }) => (
                  <span
                    className={`relative flex h-11  px-3 cursor-pointer items-center justify-center rounded-lg text-center text-xs font-medium tracking-wider  sm:text-sm ${
                      checked ? 'text-white' : 'text-brand dark:text-white/50'
                    }`}
                  >
                    {checked && (
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
                        layoutId="statusIndicator"
                      />
                    )}
                    <span className="relative">Survey Account</span>
                  </span>
                )}
              </RadioGroup.Option>
            </RadioGroup>
          </div>
          <Button
            variant="transparent"
            shape="circle"
            size="small"
            className="dark:text-white"
            onClick={() => {
              const insidefn = async () => {
                var noncedata = [];
                const orgnonce = await getCurrentNonce(addressData.orgAddress);
                noncedata.push({
                  surveyId: null,
                  nonce: orgnonce,
                });
                for (var i = 0; i < addressData.surveyAccounts.length; i++) {
                  const surveyNonce = await getCurrentNonce(
                    addressData.surveyAccounts[i].surveyAccount,
                  );
                  noncedata.push({
                    surveyId: addressData.surveyAccounts[i].surveyId,
                    nonce: surveyNonce,
                  });
                }
                console.log(noncedata);
                openModal('WALLET_SETTINGS', {
                  noncesInfo: noncedata,
                });
              };
              insidefn();
            }}
          >
            <RangeIcon />
          </Button>
        </nav>
        <AnimatePresence mode={'wait'}>
          <motion.div
            initial="exit"
            animate="enter"
            exit="exit"
            variants={fadeInBottom('easeIn', 0.25)}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
