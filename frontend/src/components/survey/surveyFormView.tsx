'use client';

import React, { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { currentFormIndexAtom, formAtom } from '@/stores/atoms';
import { TextForm } from './text-form';
import { ScrollContainer, ScrollTarget } from './scroll-primitives';
import { NavigateButtons } from './form-primitives';
import { FormProps } from '@/app/shared/types';
import { RadioForm } from './radio-form';
import { RangeForm } from './range-form';
import LinearProgress from '@mui/material/LinearProgress';
import { CheckboxForm } from './checkbox-form';

export default function Form({ data }: { data: FormProps[] }) {
  const [formState, setFormState] = useRecoilState(formAtom);
  const [currentIndex] = useRecoilState(currentFormIndexAtom);
  const { handleSubmit, control, reset, trigger } = useForm();
  const onSubmit = (data: FieldValues) => {
    console.log(data);
    const arrayLike = { ...data, length: formState.length };
    console.log(Array.from(arrayLike));
    reset();
  };

  useEffect(() => {
    setFormState(data);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* <NavigateButtons trigger={trigger} /> */}
      <ScrollContainer>
        {formState?.map((node, index) => {
          const key = `f-el-${index}`;
          return (
            <React.Fragment key={key}>
              <div
                style={{
                  width: `${((currentIndex + 1) * 100) / formState.length}%`,
                }}
                className="h-[6px] bg-brand fixed"
              ></div>
              <ScrollTarget id={`target-${index}`}>
                {node.type === 'text' && (
                  <TextForm index={index} control={control} trigger={trigger} />
                )}
                {node.type === 'radio' && (
                  <RadioForm
                    index={index}
                    control={control}
                    trigger={trigger}
                  />
                )}
                {node.type === 'range' && (
                  <RangeForm
                    index={index}
                    control={control}
                    trigger={trigger}
                  />
                )}
                {node.type === 'checkbox' && (
                  <CheckboxForm
                    index={index}
                    control={control}
                    trigger={trigger}
                  />
                )}
              </ScrollTarget>
            </React.Fragment>
          );
        })}
      </ScrollContainer>
    </form>
  );
}
