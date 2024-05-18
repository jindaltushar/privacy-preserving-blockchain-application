'use client';
import { Suspense } from 'react';
import { Fira_Code } from 'next/font/google';
import cn from 'classnames';
import { QueryClientProvider } from '@/app/shared/query-client-provider';
import { ThemeProvider } from '@/app/shared/theme-provider';
import { ProfileContractProvider } from '@/contracts-context/ProfileContractContext';
import { SignerProvider } from '@/app/shared/signerProvider';
import { SurveyContractProvider } from '@/contracts-context/SurveyContractContext';
import ModalsContainer from '@/components/modal-views/container';
import DrawersContainer from '@/components/drawer-views/container';
import SettingsButton from '@/components/settings/settings-button';
import { PriceOracleProvider } from '@/contracts-context/PriceOracleContractContext';
import SettingsDrawer from '@/components/settings/settings-drawer';
// base css file
import 'overlayscrollbars/overlayscrollbars.css';
import 'swiper/css';
import 'swiper/css/pagination';
import '@/assets/css/scrollbar.css';
import '@/assets/css/globals.css';
import '@/assets/css/range-slider.css';
import { IdentityProvider } from '@/app/shared/IdentityContext';
import { GaslessContractProvider } from '@/contracts-context/GaslessContractContext';
import { LoadingOverlayProvider } from '@/app/shared/LoadingOverlayContext';
import EthereumProvider from '@/app/shared/web3-provider';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { RecoilRoot } from 'recoil';
const fira_code = Fira_Code({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={cn('light', fira_code.className)}>
      <head>
        {/* maximum-scale 1 meta tag need to prevent ios input focus auto zooming */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1 maximum-scale=1"
        />
      </head>
      <body>
        <QueryClientProvider>
          <ThemeProvider>
            <RecoilRoot>
              <LoadingOverlayProvider>
                <LoadingOverlay />
                <EthereumProvider>
                  <SignerProvider>
                    <IdentityProvider>
                      <PriceOracleProvider>
                        <GaslessContractProvider>
                          <ProfileContractProvider>
                            <SurveyContractProvider>
                              <SettingsButton />
                              <SettingsDrawer />
                              <Suspense fallback={null}>
                                <ModalsContainer />
                                <DrawersContainer />
                              </Suspense>
                              {children}
                            </SurveyContractProvider>
                          </ProfileContractProvider>
                        </GaslessContractProvider>
                      </PriceOracleProvider>
                    </IdentityProvider>
                  </SignerProvider>
                </EthereumProvider>
              </LoadingOverlayProvider>
            </RecoilRoot>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
