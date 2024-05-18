'use client';

import React, { useEffect, useState, useContext } from 'react';
import { Star } from '@/components/icons/star';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import QuestionsListDrawerTable from '@/components/survey/questionsListDrawerTable';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import RangeIcon from '@/assets/images/range.png';
import { statusObject } from '@/components/trading-bot/invest-form';
import CheckBoxIcon from '@/assets/images/checkbox.png';
import Button from '@/components/ui/button';
import { toast } from 'sonner';
import TextBoxIcon from '@/assets/images/text.png';
import RadioIcon from '@/assets/images/radio.png';
import { BigNumber } from 'ethers';
import { readIPFS } from '@/app/shared/ipfs';
import {
  QuestionType,
  QuestionObjectForRewardCalculation,
  AnswerType,
  QuestionsTableData,
} from '@/app/shared/types';
import { LiquidityChartSurvey } from '../ui/chats/liquidity-chart';
import Image from 'next/image';
import SurveyInfoTopBar from '@/components/trading-bot/coin-bar';
import CoinList from '@/components/trading-bot/coin-list';
import SurveyInfoDIV from '@/components/trading-bot/invest-form';
import { reverseFormattedOptionObject } from '@/app/shared/utils';
import { GetSurveyAnswerStats } from '@/app/shared/central-server';
import { useRef } from 'react';
import { useClickAway } from '@/lib/hooks/use-click-away';
import { SearchIcon } from '@/components/icons/search';
import { Plus } from '@/components/icons/plus';
import InputLabel from '@/components/ui/input-label';
import Input from '@/components/ui/forms/input';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceOracleContext } from '@/contracts-context/PriceOracleContractContext';
import { id } from 'date-fns/locale';

const TruncatedCell = ({ value, maxWidth }) => {
  // Check if the length of the value exceeds maxWidth
  if (value.length > maxWidth) {
    // If yes, truncate the string and append "..."
    value = value.slice(0, maxWidth - 3) + '...';
  }

  return <div className="ltr:text-left rtl:text-left">{value}</div>;
};

const COLUMNS = [
  {
    Header: () => <div className="px-1"></div>,
    accessor: 'questionIdSecond',
    Cell: ({ cell: { value } }) => (
      <div className="">
        <Star />
      </div>
    ),
    minWidth: 40,
    maxWidth: 20,
  },
  {
    Header: '#',
    accessor: 'questionIndex',
    // @ts-ignore
    Cell: ({ cell: { value } }) => <div>{value}</div>,
    minWidth: 40,
    maxWidth: 20,
  },
  {
    Header: () => <div className="">Question Type</div>,
    accessor: 'qType',
    // @ts-ignore
    Cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image src={row.original.qTypeImage} alt="" width="24" height="24" />
        <div className="ltr:text-left rtl:text-left">
          {row.original.qTypeName}
        </div>
      </div>
    ),
    minWidth: 20,
    MaxWidth: 30,
  },
  {
    Header: () => <div className="">Question</div>,
    accessor: 'questionString',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <TruncatedCell value={value} maxWidth={60} />
    ),
    minWidth: 360,
    maxWidth: 580,
  },
  {
    Header: () => <div className="">Question ID</div>,
    accessor: 'questionId',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-left rtl:text-left">{value}</div>
    ),
    minWidth: 80,
    maxWidth: 100,
  },
];

