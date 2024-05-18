import { TextFormProps } from '@/app/shared/types';
import React, { useId } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Control,
  FieldValues,
  UseFormTrigger,
  useController,
} from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { formAtom } from '@/stores/atoms';
import { FormAlert, NavigateButtons, SubmitSection } from './form-primitives';

export function TextForm({
  index,
  control,
  trigger,
}: {
  index: number;
  control: Control;
  trigger: UseFormTrigger<FieldValues>;
}) {
  const [formNodes, setFormNodes] = useRecoilState(formAtom);
  const node = formNodes[index];
  const id = useId();

  const { field: typeField } = useController({
    name: `${index}.type`,
    defaultValue: node.type,
    control,
  });

  const {
    field: valueField,
    formState: { errors },
  } = useController({
    name: `${index}.value`,
    defaultValue: '',
    control,
    rules: {
      required: {
        value: node.data.required ?? false,
        message: 'Please fill this in.',
      },
    },
  });

  const setValue = (value: string) => {
    setFormNodes((prev) => {
      const elem = prev[index] as TextFormProps;
      return [
        ...prev.slice(0, index),
        { ...elem, values: { value } },
        ...prev.slice(index + 1),
      ];
    });
  };

  return (
    <div className="space-y-4 max-w-[420px]">
      <input aria-hidden hidden {...typeField} />
      <div className="space-y-2">
        <Label variant="form" htmlFor={id}>
          {node.data.qn}
        </Label>
        <Input
          id={id}
          className="text-xl py-8 px-8"
          placeholder="Type your answer here..."
          {...valueField}
          onChange={(e) => {
            setValue(e.target.value);
            valueField.onChange(e);
          }}
        />
      </div>
      <FormAlert message={(errors[index] as any)?.value?.message} />
      <SubmitSection
        trigger={trigger}
        index={index}
        isSubmitVisible={index === formNodes.length - 1}
      />
    </div>
  );
}
