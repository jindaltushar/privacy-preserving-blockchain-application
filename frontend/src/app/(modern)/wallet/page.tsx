'use client';
import WalletPage from '@/app/shared/wallet';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/navigation';
export default function WalletPageModern() {
  const router = useRouter();
  const isActiveProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  if (!isActiveProfileOrganisation) {
    router.push('/');
  }
  return <WalletPage />;
}
