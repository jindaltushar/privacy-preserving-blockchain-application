// static data
'use client';

import cn from 'classnames';
import Link from 'next/link';
// import SimpleBar from '@/components/ui/simplebar';
import SurveyIcon from '@/assets/images/survey.png';
import Image from 'next/image';
import { useEffect, useContext, useRef, useState } from 'react';
import { IoMdCloudDownload } from 'react-icons/io';
import { QuestionInfoDrawerAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import { toast } from 'sonner';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { readIPFS } from '@/app/shared/ipfs';
import { stringToBytes32 } from '@/app/shared/utils';
const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
var SelectedCoinPriceData = [
  {
    text: '24H Responses',
    responses: '$20,679.17',
    increase: true,
  },
  {
    text: '1W Responses',
    responses: '$20,679.17',
    increase: false,
  },
  {
    text: 'Complete History',
    responses: '$20,679.17',
    increase: true,
  },
];

interface CoinBarProps {
  title: string;
  surveyId: number;
  responsesSoFar: number;
  secretSurveyId: string;
  responseLastDay: number;
  responseLastWeek: number;
  quesdata: any;
}

function convertJSONToCSV(jsonData) {
  const separator = '|';
  const keys = Object.keys(jsonData[0]);
  const csvContent = jsonData
    .map((row) => {
      return keys
        .map((key) => {
          return JSON.stringify(row[key]);
        })
        .join(separator);
    })
    .join('\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent(
    keys.join(separator) + '\n' + csvContent,
  )}`;
}

export default function SurveyInfoTopBar({
  title,
  surveyId,
  responsesSoFar,
  secretSurveyId,
  responseLastDay,
  responseLastWeek,
  quesdata,
}: CoinBarProps) {
  const [questionInfoDrawer, setQuestionInfoDrawer] = useRecoilState(
    QuestionInfoDrawerAtom,
  );
  const [downloading, setDownloading] = useState(false);
  const { getAnswersOfQuestionInSurvey, decodeTextAnswerForOrganisation } =
    useContext(SurveyContractContext);
  useEffect(() => {
    // request from survey contract the 24hour, 1 week, and whole history responses from this surveyId
    SelectedCoinPriceData[0].responses = String(responseLastDay);
    SelectedCoinPriceData[1].responses = String(responseLastWeek);
    SelectedCoinPriceData[2].responses = String(responsesSoFar);
  });
  const handleDownload = async (quesdata) => {
    setDownloading(true);
    var data = [];
    const setValue = (rowValue, columnName, value) => {
      // Check if column exists, if not create it in all rows
      if (!data.some((row) => row.hasOwnProperty(columnName))) {
        data.forEach((row) => {
          row[columnName] = '';
        });
      }

      // Find the row with the specified row value
      let row = data.find((row) => row.respondantId === rowValue);
      if (!row) {
        // If row doesn't exist, create a new row
        row = { respondantId: rowValue };
        // Add all existing columns with default values
        data.forEach((existingRow) => {
          Object.keys(existingRow).forEach((col) => {
            if (!row.hasOwnProperty(col)) {
              row[col] = '';
            }
          });
        });
        data.push(row);
      }

      // Set the value in the specified column for the row
      row[columnName] = value;
    };
    // check all  those questionids which do not exist in questionInfoDrawer as key but exist in quesdata
    const keys = Object.keys(questionInfoDrawer);
    // remove key names selectedId,originalData
    keys.splice(keys.indexOf('selectedId'), 1);
    keys.splice(keys.indexOf('originalData'), 1);
    const quesToFetch = [];
    for (let i = 0; i < quesdata.length; i++) {
      if (!keys.includes(String(quesdata[i].questionId))) {
        quesToFetch.push([
          quesdata[i].questionId,
          quesdata[i].questionIndex - 1,
        ]);
      }
    }
    console.log('ques to fetch ', quesToFetch);
    const promises = quesToFetch.map(async (question) => {
      const r = await getAnswersOfQuestionInSurvey(surveyId, question[1]);
      return [question[0], r];
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Combine all results and update the state once
    var copiedState = deepCopy(questionInfoDrawer);
    // remove selectedId,originalData
    delete copiedState.selectedId;
    delete copiedState.originalData;
    const updatedState = Object.fromEntries(results);
    setQuestionInfoDrawer((prevDrawer) => ({
      ...prevDrawer,
      ...updatedState,
    }));
    // merge updatedState with copiedState
    var midmerged = { ...copiedState, ...updatedState };
    console.log('questionData', quesdata);
    console.log('midmerged', midmerged);
    // make a copy of midmerged with only those keys whose questionId exists in quesdata
    var merged = {};
    for (let key in midmerged) {
      if (quesdata.find((ques) => ques.questionId == Number(key))) {
        merged[key] = midmerged[key];
      }
    }
    console.log('merged', merged);

    for (let key in merged) {
      const value = merged[key];
      var questionType = quesdata.find(
        (ques) => ques.questionId == Number(key),
      ).qTypeName;
      const index = quesdata.findIndex(
        (ques) => ques.questionId == Number(key),
      );
      if (value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          var response;
          const row = value[i];
          if (row[0] == stringToBytes32('')) {
            questionType = 'DoNotAddMe';
          }
          if (questionType == 'Radio') {
            var optionIndex = Number(row[1][0].hex);
            if (isNaN(optionIndex)) {
              optionIndex = Number(row[1][0]);
            }
            response = quesdata[index].questionOptionIndexesString.find(
              (option) => option.locationIndex == optionIndex,
            ).optionString;
          }
          if (questionType == 'Open Text') {
            const ipfsresponse = (
              await readIPFS({
                digest: row[2][0],
                hashFunction: row[2][1],
                size: row[2][2],
              })
            ).cipherForOrganisation;

            response = await decodeTextAnswerForOrganisation(ipfsresponse);
          }
          if (questionType == 'Range') {
            response = Number(row[1][0].hex);
            if (isNaN(response)) {
              response = Number(row[1][0]);
            }
          }
          if (questionType == 'CheckBox') {
            response = [];
            for (let j = 0; j < row[1].length; j++) {
              var optionIndex = Number(row[1][j].hex);
              if (isNaN(optionIndex)) {
                optionIndex = Number(row[1][0]);
              }
              response.push(
                quesdata[index].questionOptionIndexesString.find(
                  (option) => option.locationIndex == optionIndex,
                ).optionString,
              );
            }
          }
          console.log(response);
          setValue(row[0], quesdata[index].questionString, response);
        }
      }
    }
    try {
      const csvData = convertJSONToCSV(data);
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', csvData);
      downloadLink.setAttribute('download', `${surveyId}_${Date.now()}.csv`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setDownloading(false);
    } catch {
      toast.error('Nothing to export!');
      setDownloading(false);
    }
  };
  return (
    <>
      <div className="relative z-10 flex flex-nowrap items-center justify-between gap-8 border-t border-dashed border-gray-200 py-4 @container @6xl:py-6 dark:border-gray-700">
        <div className="flex shrink-0 items-center justify-between gap-8 @[90rem]:gap-10">
          <div className="flex items-center gap-3 rounded-full bg-gray-100 p-2 py-1.5 pr-6 dark:bg-light-dark">
            <Image src={SurveyIcon} alt="Survey Icon" width={30} height={30} />
            <span className="inline-block">
              <p className="font-medium uppercase text-brand dark:text-white sm:text-lg">
                {title}
              </p>
              <p className="text-left text-sm capitalize text-gray-500 dark:text-gray-300">
                Survey Id : #{surveyId}
              </p>
            </span>
            <span className=" ml-2 text-gray-500"></span>
          </div>
          {SelectedCoinPriceData.map((item) => (
            <CoinPriceDetails
              key={item.text}
              text={item.text}
              price={item.responses}
              priceDown={item.increase}
            />
          ))}
        </div>
        <IconButton
          quesdata={quesdata}
          handleDownload={handleDownload}
          downloading={downloading}
        />
      </div>
    </>
  );
}

function CoinPriceDetails({
  text,
  price,
  priceDown,
}: {
  text: string;
  price: string;
  priceDown: boolean;
}) {
  return (
    <div className="hidden shrink-0 text-sm font-medium @6xl:block">
      <p className="mb-1 text-gray-500">{text}</p>
      <p
        className={cn(
          priceDown ? 'text-red-500' : 'text-brand dark:text-gray-300',
        )}
      >
        {price}
      </p>
    </div>
  );
}

function IconButton({ quesdata, handleDownload, downloading }) {
  return (
    <div className="flex shrink-0 items-center gap-4">
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (!downloading) {
            handleDownload(quesdata);
          }
        }}
        title="Download"
        className="group inline-flex items-center gap-3 text-sm text-gray-500 transition-colors hover:text-brand dark:hover:text-gray-200"
      >
        <IoMdCloudDownload className="h-auto w-5 text-gray-900 transition-transform duration-200 group-hover:scale-110 dark:text-gray-400 dark:group-hover:text-gray-200" />
        <span className="hidden md:inline-block">
          {downloading ? 'Downloading ...' : 'Download Data'}
        </span>
      </Link>
    </div>
  );
}
