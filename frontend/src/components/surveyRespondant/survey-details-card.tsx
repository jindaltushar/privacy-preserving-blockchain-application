'use client';

import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import cn from 'classnames';
import ActiveLink from '../ui/links/active-link';
import Button from '@/components/ui/button';
import RevealContent from '@/components/ui/reveal-content';
import AuctionCountdown from '@/components/nft/auction-countdown';
import { Switch } from '@/components/ui/switch';
import { ExportIcon } from '@/components/icons/export-icon';
import VotePoll from '@/components/vote/vote-details/vote-poll';
import VoteActions from '@/components/vote/vote-details/vote-actions';
import VoterTable from '@/components/vote/vote-details/voter-table';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import {
  SurveyInfoStruct,
  viewMySurveyResponseStruct,
} from '@/app/shared/types';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';

// FIXME: need to add vote type
export default function SurveyDetailsCard({
  survey,
  type,
  surveyID,
}: {
  survey: SurveyInfoStruct;
  type: string;
  surveyID: number;
}) {
  const [isExpand, setIsExpand] = useState(false);
  const { viewMySurveyResponse, revokeAccess } = useContext(
    SurveyContractContext,
  );
  const [surveyResponse, setSurveyResponse] = useState(null);
  useEffect(() => {
    const asynfunction = async () => {
      const response = await viewMySurveyResponse(surveyID);
      setSurveyResponse(response);
    };
    if (type == 'answered') {
      try {
        asynfunction();
      } catch (e) {
        console.log(e);
      }
    }
  }, []);
  return (
    <motion.div
      layout
      initial={{ borderRadius: 8 }}
      className={cn(
        'mb-3 rounded-lg bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6 xl:p-4',
        isExpand ? 'shadow-large' : 'shadow-card hover:shadow-large',
      )}
    >
      <motion.div
        layout
        className={cn(
          'flex w-full flex-col-reverse justify-between md:grid md:grid-cols-3',
        )}
      >
        <div className="self-start md:col-span-2">
          <h3
            onClick={() => setIsExpand(!isExpand)}
            className="cursor-pointer text-base font-medium leading-normal dark:text-gray-100 2xl:text-lg"
          >
            {survey.surveyTitle}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Created By #{survey.createdBy}
          </p>

          {/* show only when vote is active */}
          {type !== 'answered' && (
            <>
              <ActiveLink href={`/survey/respond/${surveyID}`}>
                <Button
                  onClick={() => {}}
                  className="mt-4 w-full xs:mt-6 xs:w-auto md:mt-10"
                  shape="rounded"
                >
                  Respond Now
                </Button>
              </ActiveLink>
            </>
          )}

          {/* show only for answered survey */}
          {type === 'answered' && (
            <time className="mt-4 block text-gray-400 xs:mt-6 md:mt-7">
              <span className="font-medium">Answered</span> at{' '}
              {dayjs(survey.answeredAt * 1000).format('MMM DD, YYYY')}
            </time>
          )}
        </div>

        {/* vote countdown timer only for active & off-chain vote */}
        {type !== 'answered' && survey.validTill != 0 && (
          <div
            className={cn(
              "before:content-[' '] relative grid h-full gap-2 before:absolute before:bottom-0 before:border-b before:border-r before:border-dashed before:border-gray-200 ltr:before:left-0 rtl:before:right-0 dark:border-gray-700 dark:before:border-gray-700 xs:gap-2.5 ",
              'mb-5 pb-5 before:h-[1px] before:w-full md:mb-0 md:pb-0 md:before:h-full md:before:w-[1px] ltr:md:pl-5 rtl:md:pr-5 ltr:xl:pl-3 rtl:xl:pr-3',
            )}
          >
            <h3 className="text-gray-400 md:text-base md:font-medium md:uppercase md:text-gray-900 dark:md:text-gray-100 2xl:text-lg ">
              Survey ends in
            </h3>
            <AuctionCountdown date={new Date(survey.validTill)} />
          </div>
        )}

        {/* switch toggle indicator for answered vote */}
        {type === 'answered' && (
          <div className="mb-4 flex items-center gap-3 md:mb-0 md:items-start md:justify-end">
            <Switch
              checked={isExpand}
              onChange={setIsExpand}
              className="flex items-center gap-3 text-gray-400"
            >
              <span className="inline-flex text-xs font-medium uppercase sm:text-sm">
                Close
              </span>
              <div
                className={cn(
                  isExpand
                    ? 'bg-brand dark:bg-white'
                    : 'bg-gray-200 dark:bg-gray-700',
                  'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300',
                )}
              >
                <span
                  className={cn(
                    isExpand
                      ? 'bg-white ltr:translate-x-5 rtl:-translate-x-5 dark:bg-gray-700'
                      : 'bg-white ltr:translate-x-0.5 rtl:-translate-x-0.5 dark:bg-gray-200',
                    'inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-200',
                  )}
                />
              </div>
              <span className="inline-flex text-xs font-medium uppercase sm:text-sm">
                View
              </span>
            </Switch>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {isExpand && surveyResponse && (
          <motion.div
            layout
            initial="exit"
            animate="enter"
            exit="exit"
            variants={fadeInBottom('easeIn', 0.25, 16)}
          >
            <RevealContent defaultHeight={250}>
              <div className="pt-3">
                {surveyResponse.map(
                  (survey: viewMySurveyResponseStruct, index: number) => (
                    <div key={index} className="p-2 border-grey rounded">
                      {' '}
                      {/* Add a key prop */}
                      <h4 className="inline-block mb-0 uppercase dark:text-gray-100">
                        {survey.questionText}
                      </h4>
                      <h5 className="inline-block mb-0 bg-gray-300 rounded-full px-3 ml-3  py-1 text-xs text-gray-800">
                        {survey.answerTypeText}
                      </h5>
                      <h5 className="inline-block mb-0 bg-gray-300 rounded-full px-3 py-1 ml-3 text-xs text-gray-800">
                        Sensitivity Score: {survey.PrivacyLevel}
                      </h5>
                      <div className="inline-block dynamic-html grid gap-2 leading-relaxed text-gray-600 dark:text-gray-400">
                        {survey.answerText.length == 0
                          ? 'No answer provided'
                          : survey.answerText}
                      </div>
                    </div>
                  ),
                )}
                <Button
                  onClick={() => {
                    revokeAccess(surveyID);
                  }}
                  color="danger"
                  className="mt-4 w-full xs:mt-6 xs:w-auto md:mt-10"
                  shape="rounded"
                >
                  Revoke Access to Organisation
                </Button>
              </div>
            </RevealContent>
            {/* <div className="mt-6 flex items-center justify-center border-t border-dashed border-gray-200 pt-6 dark:border-gray-700">
              <Button
                shape="rounded"
                fullWidth={true}
                className={'sm:w-4/6 md:w-3/6 xl:w-2/6'}
              >
                Add POOL token to MetaMask
              </Button>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
