'use client';

import { useRecoilState } from 'recoil';
import Form from '@/components/survey/surveyFormView';
import { Node } from '@/app/shared/types';
import { formAtom } from '@/stores/atoms';
import { useEffect } from 'react';
import { nodeToFormState } from '@/app/shared/utils';

const nodes: Node[] = [
  {
    type: 'checkbox',
    data: {
      qn: 'Please select your favorite colors',
      required: true,
      strAns: ['red', 'green', 'blue'],
    },
  },
  {
    type: 'text',
    data: {
      qn: "What's your favorite color?",
      required: true,
    },
  },
  {
    type: 'range',
    data: {
      qn: 'Please rate your favorite colors',
      required: true,
      type: '0-10',
    },
  },
  {
    type: 'radio',
    data: {
      qn: 'Please select your favorite color',
      required: true,
      strAns: ['red', 'green', 'blue'],
    },
  },
];

function FormWrapper() {
  const [formData, setFormState] = useRecoilState(formAtom);
  useEffect(() => setFormState(nodeToFormState(nodes)), []);

  return (
    <>
      <Form data={formData} />
    </>
  );
}

export default function Page() {
  return <FormWrapper />;
}
