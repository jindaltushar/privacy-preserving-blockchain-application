import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrencySwapIcons from '@/components/ui/currency-swap-icons';
import { CoinList } from '@/components/ui/currency-swap-icons';
import TransactionInfo from '@/components/ui/transaction-info';
import { SurveyStatus } from '@/app/shared/types';
interface SurveyListTypes {
  index: number;
  title: string;
  isPrivate: boolean;
  status: SurveyStatus;
  validUntil: number;
  targetAudienceSize: number;
  targetAudienceReached: number;
}

export default function SurveyList({
  index,
  title,
  isPrivate,
  status,
  validUntil,
  targetAudienceSize,
  targetAudienceReached,
  children,
}: React.PropsWithChildren<SurveyListTypes>) {
  let [isExpand, setIsExpand] = useState(false);
  if (validUntil != 0) {
    var date = new Date(validUntil);
  } else {
    var date = new Date(0);
  }

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg bg-white shadow-card transition-all last:mb-0 hover:shadow-large dark:bg-light-dark">
      <div
        className="relative grid h-auto cursor-pointer grid-cols-2 items-center gap-3 py-4 sm:h-20 sm:grid-cols-3 sm:gap-6 sm:py-0 lg:grid-cols-5"
        onClick={() => setIsExpand(!isExpand)}
      >
        <div className="col-span-2 px-4 sm:col-auto sm:px-8 xl:px-4">
          #{index}
        </div>
        <div className="px-4 text-xs font-medium uppercase tracking-wider text-black dark:text-white sm:px-8 sm:text-sm">
          <span className="mb-1 block font-medium text-gray-600 dark:text-gray-400 sm:hidden">
            Title
          </span>
          {title}
        </div>
        <div className="px-4 text-xs font-medium uppercase tracking-wider text-black dark:text-white sm:px-8 sm:text-sm">
          <span className="mb-1 block font-medium text-gray-600 dark:text-gray-400 sm:hidden">
            AR
          </span>
          {targetAudienceReached}
          <span className="hidden font-normal text-gray-600 dark:text-gray-400 sm:block">
            / {targetAudienceSize}
          </span>
        </div>
        <div className="hidden px-4 text-xs font-medium uppercase tracking-wider text-black dark:text-white sm:px-8 sm:text-sm lg:block">
          {isPrivate ? 'Private' : 'Public'}
        </div>
        <div className="hidden px-4 text-xs font-medium uppercase tracking-wider text-black dark:text-white sm:px-8 sm:text-sm lg:block">
          {status == 0 && 'ACTIVE'}
          {status == 1 && 'PAUSED'}
          {status == 2 && 'EXPIRED'}
          {status == 3 && 'CLOSED'}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isExpand && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div className="border-t border-dashed border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-8 sm:py-6">
              <div className="mb-6 flex items-center justify-center rounded-lg bg-gray-100 p-3 text-center text-xs font-medium uppercase tracking-wider text-gray-900 dark:bg-gray-900 dark:text-white sm:h-13 sm:text-sm">
                Valid Till :{' '}
                {date.toString() === new Date(0).toString()
                  ? 'Survey has no time based expiry'
                  : date.toDateString()}
              </div>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
