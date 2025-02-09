import { useState } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import Image from '@/components/ui/image';
import Button from '@/components/ui/button/button';
import { useModal } from '@/components/modal-views/context';
import { Close } from '@/components/icons/close';
import Text from '@/components/ui/text';
import userprivacyLight from '@/assets/images/userprivacy.png';
import userprivacyDark from '@/assets/images/privacydark.png';
const stepperContent = [
  {
    id: 1,
    title: 'Your data is Private & Decentralised',
    content:
      'The application is built on a decentralized network, hence no organisation or entity controls your data. And your data is end-to-end encrypted and only you have access to it. No one else can access your data without your explicit permission.',
  },
  {
    id: 2,
    title: 'Compensation',
    content:
      'The application rewards you according to the sensitivity score. The sensitivity score ranges from 0 to 5 and reflects the level of privacy of question.Ensure that the question asked aligns with the sensitivity score designated by the organizer. The greater the sensitivity score, the greater the rewards.',
  },
  {
    id: 3,
    title: 'Anonymity',
    content:
      'Researchers do not receive any other data about you except the data you will provide in the survey. Your identity is kept anonymous.',
  },
  {
    id: 4,
    title: 'Revokeable Access',
    content:
      'You have the option to withdraw access to your data at any time, provided you return the compensation received for your responses.',
  },
  {
    id: 5,
    title: 'Carefully read the Instructions',
    content:
      'Prior to responding, carefully review all survey information, instructions, and privacy policies. If you have inquiries, reach out to the survey creator. Only proceed with responding if you feel comfortable with the instructions and questions.',
  },
];

function Stepper({
  currentTab,
  className,
}: {
  currentTab: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {stepperContent.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <div key={item.id} className="text-start">
            <Text
              tag="h5"
              className={cn(
                'mb-4 text-base font-medium text-gray-500',
                isActive && '!text-brand dark:!text-gray-100',
              )}
            >{`${item.id}. ${item.title}`}</Text>

            {isActive && (
              <AnimatePresence>
                <motion.div
                  layout
                  initial="exit"
                  animate="enter"
                  exit="exit"
                  variants={fadeInBottom('easeIn', 0.25, 16)}
                >
                  <Text className="ps-8 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {item.content}
                  </Text>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DCAStepper() {
  const { closeModal } = useModal();
  const [current, setCurrent] = useState(1);

  const totalTabCount = stepperContent.length;
  const handledNextTabChange = () => {
    current < totalTabCount && setCurrent((prev) => prev + 1);
  };
  const handledPrevTabChange = () => {
    current > 1 && setCurrent((prev) => prev - 1);
  };

  return (
    <div className="w-full md:w-[680px]">
      <div className="relative flex flex-grow flex-col overflow-hidden rounded-lg bg-white p-4 shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-dashed pb-6 text-lg font-medium capitalize -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:border-gray-700 dark:text-white lg:text-xl">
          Before You Respond
          <Button
            title="Close"
            color="white"
            shape="circle"
            variant="transparent"
            size="small"
            onClick={() => closeModal()}
          >
            <Close className="h-auto w-2.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 items-start gap-9 sm:grid-cols-2 sm:items-center">
          <Stepper currentTab={current} className="order-2 sm:order-1" />
          <div className="order-1 mx-auto w-full sm:order-2">
            <Image
              className="w-full dark:hidden"
              src={userprivacyLight}
              alt="DCA Chart"
              sizes="100vw"
            />
            <Image
              className="hidden dark:block"
              src={userprivacyDark}
              alt="DCA Chart"
            />
          </div>
        </div>
        <div className="mt-13 flex items-end justify-between">
          <Link
            href="https://docs.orcp.app/application-guide/for-respondants"
            target="_blank"
            className="text-sm leading-6 text-gray-500 hover:text-brand dark:text-gray-300"
          >
            Help Center
          </Link>
          <div className="flex gap-3">
            <Button
              shape="rounded"
              onClick={() => handledPrevTabChange()}
              className={cn(
                'disabled:text-gray-500 dark:disabled:bg-brand',
                current === 1 && 'hidden',
              )}
            >
              Previous
            </Button>
            <Button
              shape="rounded"
              onClick={() => handledNextTabChange()}
              disabled={totalTabCount === current}
              className="disabled:text-gray-500 dark:disabled:bg-brand"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
