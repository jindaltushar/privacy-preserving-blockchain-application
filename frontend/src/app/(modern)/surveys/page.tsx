'use client';
import SurveyRespondantView from '@/components/surveyRespondant/SurveyResondantView';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function SurveyRespondantModern() {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  if (isActiveProfileOrganisation) {
    router.push('/');
  }
  return <SurveyRespondantView />;
}
