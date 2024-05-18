'use client';

import { Suspense, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import routes from '@/config/routes';
import Button from '@/components/ui/button';
import Image from '@/components/ui/image';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import SurveyList from '@/components/surveyRespondant/survey-list';
import { ExportIcon } from '@/components/icons/export-icon';
// static data
import { getVotesByStatus } from '@/data/static/vote-data';
import votePool from '@/assets/images/vote-pool.svg';
import Loader from '@/components/ui/loader';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import {
  SurveyStatusAndPrivacyInfo,
  SurveyStatus,
  SurveyInfoStruct,
} from '@/app/shared/types';
import { toast } from 'sonner';
const SurveyRespondantView = () => {
  const router = useRouter();
  const {
    getSurveysActiveStatus,
    getMyPrivateInvitations,
    getMyAnsweredSurveys,
    getSurveyBasicInfo,
  } = useContext(SurveyContractContext);
  const [allSurveyIds, setAllSurveyIds] = useState<
    SurveyStatusAndPrivacyInfo[]
  >([]);
  const [filteredSurveyIds, setFilteredSurveyIds] = useState<number[]>([]);
  const [myInvitations, setMyInvitations] = useState<number[]>([]);
  const [myAnsweredSurveys, setMyAnsweredSurveys] = useState<number[]>([]);
  const [surveysAll, setSurveysAll] = useState<
    { surveyId: number; info: SurveyInfoStruct }[]
  >([]);
  const [surveysInvited, setSurveysInvited] = useState<
    { surveyId: number; info: SurveyInfoStruct }[]
  >([]);
  const [surveysAnswered, setSurveysAnswered] = useState<
    { surveyId: number; info: SurveyInfoStruct }[]
  >([]);
  const PAGESIZE = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [surveyInfoMemory, setSurveyInfoMemory] = useState({});

  useEffect(() => {
    // get ids of surveys needed to be shown based on pagesize and current page form filteredSurveyIds
    var startIndex = (currentPage - 1) * PAGESIZE;
    var endIndex = startIndex + PAGESIZE;
    // check if endIndex is greater than filteredSurveyIds.length then set endIndex to filteredSurveyIds.length
    if (endIndex > filteredSurveyIds.length) {
      endIndex = filteredSurveyIds.length;
    }
    var surveyIds = filteredSurveyIds.slice(startIndex, endIndex);
    // set surveyAll to surveys whose surveyId is in surveyIds and is avialble in surveyInfoMemory
    var surveysAll = surveyIds.filter((surveyId) => surveyInfoMemory[surveyId]);
    console.log('surveysAll', surveysAll);
    console.log('length of surveysAll', surveysAll.length);
    var toshow1 = surveysAll.map((surveyId) => {
      return { surveyId: surveyId, info: surveyInfoMemory[surveyId] };
    });
    setSurveysAll(toshow1);
    // set surveyInvited to surveys whose surveyId is in myInvitations and is avialble in surveyInfoMemory
    var surveysInvited = myInvitations.filter(
      (surveyId) => surveyInfoMemory[surveyId],
    );
    var toshow2 = surveysInvited.map((surveyId) => {
      return { surveyId: surveyId, info: surveyInfoMemory[surveyId] };
    });
    setSurveysInvited(toshow2);
    // set surveyAnswered to surveys whose surveyId is in myAnsweredSurveys and is avialble in surveyInfoMemory
    var surveysAnswered = myAnsweredSurveys.filter(
      (surveyId) => surveyInfoMemory[surveyId],
    );
    var toshow3 = surveysAnswered.map((surveyId) => {
      return { surveyId: surveyId, info: surveyInfoMemory[surveyId] };
    });
    setSurveysAnswered(toshow3);
  }, [surveyInfoMemory, currentPage]);

  const fetchSurveyInfoForIds = async (
    surveyIds: number[],
    getAnsTime: boolean,
  ) => {
    // fetch info of all those surveys whose data does not exist in surveyInfoMemory
    var surveyIdsToFetch = surveyIds.filter(
      (surveyId) => !surveyInfoMemory[surveyId],
    );

    if (surveyIdsToFetch.length > 0) {
      toast.loading('Fetching Survey Info');

      const surveyInfoPromises = surveyIdsToFetch.map(async (surveyId) => {
        return await getSurveyBasicInfo(surveyId, getAnsTime);
      });

      const surveyInfoResults = await Promise.all(surveyInfoPromises);

      // Create an object to store all fetched survey info
      const updatedSurveyInfoMemory = {};

      surveyIdsToFetch.forEach((surveyId, index) => {
        // Check if survey info exists and add it to the updated object
        if (surveyInfoResults[index]) {
          updatedSurveyInfoMemory[surveyId] = surveyInfoResults[index];
        }
      });

      // Update the surveyInfoMemory state with all collected survey info
      setSurveyInfoMemory((prevMemory) => ({
        ...prevMemory,
        ...updatedSurveyInfoMemory,
      }));

      toast.dismiss();
    }
  };

  useEffect(() => {
    const asyncfunction = async () => {
      setMyAnsweredSurveys(await getMyAnsweredSurveys());
      setMyInvitations(await getMyPrivateInvitations());
      setAllSurveyIds(await getSurveysActiveStatus());
    };
    asyncfunction();
  }, []);

  useEffect(() => {
    if (allSurveyIds.length > 0) {
      console.log('allSurveyIds', allSurveyIds);
      var filteredSurveyIds = allSurveyIds.filter(
        (survey) => survey.surveyStatus === SurveyStatus.ACTIVE,
      );
      console.log('myInvitations', myInvitations);
      // filter surveysids where survey.surveyId is not in myInvitations
      filteredSurveyIds = filteredSurveyIds.filter(
        (survey) => !myInvitations.includes(survey.surveyId),
      );
      // filter surveysids where survey.surveyId is not in myAnsweredSurveys
      filteredSurveyIds = filteredSurveyIds.filter(
        (survey) => !myAnsweredSurveys.includes(survey.surveyId),
      );
      // get PAGESIZE number of surveyIds from filteredSurveyIds from last based on currentPage starting from 1
      var startIndex = (currentPage - 1) * PAGESIZE;
      var endIndex = startIndex + PAGESIZE;
      // check if endIndex is greater than filteredSurveyIds.length then set endIndex to filteredSurveyIds.length
      if (endIndex > filteredSurveyIds.length) {
        endIndex = filteredSurveyIds.length;
      }
      var surveyIds = filteredSurveyIds.slice(startIndex, endIndex);
      // make an array of surveyIds to fetch
      var surveyIdsToFetch = surveyIds.map((survey) => survey.surveyId);
      setFilteredSurveyIds(surveyIdsToFetch);
      console.log('filteredSurveyIds', filteredSurveyIds);
      fetchSurveyInfoForIds(surveyIdsToFetch, false);
    }
    if (myInvitations.length > 0) {
      fetchSurveyInfoForIds(myInvitations, false);
    }
    if (myAnsweredSurveys.length > 0) {
      fetchSurveyInfoForIds(myAnsweredSurveys, true);
    }
  }, [allSurveyIds, myInvitations, myAnsweredSurveys]);

  const tabMenuItems = [
    {
      title: <>All</>,
      path: 'all',
    },
    {
      title: (
        <>
          Invited{' '}
          {myInvitations && myInvitations.length > 0 && (
            <span className="ltr:ml-0.5 rtl:mr-0.5 ltr:md:ml-1.5 rtl:md:mr-1.5 ltr:lg:ml-2 rtl:lg:mr-2">
              ({myInvitations.length})
            </span>
          )}
        </>
      ),
      path: 'invited',
    },
    {
      title: (
        <>
          Responded{' '}
          {myAnsweredSurveys && myAnsweredSurveys.length > 0 && (
            <span className="ltr:ml-0.5 rtl:mr-0.5 ltr:md:ml-1.5 rtl:md:mr-1.5 ltr:lg:ml-2 rtl:lg:mr-2">
              ({myAnsweredSurveys.length})
            </span>
          )}
        </>
      ),
      path: 'responded',
    },
  ];
  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm ">

      <Suspense fallback={<Loader variant="blink" />}>
        <ParamTab tabMenu={tabMenuItems}>
          <TabPanel className="focus:outline-none">
            <SurveyList surveyList={surveysAll} type={'all'} />
          </TabPanel>
          <TabPanel className="focus:outline-none">
            <>
              <div className="mb-6 rounded-lg border-2 border-gray-900 bg-white p-5 dark:border-gray-700 dark:bg-light-dark xs:py-6 lg:px-6 lg:py-6">
                <div className="mb-3 flex flex-col gap-3 xs:mb-4 sm:gap-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="flex items-center gap-4 text-base font-semibold dark:text-gray-100">
                    <span className="inline-block rounded-3xl bg-gray-900 px-2.5 py-0.5 text-sm font-medium text-white">
                      Tip
                    </span>{' '}
                    If you don't see the survey, kindly refresh.
                  </h3>
                </div>
              </div>
              <SurveyList surveyList={surveysInvited} type={'invited'} />
            </>
          </TabPanel>
          <TabPanel className="focus:outline-none">
            <SurveyList surveyList={surveysAnswered} type={'answered'} />
          </TabPanel>
        </ParamTab>
      </Suspense>
    </section>
  );
};

export default SurveyRespondantView;
