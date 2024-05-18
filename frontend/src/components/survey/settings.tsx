'use client';
import {
  nodesAtom,
  selectedNodeIndexAtom,
  masterSettingsAtom,
} from '@/stores/atoms';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import {
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import ListCard from '@/components/ui/list-card';
import InputLabel from '@/components/ui/input-label';
import { Fragment } from 'react';
import { Transition } from '@/components/ui/transition';
import {
  type CheckboxProps,
  type Node,
  type NodeType,
  type RadioProps,
  type RangeProps,
  type RangeTypes,
} from '@/app/shared/types';
import Button from '@/components/ui/button';
import PublicImage from '@/assets/images/public.png';
import PrivateImage from '@/assets/images/private.png';
import AnalyticImage from '@/assets/images/analysis.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/survey/dropdown-menu';
import { FaChevronDown } from 'react-icons/fa6';
import { IoCopyOutline } from 'react-icons/io5';
import { createEmptyElement } from '@/app/shared/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/survey/card';
import ToggleBar from '@/components/ui/toggle-bar';
import Asterisk from '@/components/icons/asterisk';
import IconDeleteBin5Line from '@/components/icons/delete';
import { Listbox } from '@/components/ui/listbox';
import { ChevronDown } from '@/components/icons/chevron-down';
import SliderRating from '../ui/slider-rating';

function NodeControl() {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const index = useRecoilValue(selectedNodeIndexAtom);

  const names = {
    radio: 'Radio',
    checkbox: 'Checkbox',
    text: 'Text',
    range: 'Range',
  };

  const setNodeType = (type: NodeType) => {
    if (index === undefined) return;
    setNodes((prev) => {
      const elem = prev[index];
      const data = createEmptyElement(type);
      return [
        ...prev.slice(0, index),
        { type, data: data },
        ...prev.slice(index + 1),
      ] as Node[];
    });
  };

  return index !== undefined ? (
    <>
      <Listbox value={names[nodes[index].type]}>
        <Listbox.Button
          className={cn(
            'flex h-11 w-full items-center justify-between gap-1 rounded-lg bg-gray-100 px-3 text-sm text-gray-900 dark:bg-gray-800 dark:text-white',
          )}
        >
          {names[nodes[index].type]}
          <ChevronDown />
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 -translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <Listbox.Options
            className="absolute z-20 mt-11 ml-3 gap-1 w-full min-w-[150px] origin-top-right rounded-lg bg-white p-3 px-3 shadow-large shadow-gray-400/10 ltr:right-0 rtl:left-0 dark:bg-[rgba(0,0,0,0.5)] dark:shadow-gray-900 dark:backdrop-blur "
            aria-orientation="vertical"
            data-headlessui-state="open"
          >
            <Listbox.Option key={'radio'} value={'radio'}>
              <div
                onClick={() => setNodeType('radio')}
                className={
                  'block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              >
                Radio Question
              </div>
            </Listbox.Option>
            <Listbox.Option key={'checkbox'} value={'checkbox'}>
              <div
                onClick={() => setNodeType('checkbox')}
                className={
                  'block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              >
                Checkbox Question
              </div>
            </Listbox.Option>
            <Listbox.Option key={'range'} value={'range'}>
              <div
                onClick={() => setNodeType('range')}
                className={
                  'block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              >
                Range Question
              </div>
            </Listbox.Option>
            <Listbox.Option key={'text'} value={'text'}>
              <div
                onClick={() => setNodeType('text')}
                className={
                  'block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              >
                TextBox Question
              </div>
            </Listbox.Option>
          </Listbox.Options>
        </Transition>
      </Listbox>
    </>
  ) : (
    <></>
  );
}

function RangeControl() {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const index = useRecoilValue(selectedNodeIndexAtom);

  const setNodeType = (type: RangeTypes) => {
    if (index === undefined) return;
    setNodes((prev) => {
      const elem = prev[index] as RangeProps;
      return [
        ...prev.slice(0, index),
        { type: 'range', data: { ...elem.data, type } } as RangeProps,
        ...prev.slice(index + 1),
      ] as Node[];
    });
  };

  return index !== undefined ? (
    <div className="flex items-center justify-between space-x-2">
      <InputLabel title={'Type'} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            {(nodes[index] as RangeProps).data.type ?? '0-10'}&ensp;
            <FaChevronDown size={12} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select an option</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setNodeType('0-10')}>
            0-10
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <></>
  );
}

function RequiredControl() {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const index = useRecoilValue(selectedNodeIndexAtom);
  const [isChecked, setIsChecked] = useState(
    nodes[index]?.data?.required ?? false,
  );
  const toggleRequired = () => {
    const required = !isChecked;
    setNodes((prev) => {
      if (index === undefined) return prev;
      const elem = prev[index];
      return [
        ...prev.slice(0, index),
        { type: elem.type, data: { ...elem.data, required } },
        ...prev.slice(index + 1),
      ] as Node[];
    });
    setIsChecked(required);
  };

  return (
    <ToggleBar
      title="Required"
      icon={<Asterisk />}
      checked={isChecked}
      onChange={toggleRequired}
    ></ToggleBar>
  );
}

function OtherControl() {
  const setNodes = useSetRecoilState(nodesAtom);
  const index = useRecoilValue(selectedNodeIndexAtom);
  const masterSettings = useRecoilValue(masterSettingsAtom);
  const [isChecked, setIsChecked] = useState(false);
  const toggleOther = () => {
    var other = !isChecked;
    setNodes((prev) => {
      if (index === undefined) return prev;
      const elem = prev[index];
      return [
        ...prev.slice(0, index),
        {
          type: elem.type,
          data: { ...elem.data, other, optionOptions: [''] },
        } as RadioProps | CheckboxProps,
        ...prev.slice(index + 1),
      ] as Node[];
    });
    setIsChecked(other);
  };
  if (masterSettings.is_survey_private) {
    return <></>;
  }
  return (
    <>
      <ToggleBar
        title='TOGGLE "OTHER" OPTION'
        checked={isChecked}
        onChange={toggleOther}
      ></ToggleBar>
    </>
  );
}

function PrivacySlider() {
  return <SliderRating text={'Sensitivity Score'} />;
}

export const answer_types = [
  {
    id: 0,
    name: 'Public',
    logo: PublicImage,
  },
  {
    id: 2,
    name: 'Analytics',
    logo: AnalyticImage,
  },
  {
    id: 1,
    name: 'Private',
    logo: PrivateImage,
  },
];

function AnswerTypesSupported() {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const index = useRecoilValue(selectedNodeIndexAtom);
  const masterSettings = useRecoilValue(masterSettingsAtom);
  var currElem = index !== undefined ? nodes[index] : undefined;

  // Initialize state with an array of false values to match the expected length
  const [state, setState] = useState(currElem.data.answerTypeAllowed);

  const updateState = (index: number) => {
    if (state) {
      setState((prev) => {
        return prev.map((item, i) => (i === index ? !item : item));
      });
    } else {
      var newstate = currElem.data.answerTypeAllowed;
      newstate[index] = !newstate[index];
      setState(newstate);
    }
  };

  useEffect(() => {
    setNodes((prev) => {
      if (index === undefined) return prev;
      const elem = prev[index];
      return [
        ...prev.slice(0, index),
        {
          type: elem.type,
          data: { ...elem.data, answerTypeAllowed: state },
        } as RadioProps,
        ...prev.slice(index + 1),
      ] as Node[];
    });
  }, [state]);

  if (masterSettings.is_survey_private) {
    return <></>;
  }
  return (
    <div className="block">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mx-2 mb-2">
        Select Answer Type
      </div>
      <div className="flex flex-wrap gap-2">
        {answer_types?.map(
          (
            item: any,
            index: number, // Include index in the map function
          ) => (
            <div
              className="inline-flex"
              key={item?.id}
              onClick={() => {
                updateState(index); // Pass index to updateState
              }}
            >
              <ListCard
                item={item}
                className={cn(
                  'rounded-full p-2  hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                  state && state[index] // Check if state[index] is true
                    ? 'text-gray-900 bg-gray-300'
                    : 'text-gray-300 bg-gray-100',
                )}
                imageClassName={cn(
                  'hover:opacity-100',
                  state && state[index] ? 'opacity-100' : 'opacity-25',
                )}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function DuplicateControl() {
  const setNodes = useSetRecoilState(nodesAtom);
  const index = useRecoilValue(selectedNodeIndexAtom);
  return (
    <div className="">
      <div
        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
        onClick={() => {
          setNodes((prev) => {
            if (index === undefined) return prev;
            const elem = prev[index];
            return [
              ...prev.slice(0, index + 1),
              elem,
              ...prev.slice(index + 1),
            ];
          });
        }}
      >
        <IoCopyOutline />
        <span className="grow uppercase"> &ensp;Duplicate Element</span>
      </div>
    </div>
  );
}

function DeleteNodeControl() {
  const index = useRecoilValue(selectedNodeIndexAtom);
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const [selectedNodeIndex, setSelectedNodeIndex] = useRecoilState(
    selectedNodeIndexAtom,
  );
  return (
    <div className="">
      <div
        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
        onClick={() => {
          if (selectedNodeIndex === index) setSelectedNodeIndex(undefined);
          if (index < 0 || index >= nodes.length) return;
          setNodes((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
          });
        }}
      >
        <IconDeleteBin5Line />
        <span className="grow uppercase"> &ensp;Delete</span>
      </div>
    </div>
  );
}

export function RadioSettings() {
  return (
    <div className="flex flex-col gap-4">
      <NodeControl />
      <RequiredControl />
      <OtherControl />
      <PrivacySlider />
      <AnswerTypesSupported />
      <DuplicateControl />
      <DeleteNodeControl />
    </div>
  );
}

export function CheckboxSettings() {
  return (
    <div className="flex flex-col gap-4">
      <NodeControl />
      <RequiredControl />
      <OtherControl />
      <PrivacySlider />
      <AnswerTypesSupported />
      <DuplicateControl />
      <DeleteNodeControl />
    </div>
  );
}

export function TextSettings() {
  return (
    <div className="flex flex-col gap-4">
      <NodeControl />
      <RequiredControl />
      <PrivacySlider />
      <AnswerTypesSupported />
      <DuplicateControl />
      <DeleteNodeControl />
    </div>
  );
}

export function RangeSettings() {
  return (
    <div className="flex flex-col gap-4">
      <NodeControl />
      {/* <RangeControl /> */}
      <RequiredControl />
      <PrivacySlider />
      <AnswerTypesSupported />
      <DuplicateControl />
      <DeleteNodeControl />
    </div>
  );
}

const settingsElementSelector = selector({
  key: 'settingsElementSelector',
  get: ({ get }) => {
    const nodes = get(nodesAtom);
    const index = get(selectedNodeIndexAtom);
    let element = null;

    if (index === undefined) {
      return <></>;
    }
    const { type } = nodes[index];
    const components = {
      radio: <RadioSettings />,
      checkbox: <CheckboxSettings />,
      text: <TextSettings />,
      range: <RangeSettings />,
      default: <></>,
    };
    element = components[type] || components['default'];
    return element;
  },
});

export default function Settings() {
  const element = useRecoilValue(settingsElementSelector);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>{element}</CardContent>
    </Card>
  );
}
