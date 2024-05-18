import React, { useState, useEffect } from 'react';
import { AddNodeDropdown } from './add-node-dropdown';
import { CheckboxNode } from './checkbox-node';
import {
  MoveupButton,
  MovedownButton,
} from '@/components/survey/surveyButtonsHelper';
import { RadioNode } from '@/components/survey/radio-node';
import { RangeNode } from '@/components/survey/range-node';
import Settings from '@/components/survey/settings';
import { TextNode } from './text-node';
import cn from 'classnames';
import { useRecoilState } from 'recoil';
import { nodesAtom, selectedNodeIndexAtom } from '@/stores/atoms';
import { Transition } from '@/components/ui/transition';

export default function SurveyFormCreate() {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  const containerWidth = `calc(100% - 420px)`; // Calculate the width
  const [selectedNodeIndex, setSelectedNodeIndex] = useRecoilState(
    selectedNodeIndexAtom,
  );
  return (
    <Transition
      show={true}
      enter="transition-opacity duration-250"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-250"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="h-full w-full grid grid-cols-[3fr_1fr] gap-4 px-16 max-md:px-8 max-sm:px-2 py-16 max-md:py-8">
        <div className="col-span-2 w-full space-y-8">
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="w-full text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              What would you like to ask?
            </h1>
            <p className="w-2/3 max-md:w-full text-center leading-7 [&:not(:first-child)]:mt-6">
              Unlock valuable data from your audience by crafting insightful
              surveys tailored to your research or market analysis needs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary h-[2px] flex-grow" />
            <AddNodeDropdown index={-1} />
            <span className="bg-primary h-[2px] flex-grow" />
          </div>
        </div>
        {nodes.map((node, index) => {
          const elements = {
            radio: <RadioNode index={index} />,
            checkbox: <CheckboxNode index={index} />,
            text: <TextNode index={index} />,
            range: <RangeNode index={index} />,
            default: <></>,
          };
          const element = elements[node.type] || elements.default;
          return (
            <div
              key={index}
              className="col-span-2 grid grid-cols-[1fr] gap-4 relative"
            >
              <div className="relative">
                <div className="absolute top-0 -left-10 flex flex-col gap-2 items-center">
                  <MoveupButton index={index} />
                  <MovedownButton index={index} />
                </div>
                <div className="flex flex-col gap-4">
                  <div
                    className={cn(
                      'mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8',
                      index === selectedNodeIndex ? 'shadow-large' : '',
                    )}
                    onMouseDown={() => setSelectedNodeIndex(index)}
                    onFocusCapture={() => setSelectedNodeIndex(index)}
                    style={{ width: containerWidth }}
                  >
                    {element}
                    {nodes[index].error && (
                      <p className="text-destructive">{nodes[index].error}</p>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 "
                  style={{ width: containerWidth }}
                >
                  <span className="bg-primary h-[2px] flex-grow" />
                  <AddNodeDropdown index={index} />
                  <span className="bg-primary h-[2px] flex-grow" />
                </div>
                {selectedNodeIndex === index && (
                  <div
                    className=" absolute right-0 top-0 "
                    style={{ width: '380px', zIndex: 27 }}
                  >
                    <Settings />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Transition>
  );
}