export default function SurveyMasterView({ surveyId }: { surveyId: string }) {
  //   const data = React.useMemo(() => CoinPriceData, []);
  const [quesdata, setquesData] = useState<QuestionsTableData[]>([]);
  const [surveyData, setSurveyData] = useState<any>({});
  const [audienceFilterData, setAudienceFilterData] = useState<any>([]);
  const [addressToAdd, setAddressToAdd] = useState<string>('');
  const columns = React.useMemo(() => COLUMNS, []);
  const { getOrganisationViewofSurvey, editSurvey, decodeString } = useContext(
    SurveyContractContext,
  );
  const [showModal, setShowModal] = useState(false);
  const [oldAddressList, setOldAddressList] = useState([]);
  const [newAddressList, setNewAddressList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [surveyStausOld, setSurveyStatusOld] = useState({
    name: 'ACTIVE',
    value: 0,
  });
  const [surveyStatusNew, setSurveyStatusNew] = useState({
    name: 'ACTIVE',
    value: 0,
  });
  const [targetAudienceOld, setTargetAudienceOld] = useState(0);
  const [targetAudienceNew, setTargetAudienceNew] = useState(0);
  const [costToAnsSurvey, setCostToAnsSurvey] = useState<number>(null);
  const [validUntilOld, setValidUntilOld] = useState<{
    startDate: any;
    endDate: any;
  }>({} as { startDate: any; endDate: any });
  const [validUntilNew, setValidUntilNew] = useState<{
    startDate: any;
    endDate: any;
  }>({} as { startDate: any; endDate: any });

  const { getRewardsToAnswerSurvey } = useContext(PriceOracleContext);

  useEffect(() => {
    setFilteredList(newAddressList);
  }, [newAddressList]);

  const setSearchKeywordFilter = (keyword: string) => {
    // setSearchKeyword(keyword);
    const filteredList = newAddressList.filter((item) =>
      item.toLowerCase().includes(keyword.toLowerCase()),
    );
    setFilteredList(filteredList);
  };

  const [surveyAnswerTimeSeries, setSurveyAnswerTimeSeries] = useState({
    responsesLastDay: 0,
    responsesLastWeek: 0,
    bins: null,
  });
  const modalContainerRef = useRef<HTMLDivElement>(null);
  useClickAway(modalContainerRef, () => {
    setShowModal(false);
    setShowSaveModal(false);
  });

  useEffect(() => {
    const insidefn = async () => {
      var res;
      try {
        res = await getOrganisationViewofSurvey(Number(surveyId));
      } catch (e) {
        console.log('error in getting survey data', e);
        return;
      }
      console.log(res);
      const isSurveyPrivate = res.surveyData.isSurveyPrivate;
      const surveyNonce = res.surveyData.surveyNonce;
      var questions = new Array<QuestionsTableData>();
      for (let i = 0; i < res.questionsData.length; i++) {
        const qview = res.questionsData[i];
        var questionString = await readIPFS(qview.questionIPFSHash);
        if (isSurveyPrivate) {
          questionString = await decodeString(
            questionString.questionString,
            surveyNonce,
          );
        } else {
          questionString = questionString.questionString;
        }
        console.log('q types i', qview.qType);
        var questionImage, qTypeName;
        switch (qview.qType) {
          case QuestionType.RANGE:
            questionImage = RangeIcon;
            qTypeName = 'Range';
            break;
          case QuestionType.CHECKBOXES:
            questionImage = CheckBoxIcon;
            qTypeName = 'CheckBox';
            break;
          case QuestionType.OPENTEXT:
            questionImage = TextBoxIcon;
            qTypeName = 'Open Text';
            break;
          case QuestionType.RADIOBUTTON:
            questionImage = RadioIcon;
            qTypeName = 'Radio';
            break;
          default:
            questionImage = RangeIcon; // Default to RangeIcon if qType is not recognized
            qTypeName = 'Range';
            break;
        }

        var questionOptionIndexesString = [];
        var promises = [];
        for (
          var j = 0;
          j < qview.selectedOptionsIndexOptionString.length;
          j++
        ) {
          var optionData = qview.selectedOptionsIndexOptionString[j];
          var option = optionData.option;
          var optionIPFSHash = optionData.optionIPFSHash;

          // Push the promise for processing each option into the promises array
          promises.push(
            (async (option, optionIPFSHash, j) => {
              var optionString = await reverseFormattedOptionObject({
                option: option,
                optionIPFSHash: optionIPFSHash,
              });
              return { locationIndex: j, optionString: optionString };
            })(option, optionIPFSHash, j),
          );
        }
        Promise.all(promises)
          .then((results) => {
            // Once all promises are resolved, do something with the results
            results.forEach((result) => {
              questionOptionIndexesString.push(result);
            });
          })
          .catch((error) => {
            // Handle errors if any promise fails
            console.error('Error processing options:', error);
          });
        questions.push({
          questionIndex: i + 1,
          qTypeImage: questionImage,
          qTypeName: qTypeName,
          questionString: questionString,
          questionId: Number(qview.questionId),
          questionIdSecond: Number(qview.questionId),
          answerTypeAllowed: qview.answerTypeAllowed,
          isMandatory: qview.isMandatory,
          privacyLevelRating: qview.privacyLevelRating,
          questionOptionIndexesString: questionOptionIndexesString,
        });
      }
      setquesData(questions);
      try {
        const timeseriesdata = await GetSurveyAnswerStats(
          res.surveyIDencrypted,
        );
        console.log('timeseriesdata', timeseriesdata);
        setSurveyAnswerTimeSeries(timeseriesdata);
      } catch (e) {
        console.log('error in getting timeseries', e);
      }
      var surveyObj = {};
      surveyObj['title'] = await reverseFormattedOptionObject({
        option: res.surveyData.surveyTitle,
        optionIPFSHash: res.surveyData.surveyTitleIPFS,
      });
      surveyObj['createdBy'] = Number(res.surveyData.createdBy);
      surveyObj['responsesSoFar'] = Number(
        res.surveyData.targetAudienceReached,
      );
      surveyObj['surveyId'] = Number(res.surveyData.surveyId);
      surveyObj['secretSurveyId'] = res.surveyIDencrypted;
      surveyObj['introduction'] = await readIPFS(
        res.surveyData.surveyIntroIPFS,
      );
      surveyObj['isSurveyPrivate'] = res.surveyData.isSurveyPrivate;
      console.log('survey date created', Number(res.surveyData.createdAt));
      surveyObj['createdAt'] = new Date(
        Number(res.surveyData.createdAt) * 1000,
      );
      console.log('res obj', res);
      surveyObj['surveyStatus'] = res.surveyData.surveyStatus;
      if (res.surveyData.surveyStatus) {
        const val = statusObject.filter(
          (status) => status.value === res.surveyData.surveyStatus,
        )[0];
        console.log('value is ', val);
        setSurveyStatusOld(val);
        setSurveyStatusNew(val);
      } else {
        setSurveyStatusOld({ name: 'ACTIVE', value: 0 });
        setSurveyStatusNew({ name: 'ACTIVE', value: 0 });
      }
      surveyObj['publishOnMarketplace'] = res.surveyData.publishOnMarketplace;
      surveyObj['targetAudience'] = Number(res.surveyData.targetAudienceSize);
      setTargetAudienceOld(Number(res.surveyData.targetAudienceSize));
      setTargetAudienceNew(Number(res.surveyData.targetAudienceSize));
      surveyObj['validUntil;'] = Number(res.surveyData.validUntil);
      setValidUntilOld({
        startDate: new Date(Number(res.surveyData.validUntil)),
        endDate: new Date(Number(res.surveyData.validUntil)),
      });
      setValidUntilNew({
        startDate: new Date(Number(res.surveyData.validUntil)),
        endDate: new Date(Number(res.surveyData.validUntil)),
      });
      setSurveyData(surveyObj);
      console.log('surveydata', surveyObj);

      // audienceFiltersData is list , create editable copy of it
      var audData = [];
      for (let i = 0; i < res.audienceFiltersData.length; i++) {
        var optionStrings = [];
        console.log(
          'res.prev_response_value_options_optionString',
          res.audienceFiltersData[i].prev_response_value_options_optionString,
        );

        for (
          let j = 0;
          j <
          res.audienceFiltersData[i].prev_response_value_options_optionString
            .length;
          j++
        ) {
          console.log('here innnnn ');
          const s = await reverseFormattedOptionObject({
            option:
              res.audienceFiltersData[i]
                .prev_response_value_options_optionString[j].option,
            optionIPFSHash: {
              digest:
                res.audienceFiltersData[i]
                  .prev_response_value_options_optionString[j].optionIPFSHash
                  .digest,
              hashFunction:
                res.audienceFiltersData[i]
                  .prev_response_value_options_optionString[j].optionIPFSHash
                  .hashFunction,
              size: res.audienceFiltersData[i]
                .prev_response_value_options_optionString[j].optionIPFSHash
                .size,
            },
          });
          console.log('fetched resp', s);
          optionStrings.push(s);
        }

        console.log('optionstring', optionStrings);
        if (res.audienceFiltersData[i].filter_type === 1) {
          var questionString = (
            await readIPFS(res.audienceFiltersData[i].questionIPFSHash)
          ).questionString;
        } else {
          questionString = '';
        }

        if (res.audienceFiltersData[i].filter_type === 0) {
          setNewAddressList([...res.audienceFiltersData[i].address_list]);
          setOldAddressList([...res.audienceFiltersData[i].address_list]);
          setFilteredList([...res.audienceFiltersData[i].address_list]);
        }

        var item = res.audienceFiltersData[i];
        var newItem = {
          filter_type: item.filter_type,
          address_list: [...item.address_list],
          prev_response_value_options_optionString: optionStrings,
          prev_response_value_questionId: Number(
            item.prev_response_value_questionId,
          ),
          questionIPFSHash: questionString,
          survey_answered_id: Number(item.survey_answered_id),
          token_reserve_contractAddress: item.token_reserve_contractAddress,
          token_reserve_minAmount: Number(item.token_reserve_minAmount),
          token_reserve_selectedChain: item.token_reserve_selectedChain,
          token_reserve_selectedToken: item.token_reserve_selectedToken,
        };
        audData.push(newItem);
      }

      setAudienceFilterData(audData);
    };
    insidefn();
  }, []);

  useEffect(() => {
    if (quesdata) {
      const insidefn = async () => {
        var query: QuestionObjectForRewardCalculation[] = [];
        for (let i = 0; i < quesdata.length; i++) {
          var qtypeAllowed: AnswerType = AnswerType.PRIVATE;
          if (quesdata[i].answerTypeAllowed[2]) {
            qtypeAllowed = AnswerType.PRIVATE;
          } else if (quesdata[i].answerTypeAllowed[0]) {
            qtypeAllowed = AnswerType.PUBLIC;
          } else {
            qtypeAllowed = AnswerType.ANALYSIS;
          }
          query.push({
            qType: qtypeAllowed,
            privacyLevel: quesdata[i].privacyLevelRating,
          });
        }
        const resp = await getRewardsToAnswerSurvey(query);
        const additionalcharges =
          500000 * quesdata.length + 800000 + Number(resp);
        setCostToAnsSurvey(additionalcharges);
      };
      insidefn();
    }
  }, [quesdata]);

  const isMounted = useIsMounted();

  const handleSubmitChanges = () => {
    const addressToAdd = newAddressList.filter(
      (address) => !oldAddressList.includes(address),
    );
    const insidefn = async () => {
      if (surveyStatusNew.value === 2) {
        toast.error('Survey Status cannot be changed to EXPIRED', {
          id: 'changeSurveySettings',
        });
        return;
      }
      if (surveyStausOld.value === 2 || surveyStausOld.value === 3) {
        toast.error(
          'Survey Status cannot be changed for EXPIRED or CLOSED Surveys',
          {
            id: 'changeSurveySettings',
          },
        );
        return;
      }
      //check if survey valid until date is less than current date
      //check if validUntilNew.startDate is instance of date
      var datetocheck;
      if (!(validUntilNew.startDate instanceof Date)) {
        datetocheck = new Date(validUntilNew.startDate);
      } else {
        datetocheck = validUntilNew.startDate;
      }
      if (datetocheck < new Date()) {
        toast.error('Valid Until Date cannot be less than current date', {
          id: 'changeSurveySettings',
        });
        return;
      }
      toast.loading('Changing Survey Settings ...', {
        id: 'changeSurveySettings',
      });
      //check if target audience is less than or equal to people who have already responded
      if (targetAudienceNew < surveyData.responsesSoFar) {
        toast.error(
          'Target Audience cannot be less than number of responses so far',
          {
            id: 'changeSurveySettings',
          },
        );
        return;
      }
      //comnvert validUntilNew.startDate to blocktimestamp
      // validUntilNew.startDate = Math.floor(
      //   validUntilNew.startDate.getTime() / 1000,
      // );
      console.log(
        'request is:',
        surveyData.surveyId,
        surveyStatusNew.value,
        addressToAdd,
        targetAudienceNew,
        new Date(validUntilNew.startDate).getTime(),
      );
      const res = await editSurvey(
        surveyData.surveyId,
        surveyStatusNew.value,
        addressToAdd,
        targetAudienceNew,
        new Date(validUntilNew.startDate).getTime(),
      );
      if (res) {
        toast.success('Survey Settings Changed', {
          id: 'changeSurveySettings',
        });
        // reload the page
        window.location.reload();
      } else {
        toast.error('Error Changing Survey Settings', {
          id: 'changeSurveySettings',
        });
      }
    };
    insidefn();
  };

  return (
    <>
      {isMounted && quesdata && surveyData && (
        <>
          <SurveyInfoTopBar
            title={surveyData.title}
            surveyId={surveyData.surveyId}
            responsesSoFar={surveyData.responsesSoFar}
            secretSurveyId={surveyData.secretSurveyId}
            // @ts-ignore
            responseLastDay={surveyAnswerTimeSeries?.responsesLastDay}
            responseLastWeek={surveyAnswerTimeSeries?.responsesLastWeek}
            quesdata={quesdata}
          />
          <div className="mt-4 grid grid-cols-12 gap-6 @container">
            <div className="order-3 col-span-full @4xl:col-span-6 @7xl:col-span-full @[107.5rem]:order-1 @[107.5rem]:col-span-3">
              {/* to dispaly audience filter */}
              <CoinList
                audienceFiltersData={audienceFilterData}
                setShowModal={setShowModal}
              />
            </div>
            <div className="order-1 col-span-full @2xl:block @7xl:col-span-8 @[107.5rem]:order-2 @[107.5rem]:col-span-6">
              {/* to display plot of responses */}
              {surveyAnswerTimeSeries.bins &&
                Object.keys(surveyAnswerTimeSeries.bins).length > 1 && (
                  <LiquidityChartSurvey
                    frequencyData={surveyAnswerTimeSeries.bins}
                  />
                )}
              {surveyAnswerTimeSeries.bins &&
                Object.keys(surveyAnswerTimeSeries.bins).length <= 1 && (
                  <div className="flex justify-center items-center h-full">
                    {' '}
                    Not Enough History available to draw trend{' '}
                  </div>
                )}
              {!surveyAnswerTimeSeries.bins && (
                <div className="flex justify-center items-center h-full">
                  {' '}
                  Not Enough History available to draw trend{' '}
                </div>
              )}
            </div>
            <div className="order-2 col-span-full @4xl:col-span-6 @6xl:order-2 @7xl:order-2 @7xl:col-span-4 @[107.5rem]:order-3 @[107.5rem]:col-span-3">
              <SurveyInfoDIV
                surveyData={surveyData}
                surveyStatusNew={surveyStatusNew}
                setSurveyStatusNew={setSurveyStatusNew}
                targetAudienceNew={targetAudienceNew}
                setTargetAudienceNew={setTargetAudienceNew}
                validUntilNew={validUntilNew}
                setValidUntilNew={setValidUntilNew}
                setValidUntilOld={setValidUntilOld}
                setShowSaveModal={setShowSaveModal}
                showSaveModal={showSaveModal}
                costToAnsSurvey={costToAnsSurvey}
              />
            </div>
          </div>
          <QuestionsListDrawerTable
            columns={columns}
            data={quesdata}
            surveyId={surveyData['surveyId']}
          />
        </>
      )}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-gray-700 bg-opacity-60 p-4 text-center backdrop-blur xs:p-5"
          >
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-full align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              ref={modalContainerRef}
              className="inline-block text-left align-middle"
            >
              <div className="w-full rounded-lg bg-white text-sm shadow-large dark:bg-dark xs:w-[400px]">
                <h2 className="p-6 text-lg font-medium uppercase text-gray-900 dark:text-white">
                  List of Addresses
                </h2>
                <div className="relative">
                  <SearchIcon className="absolute left-6 h-full text-gray-700" />
                  <input
                    type="search"
                    autoFocus={true}
                    onChange={(e) => {
                      setSearchKeywordFilter(e.target.value);
                    }}
                    placeholder="Search Address"
                    className="w-full border-x-0 border-y border-dashed border-gray-200 py-3.5 pl-14 pr-6 text-sm focus:border-gray-300 focus:ring-0 dark:border-gray-700 dark:bg-light-dark focus:dark:border-gray-600"
                  />
                </div>
                <ul
                  role="listbox"
                  className="min-h-[200px] max-h-[400px] py-3 overflow-hidden overflow-y-auto"
                >
                  {filteredList?.length > 0 ? (
                    filteredList.map((item, index) => (
                      <li
                        key={item.surveyId}
                        role="listitem"
                        tabIndex={index}
                        // onClick={() => handleSelectedCoin(item)}
                        // onKeyDown={(event) =>
                        //   handleSelectedCoinOnKeyDown(event, item)
                        // }
                        className="flex cursor-pointer items-center gap-2 px-6 py-3 outline-none hover:bg-gray-100 focus:bg-gray-200 dark:hover:bg-gray-800 dark:focus:bg-gray-900"
                      >
                        <span className="uppercase">{item}</span>
                      </li>
                    ))
                  ) : (
                    // FIXME: need coin not found svg from designer
                    <li className="px-6 py-20 text-center">
                      <h3 className="mb-2 text-base">Ops! not found</h3>
                      <p className="text-gray-500">
                        Try another keyword for search
                        {/* {JSON.stringify(audienceFilterData)} */}
                      </p>
                    </li>
                  )}
                </ul>
                <div className="relative">
                  <Plus
                    className="absolute left-6 h-full text-gray-700"
                    onClick={() => {
                      setNewAddressList([...newAddressList, addressToAdd]);
                      setAddressToAdd('');
                    }}
                  />
                  <input
                    type="text"
                    autoFocus={true}
                    value={addressToAdd}
                    onChange={(e) => setAddressToAdd(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setNewAddressList([...newAddressList, addressToAdd]);
                        setAddressToAdd('');
                      }
                    }}
                    placeholder="Add new address"
                    className="w-full border-x-0 border-y border-dashed border-gray-200 py-3.5 pl-14 pr-6 text-sm focus:border-gray-300 focus:ring-0 dark:border-gray-700 dark:bg-light-dark focus:dark:border-gray-600"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-gray-700 bg-opacity-60 p-4 text-center backdrop-blur xs:p-5"
          >
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-full align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              ref={modalContainerRef}
              className="inline-block text-left align-middle"
            >
              <div className="w-full rounded-lg bg-white text-sm shadow-large dark:bg-dark xs:w-[400px]">
                <h2 className="p-6 text-lg font-medium uppercase text-gray-900 dark:text-white">
                  Change Survey Settings
                </h2>
                {targetAudienceOld !== targetAudienceNew && (
                  <div>
                    <InputLabel
                      className="!mb-2 sm:!mb-3 px-7"
                      titleClassName="!capitalize !font-normal"
                      title="New Targeted Audience Size"
                    />
                    <Input
                      type="number"
                      disabled={true}
                      placeholder="Target Audience"
                      value={targetAudienceNew}
                      className={'px-6 pb-2'}
                    />
                  </div>
                )}
                {validUntilOld.startDate !== validUntilNew.startDate &&
                  validUntilNew.startDate.toString().length == 10 && (
                    <div>
                      <InputLabel
                        className="!mb-2 sm:!mb-3 px-7"
                        titleClassName="!capitalize !font-normal"
                        title="New Valid Until Date"
                      />
                      <Input
                        type="text"
                        disabled={true}
                        placeholder="Target Audience"
                        value={validUntilNew.startDate.toString()}
                        className={'px-6 pb-2'}
                      />
                    </div>
                  )}
                {surveyStausOld.name !== surveyStatusNew.name && (
                  <div>
                    <InputLabel
                      className="!mb-2 sm:!mb-3 px-7"
                      titleClassName="!capitalize !font-normal"
                      title="Changing Survey Status To"
                    />
                    <Input
                      type="text"
                      disabled={true}
                      placeholder="Target Audience"
                      value={surveyStatusNew.name}
                      className={'px-6 pb-2'}
                    />
                  </div>
                )}
                {newAddressList.length !== oldAddressList.length && (
                  <div>
                    <InputLabel
                      className="!mb-2 sm:!mb-3 px-7"
                      titleClassName="!capitalize !font-normal"
                      title="New Addresses Added"
                    />
                    <div
                      style={{ maxHeight: '400px', overflowY: 'auto' }}
                      className="mb-2 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 sm:px-3 sm:py-3 mx-7"
                    >
                      <ul>
                        {newAddressList
                          .filter(
                            (address) => !oldAddressList.includes(address),
                          )
                          .map((address, index) => (
                            <li key={index} className="!mb-2 sm:!mb-3 px-7">
                              {address}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
                <div className="flex justify-center align-center p-4 ">
                  <Button
                    size="medium"
                    shape="rounded"
                    onClick={handleSubmitChanges}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
