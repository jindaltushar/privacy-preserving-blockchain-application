'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function LiquidityChartQuestion({ frequencyData }) {
  let [frequency, setFrequency] = useState('0');

  return (
    <div className="rounded-lg bg-white p-6 shadow-card dark:bg-light-dark sm:p-8 mb-2">
      <h3 className="mb-1.5 text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:mb-2 sm:text-base">
        Frequency
      </h3>
      <div className="mb-1 text-base font-medium text-gray-900 dark:text-white sm:text-xl">
        {frequency}
      </div>
      <div className="mt-5 h-64 sm:mt-8 2xl:h-72 3xl:h-[340px] 4xl:h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={frequencyData}
            margin={{
              top: 0,
              right: 10,
              left: 10,
              bottom: 0,
            }}
            onMouseMove={(data) => {
              if (data.isTooltipActive) {
                setFrequency(
                  data.activePayload && data.activePayload[0].payload.frequency,
                );
              }
            }}
          >
            <defs>
              <linearGradient
                id="liquidity-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#bc9aff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7645D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tickMargin={5}
            />
            <Tooltip content={<></>} cursor={{ stroke: '#7645D9' }} />
            <Area
              type="linear"
              dataKey="frequency"
              stroke="#7645D9"
              strokeWidth={1.5}
              fill="url(#liquidity-gradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function convertData(inputData, binDifference) {
  const convertedData = [];
  const keys = Object.keys(inputData);
  const numKeys = keys.length;

  // Add element before the first data point
  if (numKeys > 0) {
    const firstKey = keys[0];
    const firstTime = parseInt(firstKey) * 1000;
    const prevZeroTime = firstTime - binDifference / 2;
    convertedData.push({
      date: prevZeroTime,
      dailyVolumeUSD: 0,
      name: `before_${firstKey}`,
    });
  }

  for (let i = 0; i < numKeys; i++) {
    const currentKey = keys[i];
    const currentTime = parseInt(currentKey) * 1000;
    const currentValue = inputData[currentKey];
    convertedData.push({
      date: currentTime,
      dailyVolumeUSD: currentValue.toString(),
      name: currentKey,
    });
  }

  // Add element after the last data point
  if (numKeys > 0) {
    const lastKey = keys[numKeys - 1];
    const lastTime = parseInt(lastKey) * 1000;
    const nextZeroTime = lastTime + binDifference / 2;
    convertedData.push({
      date: nextZeroTime,
      dailyVolumeUSD: 0,
      name: `after_${lastKey}`,
    });
  }

  return convertedData;
}

function calculateBinDifference(inputData) {
  const keys = Object.keys(inputData);
  const numKeys = keys.length;

  if (numKeys <= 1) {
    return 0; // No need for bins if only one or no data points
  }

  let totalDifference = 0;
  for (let i = 1; i < numKeys; i++) {
    const currentTime = parseInt(keys[i]) * 1000;
    const prevTime = parseInt(keys[i - 1]) * 1000;
    const difference = currentTime - prevTime;
    totalDifference += difference;
  }

  const averageDifference = totalDifference / (numKeys - 1);
  return averageDifference;
}

function CustomAxisSurvey({ x, y, payload }: any) {
  const date = format(new Date(payload.value * 1000), 'd');
  return (
    <g
      transform={`translate(${x},${y})`}
      className="text-xs text-gray-500 md:text-sm"
    >
      <text x={0} y={0} dy={10} textAnchor="end" fill="currentColor">
        {date}
      </text>
    </g>
  );
}

const numberAbbr = (number: any) => {
  if (number < 1e3) return number;
  if (number >= 1e3 && number < 1e6) return +(number / 1e3).toFixed(1) + 'K';
  if (number >= 1e6 && number < 1e9) return +(number / 1e6).toFixed(1) + 'M';
  if (number >= 1e9 && number < 1e12) return +(number / 1e9).toFixed(1) + 'B';
  if (number >= 1e12) return +(number / 1e12).toFixed(1) + 'T';
};

export function LiquidityChartSurvey({ frequencyData }) {
  let [date, setDate] = useState(0);
  const [LiquidityData, setLiquidityData] = useState([]);
  let [liquidity, setLiquidity] = useState('0');
  let [formattedDate, setFormattedDate] = useState('');
  let [dailyLiquidity, setDailyLiquidity] = useState('');
  useEffect(() => {
    console.log('frequencyData', frequencyData);
    setLiquidityData(
      convertData(frequencyData, calculateBinDifference(frequencyData)),
    );
  }, [frequencyData]);
  useEffect(() => {
    try {
      setDate(LiquidityData[0].date);
      setLiquidity(LiquidityData[0].dailyVolumeUSD);
    } catch (e) {}
  }, [LiquidityData]);
  useEffect(() => {
    setFormattedDate(format(new Date(date), 'MMMM d, yyyy h:mm a'));
  }, [date]);
  useEffect(() => {
    setDailyLiquidity(numberAbbr(liquidity));
  }, [liquidity]);
  return (
    <div className="rounded-lg bg-white p-6 shadow-card dark:bg-light-dark sm:p-8">
      <h3 className="mb-1.5 text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:mb-2 sm:text-base">
        Survey Activity
      </h3>
      <div className="mb-1 text-base font-medium text-gray-900 dark:text-white sm:text-xl">
        {dailyLiquidity}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
        {formattedDate}
      </div>
      <div className="mt-5 h-64 sm:mt-8 2xl:h-72 3xl:h-[340px] 4xl:h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={LiquidityData}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
            onMouseMove={(data) => {
              if (data.isTooltipActive) {
                setDate(
                  data.activePayload && data.activePayload[0].payload.date,
                );
                setLiquidity(
                  data.activePayload &&
                    data.activePayload[0].payload.dailyVolumeUSD,
                );
              }
            }}
          >
            <defs>
              <linearGradient
                id="liquidity-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#bc9aff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7645D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={<CustomAxisSurvey />}
              interval={0}
              tickMargin={5}
            />
            <Tooltip content={<></>} cursor={{ stroke: '#7645D9' }} />
            <Area
              type="linear"
              dataKey="dailyVolumeUSD"
              stroke="#7645D9"
              strokeWidth={1.5}
              fill="url(#liquidity-gradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
