'use client';
import ModernLayout from '@/layouts/modern/layout';
import SignUp from '@/components/auth/sign-up';
import WelcomeScreen from '@/components/screens/welcomescreen';
import { useContext, useState, useEffect } from 'react';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { SignerProviderContext } from '@/app/shared/signerProvider';

export function ORCPLoading() {
  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-[#6F7175] rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUserSignedIn, loadingProfile } = useContext(ProfileContractContext);
  const { currentAccount } = useContext(SignerProviderContext);

  if (loadingProfile) {
    return <ORCPLoading />;
  } else {
    if (isUserSignedIn) {
      return (
        <>
          <ModernLayout>{children}</ModernLayout>
        </>
      );
    } else if (!isUserSignedIn && currentAccount) {
      return <SignUp />;
    } else {
      return <WelcomeScreen />;
    }
  }
}
