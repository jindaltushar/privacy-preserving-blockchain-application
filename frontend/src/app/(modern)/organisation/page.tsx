'use client';
import OrganisationProfilePage from '@/app/shared/organisationProfile';

import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
export default function OrganisationProfilePageModern() {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  if (!isActiveProfileOrganisation) {
    router.push('/');
  }
  return <OrganisationProfilePage />;
}
