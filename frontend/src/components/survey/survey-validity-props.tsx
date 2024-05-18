import { RadioGroup } from '@headlessui/react';
import IconMixerHorizontal from '@/components/icons/mixed';
import { SandClock } from '@/components/icons/sand-clock';
import IconPeopleGroup from '@/components/icons/people-group';
import Datepicker, { DateRangeType } from 'react-tailwindcss-datepicker';
import Input from '@/components/ui/forms/input';
import { masterSettingsAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';

const DatePicke = ({ addMargin }) => {
  const [masterSettings, setMasterSettings] =
    useRecoilState(masterSettingsAtom);
  const [value, setValue] = useState({
    startDate: masterSettings.survey_expiry_date.startDate,
    endDate: masterSettings.survey_expiry_date.endDate,
  });
  useEffect(() => {
    setMasterSettings({ ...masterSettings, ['survey_expiry_date']: value });
  }, [value]);
  return (
    <div className={addMargin ? 'mt-2' : ''}>
      <Datepicker
        useRange={false}
        asSingle={true}
        value={value}
        onChange={setValue}
        minDate={new Date()}
      />
    </div>
  );
};

const InputComponent = ({ placeholder }) => {
  const [masterSettings, setMasterSettings] =
    useRecoilState(masterSettingsAtom);
  const [value, setValue] = useState(masterSettings.survey_audience_size);
  useEffect(() => {
    setMasterSettings({ ...masterSettings, ['survey_audience_size']: value });
  }, [value]);
  return (
    <Input
      placeholder={placeholder}
      type="number"
      className="mt-2"
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
    />
  );
};

const ValidityOptions = [
  {
    name: 'Fixed Audience Size',
    value: 'audienceSize',
    icon: <IconPeopleGroup className="h-10 w-10 sm:h-auto sm:w-auto" />,
    input: <InputComponent placeholder="Audience Size" />,
  },
  {
    name: 'Timed Survey',
    value: 'time',
    icon: <SandClock className="h-5 w-5 sm:h-auto sm:w-auto" />,
    input: <DatePicke addMargin={true} />,
  },
  {
    name: 'Both',
    value: 'both',
    icon: <IconMixerHorizontal className="h-10 w-10 sm:h-auto sm:w-auto" />,
    input: (
      <div className="grid grid-row-2 gap-4">
        <InputComponent placeholder="Audience Size" />
        <DatePicke addMargin={false} />
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          Note: This survey will end either when the audience size limit is
          reached or when the end date is reached, whichever comes first.
        </p>
      </div>
    ),
  },
];

type SurveyValidityTypeProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SurveyValidityType({
  value,
  onChange,
}: SurveyValidityTypeProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="grid grid-cols-3 gap-3"
    >
      {ValidityOptions.map((item, index) => (
        <RadioGroup.Option value={item.value} key={index}>
          {({ checked }) => (
            <>
              <span
                className={`relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-solid bg-white text-center text-sm font-medium tracking-wider shadow-card transition-all hover:shadow-large dark:bg-light-dark ${
                  checked
                    ? 'border-brand'
                    : 'border-white dark:border-light-dark'
                }`}
              >
                <span className="relative flex h-28 flex-col items-center justify-center gap-3 px-2 text-center text-xs uppercase sm:h-36 sm:gap-4 sm:text-sm">
                  {item.icon}
                  {item.name}
                </span>
              </span>
              {checked && item.input}
            </>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
}
