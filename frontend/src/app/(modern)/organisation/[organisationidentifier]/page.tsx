'use client';
import { useContext, useEffect } from 'react';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { sendJSONToIPFS, readIPFS } from '@/app/shared/ipfs';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { selectedProfileAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import OrganisationProfilePage from '@/app/shared/organisationProfile';
export default function OrganisationComponent({
  params,
}: {
  params: {
    organisationidentifier: string;
  };
}) {
  return (
    <OrganisationProfilePage
      organisationId={Number(params.organisationidentifier)}
    />
  );
}
