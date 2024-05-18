import React from 'react';
import {
  Range,
  Checkbox,
  Radio,
  InputText,
} from '@/components/form-viewer/form-types';
// import { QuestionWrapper, AnswersWrapper, QuestionTitle } from './styled';

const Question = ({
  content,
  title,
  subtitle,
  control,
  register,
  setValue,
  getValues,
  questionId,
}) => {
  const formType = (item) => {
    switch (item.type) {
      case 'range':
        return (
          <Range
            control={control}
            getValues={getValues}
            setValue={setValue}
            questionId={questionId}
            values={item.values}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            control={control}
            getValues={getValues}
            setValue={setValue}
            questionId={questionId}
            values={item.values}
          />
        );
      case 'radio':
        return (
          <Radio
            control={control}
            getValues={getValues}
            setValue={setValue}
            questionId={questionId}
            values={item.values}
          />
        );
      case 'input':
        return (
          <InputText
            register={register}
            questionId={questionId}
            placeholder={item.placeholder}
          />
        );
      default:
        break;
    }
  };

  return (
    <section className="mx-auto">
      <h3 className="text-xl leading-8 text-center">{title}</h3>
      {subtitle && <h6 className="text-center text-xs">{subtitle}</h6>}
      <div className="mt-8">
        {content.map((item, index) => (
          <div key={index}>{formType(item)}</div>
        ))}
      </div>
    </section>
  );
};

export default Question;
