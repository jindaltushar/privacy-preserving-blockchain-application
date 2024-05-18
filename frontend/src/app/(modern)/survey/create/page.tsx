'use client';
import React from 'react';
import Builder from '@/components/survey/builder';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
export default function SurveyCreateComponent({
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
      <Builder />
    </>
  );
}
