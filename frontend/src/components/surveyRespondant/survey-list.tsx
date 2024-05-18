import { motion, LayoutGroup } from 'framer-motion';
import SurveyDetailsCard from '@/components/surveyRespondant/survey-details-card';
import { ExportIcon } from '@/components/icons/export-icon';
// static data
import { getVotesByStatus } from '@/data/static/vote-data';
import { SurveyInfoStruct } from '@/app/shared/types';
import { generateRandomString } from '@/app/shared/utils';

export default function SurveyList({
  surveyList,
  type,
}: {
  surveyList: {
    surveyId: number;
    info: SurveyInfoStruct;
  }[];
  type: string;
}) {
  return (
    <LayoutGroup>
      <motion.div layout initial={{ borderRadius: 16 }} className="rounded-2xl">
        {surveyList.length > 0 ? (
          surveyList.map(
            (survey: { surveyId: number; info: SurveyInfoStruct }) => (
              <SurveyDetailsCard
                key={survey.surveyId + '_' + generateRandomString(20)}
                survey={survey.info}
                type={type}
                surveyID={survey.surveyId}
              />
            ),
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white px-4 py-16 text-center shadow-card dark:bg-light-dark xs:px-6 md:px-5 md:py-24">
            <div className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-card md:h-24 md:w-24">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-auto w-8 md:w-10"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  d="M1,13 L6,2 L18,2 L23,13 L23,22 L1,22 L1,13 Z M1,13 L8,13 L8,16 L16,16 L16,13 L23,13"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
              There are no surveys at the moment
            </h2>
          </div>
        )}
      </motion.div>
    </LayoutGroup>
  );
}
