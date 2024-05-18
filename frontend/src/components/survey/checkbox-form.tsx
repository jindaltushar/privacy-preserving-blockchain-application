import { type RadioFormProps } from '@/app/shared/types';
import React, { useId } from 'react';
import { Label } from './ui/label';
import {
  Control,
  FieldValues,
  UseFormTrigger,
  useController,
} from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { formAtom } from '@/stores/atoms';
import { FormAlert, SubmitSection } from './form-primitives';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';

export function CheckboxForm({
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

  const { field: typeField } = useController({
    name: `${index}.type`,
    defaultValue: node.type,
    control,
  });

  const {
    field: selectedField,
    formState: { errors },
  } = useController({
    name: `${index}.values`,
    defaultValue: [],
    control,
  });

  const setValue = (selected: string) => {
    setFormNodes((prev) => {
      const elem = prev[index] as RadioFormProps;
      return [
        ...prev.slice(0, index),
        { ...elem, values: { selected } },
        ...prev.slice(index + 1),
      ];
    });
  };

  return (
    <div className="space-y-4 max-w-[420px]">
      <input aria-hidden hidden {...typeField} />
      <div className="space-y-2">
        <p className="text-xl font-medium leading-none">{node.data.qn}</p>
        {(node as RadioFormProps).data.strAns.map((an, i) => (
          <div key={`checkbox-${i}`} className="flex gap-2 items-center">
            <Checkbox
              className="h-[24px] w-[24px]"
              id={`checkbox-item-${i}`}
              value={i.toString()}
              checked={selectedField.value?.includes(i.toString())}
              onCheckedChange={(checked) => {
                return checked
                  ? selectedField.onChange([
                      ...selectedField.value,
                      i.toString(),
                    ])
                  : selectedField.onChange(
                      selectedField.value?.filter(
                        (value: string) => value !== i.toString(),
                      ),
                    );
              }}
            />
            <Label
              className="text-xl font-normal"
              htmlFor={`checkbox-item-${i}`}
            >
              {an}
            </Label>
          </div>
        ))}
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
