'use client';
import AdminPage from '@/components/admin/adminPage';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';

export default function NotificationPageModern() {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  if (isActiveProfileOrganisation) {
    router.push('/');
  }
  return <AdminPage />;
}
