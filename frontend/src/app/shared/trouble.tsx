'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import routes from '@/config/routes';
import Image from '@/components/ui/image';
import cn from 'classnames';
// static data
import discord from '@/assets/images/discord.svg';
import bank from '@/assets/images/bank.svg';

const TroublePage = () => {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-[1160px] text-sm md:pt-14 4xl:pt-24">
      <motion.div
        className={cn(
          'w-full mb-4 cursor-pointer items-center justify-center rounded-lg bg-white p-6 text-center shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark ',
        )}
      >
        <h3 className="mb-2 mt-6  w-full text-sm font-medium uppercase text-gray-800 dark:text-gray-100 sm:text-base 3xl:text-lg">
          Having Trouble?
        </h3>
      </motion.div>
      <div
        className={cn('grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-2')}
      >
        <motion.a
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.015 }}
          target="_blank"
          rel="noopener noreferrer"
          href="https://discord.gg/ZYGVFrv5ZM"
          className={cn(
            'rounded-lg bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark',
          )}
        >
          <span className="inline-block h-auto w-12 sm:w-auto">
            <Image alt="Discord" src={discord} width={48} />
          </span>
          <h3 className="mt-6 text-sm font-medium uppercase text-purple-600 sm:mt-8 sm:text-base 3xl:mt-11 3xl:text-lg">
            Chat on Discord
          </h3>
        </motion.a>
        <motion.a
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.015 }}
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.orcp.app/"
          className={cn(
            'cursor-pointer rounded-lg bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark',
          )}
        >
          <div className="h-auto w-12 sm:w-auto">
            <Image alt="Bank" src={bank} />
          </div>
          <h3 className="mt-6 text-sm font-medium uppercase text-blue-500 sm:mt-8 sm:text-base 3xl:mt-11 3xl:text-lg">
            View Documentation
          </h3>
        </motion.a>
      </div>
    </div>
  );
};

export default TroublePage;
