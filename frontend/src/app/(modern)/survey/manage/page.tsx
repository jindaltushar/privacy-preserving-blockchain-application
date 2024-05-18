'use client';
import React from 'react';
import SurveyListView from '@/components/survey/surveyListView';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
export default function SurveyManagePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  if (!isActiveProfileOrganisation) {
    router.push('/');
  }
  return (
    <>
      <SurveyListView />
    </>
  );
}
