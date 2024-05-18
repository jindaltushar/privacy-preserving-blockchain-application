import React from 'react';
import Builder from '@/components/survey/builder';

export default function SurveyComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Builder />
    </>
  );
}
