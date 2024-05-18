import { useState, Fragment } from 'react';
import { format } from 'date-fns';
import { LiquidityChartQuestion as LiquidityChart } from '@/components/ui/chats/liquidity-chart';
import cn from 'classnames';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Bar,
  Tooltip,
} from 'recharts';
import Image from 'next/image';
import { RadioGroup } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import {
  weeklyComparison,
  monthlyComparison,
  yearlyComparison,
} from '@/data/static/price-history';
import { useEffect } from 'react';
import { Tag } from '@/components/icons/tag';
import { LongArrowUp } from '@/components/icons/long-arrow-up';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
import PopoverContent from '@/components/cryptocurrency-pricing-table/popover-content';
import routes from '@/config/routes';
import AnchorLink from '@/components/ui/links/anchor-link';
import { QuestionInfoDrawerAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';

interface RadioOptionProps {
  value: string;
}

function RadioGroupOption({ value }: RadioOptionProps) {
  return (
    <RadioGroup.Option value={value}>
      {({ checked }) => (
        <span
          className={`relative flex h-8 cursor-pointer items-center justify-center rounded-lg px-3 text-sm uppercase tracking-wider ${
            checked ? 'text-white' : 'text-brand dark:text-gray-400'
          }`}
        >
          {checked && (
            <motion.span
              className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
              layoutId="statusIndicator"
            />
          )}
          <span className="relative flex items-center leading-none">
            {value}
          </span>
        </span>
      )}
    </RadioGroup.Option>
  );
}

export default function SingleComparisonChart() {
  const [status, setStatus] = useState('Month');
  const questionDrawerState = useRecoilValue(QuestionInfoDrawerAtom);
  var selectedQues = questionDrawerState.selectedId;
  const [chartData, setChartData] = useState([]);
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [averageValue, setAvergaeValue] = useState(0);
  const [mode, setMode] = useState(0);
  useEffect(() => {
    if (
      questionDrawerState &&
      questionDrawerState['originalData'] &&
      (questionDrawerState['originalData'].qTypeName == 'Radio' ||
        questionDrawerState['originalData'].qTypeName == 'CheckBox')
    ) {
      var newchat = questionDrawerState[
        'originalData'
      ].questionOptionIndexesString.map(function (option) {
        // Create a copy of each object in the array
        return {
          locationIndex: option.locationIndex,
          optionString: option.optionString,
          frequency: 0,
          bigLabel: 'OPT #' + (option.locationIndex + 1),
          smallLabel: '#' + option.locationIndex + 1,
        };
      });
      console.log(
        'questionDrawerState[selectedQues]',
        questionDrawerState[selectedQues],
      );
      for (var i = 0; i < questionDrawerState[selectedQues].length; i++) {
        //increase the frequency of the selected option
        for (
          var j = 0;
          j < questionDrawerState[selectedQues][i][1].length;
          j++
        ) {
          var selectedOptIndex = Number(
            questionDrawerState[selectedQues][i][1][j],
          );
          if (
            newchat &&
            newchat[selectedOptIndex] &&
            newchat[selectedOptIndex].frequency
          ) {
            newchat[selectedOptIndex].frequency =
              newchat[selectedOptIndex].frequency + 1;
          } else {
            newchat[selectedOptIndex].frequency = 1;
          }
        }
      }
      setChartData(newchat);
      setFilteredChartData(newchat);
    }
    if (
      questionDrawerState &&
      questionDrawerState['originalData'] &&
      questionDrawerState['originalData'].qTypeName == 'Range'
    ) {
      // create array with value from 0 to 10
      const data = Array.from({ length: 11 }, (_, i) => i);
      const newData = data.map((item) => {
        return {
          label: item,
          frequency: 0,
        };
      });
      // generate randome
      var sumforavg = 0;
      for (var i = 0; i < questionDrawerState[selectedQues].length; i++) {
        var selectedOptIndex = Number(questionDrawerState[selectedQues][i][1]);
        sumforavg = sumforavg + selectedOptIndex;
        //increase the frequency of the selected option
        newData[selectedOptIndex].frequency =
          newData[selectedOptIndex].frequency + 1;
      }
      setAvergaeValue(sumforavg / questionDrawerState[selectedQues].length);
      //calculate mean
      setChartData(newData);
    }
  }, [questionDrawerState]);

  const CustomChart = ({ data }) => {
    const isVertical = data.length <= 12;

    return (
      <ResponsiveContainer
        width="100%"
        height={isVertical ? 300 : data.length * 50}
      >
        {isVertical ? (
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="7 7" vertical={false} />
            <XAxis dataKey="bigLabel" tickLine={false} tickMargin={10} />
            {/* <YAxis /> */}
            {/* // @ts-ignore */}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="frequency" />
          </BarChart>
        ) : (
          <BarChart
            width={500}
            height={data.length * 50}
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="7 7" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="smallLabel"
              type="category"
              tickLine={false}
              tickMargin={10}
            />

            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="frequency" />
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const handleOnChange = (value: string) => {
    setStatus(value);
    switch (value) {
      case 'View All':
        setFilteredChartData(chartData);
        break;
      case 'Top 5':
        // pick top 5 element where  frequence is largest from chartData
        var top5Elements = chartData
          .sort(function (a, b) {
            return b.frequency - a.frequency;
          })
          .slice(0, 5);
        setFilteredChartData(top5Elements);
        break;
      case 'Top 10':
        var top10Elements = chartData
          .sort(function (a, b) {
            return b.frequency - a.frequency;
          })
          .slice(0, 10);
        setFilteredChartData(top10Elements);
        break;
      default:
        setFilteredChartData(chartData);
        break;
    }
  };

  const getOptionText = (label: string) => {
    // check if # exists in string
    if (label.includes('#')) {
      var labelindex = Number(label.split('#')[1]) - 1;
    } else {
      var labelindex = Number(label) - 1;
    }

    if (chartData[labelindex]) {
      return chartData[labelindex].optionString;
    } else {
      return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="bg-white dark:bg-brand rounded shadow-lg p-2">
            <p className="label">{`${label} : ${payload[0].value}`}</p>
            <p className="intro">{getOptionText(label)}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={`h-full rounded-br-lg rounded-tr-lg p-4 dark:bg-transparent sm:p-8 dark:2xl:bg-light-dark`}
    >
      <div className="">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-base">
            <span className="flex items-center gap-2.5">
              <span className="flex flex-row items-center gap-2.5">
                <Image
                  src={questionDrawerState['originalData'].qTypeImage}
                  alt=""
                  width="24"
                  height="24"
                />
              </span>
              <span className="flex items-end text-xl font-medium capitalize text-brand dark:text-white">
                <AnchorLink href={''}>
                  {questionDrawerState['originalData'].qTypeName}
                </AnchorLink>
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-[5px]">
              <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium leading-none text-brand dark:!bg-gray-700 dark:text-white">
                Question Index #
                {questionDrawerState['originalData'].questionIndex}
              </span>
            </span>
          </div>
          <div className="mt-6 flex items-center justify-between gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
            Question Text
            {/* show switch radio button */}
            {(questionDrawerState['originalData'].qTypeName == 'Radio' ||
              questionDrawerState['originalData'].qTypeName == 'CheckBox') && (
              <RadioGroup
                value={status}
                onChange={handleOnChange}
                className="flex items-center gap-5"
              >
                <RadioGroupOption value="View All" />
                <RadioGroupOption value="Top 5" />
                <RadioGroupOption value="Top 10" />
              </RadioGroup>
            )}
          </div>
          <div className="mt-5 flex items-end gap-3 text-base font-medium text-gray-900 dark:text-white sm:text-xl lg:flex-wrap 2xl:flex-nowrap">
            <span className={cn('flex items-end', 'flex-row')}>
              {questionDrawerState['originalData'].questionString}
            </span>
          </div>
        </div>
      </div>

      <div className="py-4">
        <h5 className="pb-5 pt-6 text-base font-medium uppercase">
          Response Stats
        </h5>
        <div className="grid grid-cols-2 gap-7 lg:grid-cols-3 lg:gap-11">
          <div>
            <div className="flex items-center gap-1">
              <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                Total Responses
              </div>
              <Tippy
                content={
                  <PopoverContent
                    text={
                      'Count of respondants who have responded to this question in this survey.'
                    }
                  />
                }
                animation="shift-away"
                arrow={true}
              >
                <div>
                  <Tag />
                </div>
              </Tippy>
            </div>
            <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
              {questionDrawerState[selectedQues].length}
            </h4>
            {/* <span className="block text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
              35% of crypto market
            </span> */}
          </div>
          {(questionDrawerState['originalData'].qTypeName == 'Radio' ||
            questionDrawerState['originalData'].qTypeName == 'CheckBox') && (
            <div>
              <div className="flex items-center gap-1">
                <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                  Total Options
                </div>
                <Tippy
                  content={
                    <PopoverContent
                      text={
                        'The count of options that were available to respondants to choose from.'
                      }
                    />
                  }
                  animation="shift-away"
                  arrow={true}
                >
                  <div>
                    <Tag />
                  </div>
                </Tippy>
              </div>
              <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
                {
                  questionDrawerState['originalData']
                    .questionOptionIndexesString.length
                }
              </h4>
              <span className="flex items-center text-gray-600 dark:text-gray-400  lg:text-sm">
                Options to select from
              </span>
            </div>
          )}
          {questionDrawerState['originalData'].qTypeName == 'Range' && (
            <div>
              <div className="flex items-center gap-1">
                <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                  Average
                </div>
                <Tippy
                  content={
                    <PopoverContent text={'Calculated Average Response'} />
                  }
                  animation="shift-away"
                  arrow={true}
                >
                  <div>
                    <Tag />
                  </div>
                </Tippy>
              </div>
              <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
                {averageValue}
              </h4>
              <span className="flex items-center text-xs text-gray-600 dark:text-gray-400  lg:text-sm">
                Mean Response
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1">
              <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                Sensitivity Score
              </div>
              <Tippy
                content={
                  <PopoverContent
                    text={
                      'Indicates the level of sensitivity in the response to a question.'
                    }
                  />
                }
                animation="shift-away"
                arrow={true}
              >
                <div>
                  <Tag />
                </div>
              </Tippy>
            </div>
            <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
              {questionDrawerState['originalData'].privacyLevelRating}
            </h4>
            {/* <span className="block text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
              91% of total supply
            </span> */}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                Mandatory
              </div>
              <Tippy
                content={
                  <PopoverContent
                    text={
                      'If the question was mandatory to answer during the survey.'
                    }
                  />
                }
                animation="shift-away"
                arrow={true}
              >
                <div>
                  <Tag />
                </div>
              </Tippy>
            </div>
            <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
              {questionDrawerState['originalData'].isMandatory ? 'Yes' : 'No'}
            </h4>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                PUBLIC
              </div>
              <Tippy
                content={
                  <PopoverContent
                    text={
                      'The responses can be seen by the researchers of this survey, or the people who buy the survey.'
                    }
                  />
                }
                animation="shift-away"
                arrow={true}
              >
                <div>
                  <Tag />
                </div>
              </Tippy>
            </div>
            <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
              {questionDrawerState['originalData']['answerTypeAllowed'][0]
                ? 'Yes'
                : 'No'}
            </h4>
            <span className="block text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
              Answer Type Allowed
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                Analytics
              </div>
              <Tippy
                content={
                  <PopoverContent
                    text={
                      'These responses can only be included in analysis, and can not be viewed as plain text.'
                    }
                  />
                }
                animation="shift-away"
                arrow={true}
              >
                <div>
                  <Tag />
                </div>
              </Tippy>
            </div>
            <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
              {questionDrawerState['originalData']['answerTypeAllowed'][1]
                ? 'Yes'
                : 'No'}
            </h4>
            <span className="block text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
              Answer Type Allowed
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <div className="text-xs uppercase text-gray-600 dark:text-gray-400 lg:text-sm">
                Private
              </div>
              <Tippy
                content={
                  <PopoverContent
                    text={
                      'These type of responses can only be seen by the Researchers of this survey.'
                    }
                  />
                }
                animation="shift-away"
                arrow={true}
              >
                <div>
                  <Tag />
                </div>
              </Tippy>
            </div>
            <h4 className="text-base font-medium text-black dark:text-white lg:text-xl">
              {questionDrawerState['originalData']['answerTypeAllowed'][2]
                ? 'Yes'
                : 'No'}
            </h4>
            <span className="block text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
              Answer Type Allowed
            </span>
          </div>
        </div>
      </div>

      <div
        className={`mt-5 h-56 sm:mt-8 md:h-96 lg:h-[380px] xl:h-[402px] 2xl:h-[23.75rem] min-[1536px]:h-[24rem] 3xl:h-[465px]`}
      >
        {(questionDrawerState['originalData'].qTypeName == 'Radio' ||
          questionDrawerState['originalData'].qTypeName == 'CheckBox') && (
          <CustomChart data={filteredChartData} />
        )}
        {questionDrawerState['originalData'].qTypeName == 'Range' && (
          <LiquidityChart frequencyData={chartData} />
        )}
        {/* <LiquidityChart frequencyData={chartData} /> */}
      </div>
    </div>
  );
}
