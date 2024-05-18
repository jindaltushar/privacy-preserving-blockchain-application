'use client';
import AuthorProfilePage from '@/app/shared/profile';

import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
export default function AuthorProfilePageModern() {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  if (isActiveProfileOrganisation) {
    router.push('/');
  }
  return <AuthorProfilePage />;
}
