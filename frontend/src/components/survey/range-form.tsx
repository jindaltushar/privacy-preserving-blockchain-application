import { type RangeFormProps } from '@/app/shared/types';
import React, { useId } from 'react';
import {
  Control,
  FieldValues,
  UseFormTrigger,
  useController,
} from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { formAtom } from '@/stores/atoms';
import { FormAlert, SubmitSection } from './form-primitives';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function RangeForm({
  index,
  control,
  trigger,
}: {
  index: number;
  control: Control;
  trigger: UseFormTrigger<FieldValues>;
}) {
  const [formNodes, setFormNodes] = useRecoilState(formAtom);
  const node = formNodes[index] as RangeFormProps;
  const id = useId();

  const { field: typeField } = useController({
    name: `${index}.type`,
    defaultValue: node.type,
    control,
  });

  const {
    field: selectedField,
    formState: { errors },
  } = useController({
    name: `${index}.value`,
    defaultValue: '0',
    control,
    rules: {
      required: {
        value: node.data.required ?? false,
        message: 'Please choose one.',
      },
    },
  });

  const setValue = (selected: string) => {
    setFormNodes((prev) => {
      const elem = prev[index] as RangeFormProps;
      return [
        ...prev.slice(0, index),
        { ...elem, values: { values: elem.values?.values ?? [], selected } },
        ...prev.slice(index + 1),
      ];
    });
  };

  return (
    <div className="space-y-4 max-w-[420px]">
      <input aria-hidden hidden {...typeField} />
      <div className="space-y-2">
        <p className="text-xl font-medium leading-none">{node.data.qn}</p>
        <ToggleGroup
          type="single"
          defaultValue={node.values?.selected}
          onValueChange={(e) => {
            setValue(e);
            selectedField.onChange(e);
          }}
        >
          {node.values?.values.map((value, index) => {
            return (
              <React.Fragment key={`toggle-${index}`}>
                <ToggleGroupItem value={index.toString()}>
                  {value}
                </ToggleGroupItem>
              </React.Fragment>
            );
          })}
        </ToggleGroup>
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
