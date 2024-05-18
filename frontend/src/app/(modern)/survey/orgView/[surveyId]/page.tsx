// export default function OtherUserProfile({
//     params,
//   }: {
//     params: {
//       userid: string;
//     };
//   }) {
//     return <div>Other User Profile {params.userid}</div>;
//   }

//   import React from 'react';
'use client';
import SurveyMasterView from '@/components/survey/SurveyMasterView';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
export default function OrganisationSurveyView({
  params,
}: {
  params: {
    surveyId: string;
  };
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
      <SurveyMasterView surveyId={params.surveyId} />
    </>
  );
}
