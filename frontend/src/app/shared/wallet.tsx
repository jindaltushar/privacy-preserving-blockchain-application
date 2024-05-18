'use client';

import Button from '@/components/ui/button';
import CoinInput from '@/components/ui/coin-input';
import TransactionInfo from '@/components/ui/transaction-info';
// import { Plus } from '@/components/icons/plus';
import ActiveLink from '@/components/ui/links/active-link';
import Trade from '@/components/ui/trade';
import routes from '@/config/routes';
import { useRouter } from 'next/navigation';
import { ChevronDown } from '@/components/icons/chevron-down';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useState, useEffect, useContext } from 'react';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { PriceOracleContext } from '@/contracts-context/PriceOracleContractContext';
import { AddressesOfOrganisation } from '@/app/shared/types';
import { useEthereum } from '@/app/shared/web3-provider';
import { BigNumber } from 'ethers';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  walletSurveyIdAtom,
  walletAmountAtom,
  exchangeOasisUSDPriceAtom,
  preferedCurrencyAtom,
} from '@/stores/atoms';
const WalletPage = () => {
  const router = useRouter();
  const {
    getAddressesOfOrganisation,
    walletTransactFromOrganisation,
    walletTransactFromSurvey,
  } = useContext(GaslessContractContext);
  const [currentActiveTab, setCurrentActiveTab] = useState('fundingAccount');
  const [addressData, setAddressData] = useState<AddressesOfOrganisation>(null);
  const [priceRate, setPriceRate] = useRecoilState(exchangeOasisUSDPriceAtom);
  const preferedCurrency = useRecoilValue(preferedCurrencyAtom);
  const { getPriceIn } = useContext(PriceOracleContext);
  const [accountBalanaces, setAccountBalances] = useState<{}>({});
  const { checkEtherBalance } = useEthereum();
  const [loading, setLoading] = useState(false);
  const [interactWithSurveyId, setInteractWithSurveyId] = useState(null);
  const [interactingValue, setInteractingValue] = useState(0);
  let [surveyId, setSurveyId] = useRecoilState(walletSurveyIdAtom);
  let [amount, setAmount] = useRecoilState(walletAmountAtom);
  let [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    toast.loading('Processing Transaction', { id: 'transaction' });
    setIsProcessing(true);
    if (surveyId == null || surveyId == 0) {
      toast.error('Please select a survey account', { id: 'transaction' });
      setIsProcessing(false);
      return;
    }
    if (Number(amount) == 0) {
      toast.error('Please enter a valid amount', { id: 'transaction' });
      setIsProcessing(false);
      return;
    }
    const largeValue = ethers.utils.parseEther(amount);
    if (currentActiveTab == 'fundingAccount') {
      const AddressOfSurvey = addressData.surveyAccounts.find(
        (item) => item.surveyId == surveyId,
      ).surveyAccount;
      const val = await walletTransactFromOrganisation(
        AddressOfSurvey,
        largeValue,
      );
      if (val) {
        toast.success('Transaction Successful', { id: 'transaction' });
        router.refresh();
      } else {
        setIsProcessing(false);
        toast.error('Transaction Failed', { id: 'transaction' });
      }
    }
    if (currentActiveTab == 'surveyAccount') {
      const val = await walletTransactFromSurvey(
        addressData.orgAddress,
        surveyId,
        largeValue,
      );
      if (val) {
        toast.success('Transaction Successful', { id: 'transaction' });
        router.refresh();
      } else {
        setIsProcessing(false);
        toast.error('Transaction Failed', { id: 'transaction' });
      }
    }
    setIsProcessing(false);
    setLoading(false);
  };

  useEffect(() => {
    const insidefn = async () => {
      const data = await getAddressesOfOrganisation();
      //create new data where all surveyids is converted to number
      var surveyAccountsFixed = [];
      if (
        data &&
        data.orgAddress == '0x0000000000000000000000000000000000000000'
      ) {
        toast.error('Error fetching your accounts');
        return;
      }
      if (data?.surveyAccounts) {
        surveyAccountsFixed = data.surveyAccounts.map((item) => {
          return {
            ...item,
            surveyId: Number(item.surveyId),
          };
        });
      }
      if (!data) {
        toast.error('Error fetching your accounts');
        return;
      }
      const newData = {
        orgAddress: data.orgAddress,
        surveyAccounts: surveyAccountsFixed,
      };
      console.log(newData);
      console.log('orgacc', newData.orgAddress);
      const accbalances = {};
      for (let i = 0; i < newData.surveyAccounts.length; i++) {
        const balance = await checkEtherBalance(
          23295,
          newData.surveyAccounts[i].surveyAccount,
        );
        accbalances[newData.surveyAccounts[i].surveyId] = balance;
        accbalances[newData.surveyAccounts[i].surveyAccount] = balance;
        console.log(
          'setting balance for ',
          newData.surveyAccounts[i].surveyId,
          'to',
          balance,
        );
      }
      const balance = await checkEtherBalance(23295, newData.orgAddress);
      accbalances[newData.orgAddress] = balance;
      setAccountBalances(accbalances);
      setAddressData(newData);
      try {
        setInteractWithSurveyId(newData.surveyAccounts[0].surveyId);
      } catch {
        toast.error(
          'You must have atleast created one survey to access wallet feature.',
        );
        router.push('/');
        return;
      }
    };
    insidefn();
  }, []);

  useEffect(() => {
    const insidefn = async () => {
      var price = await getPriceIn('USD');
      if (preferedCurrency == 'EUR') {
        price = BigNumber.from(String(Math.round(Number(price) * 0.93)));
      }
      console.log('price:', price.toString());
      setPriceRate(price);
    };
    insidefn();
  }, [preferedCurrency]);

  return (
    <>
      {addressData && (
        <Trade
          currentActiveTab={currentActiveTab}
          setCurrentActiveTab={setCurrentActiveTab}
          addressData={addressData}
        >
          <div className="mb-5 border-b border-dashed border-gray-200 pb-5 dark:border-gray-800 xs:mb-7 xs:pb-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="text-sm font-medium -tracking-tighter text-gray-600 dark:text-gray-400">
                Your Address
              </span>
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-sm tracking-tighter dark:bg-gray-800">
                {addressData.orgAddress}
              </span>
            </div>
            <div className="relative flex flex-col gap-3">
              <CoinInput
                label={'From'}
                exchangeRate={priceRate}
                defaultAccountIndex={0}
                data={
                  currentActiveTab == 'surveyAccount'
                    ? addressData.surveyAccounts
                    : [{ surveyId: 0, surveyAccount: addressData.orgAddress }]
                }
                disableSelect={
                  currentActiveTab == 'surveyAccount' ? false : true
                }
                disableInput={false}
                accountBalances={accountBalanaces}
                preferedCurrency={preferedCurrency}
              />
              <div className="absolute left-1/2 top-1/2 z-[1] -ml-4 -mt-4 rounded-full bg-white shadow-large dark:bg-gray-600">
                <Button
                  size="mini"
                  color="gray"
                  shape="circle"
                  variant="transparent"
                >
                  <ChevronDown className="h-auto w-3" />
                </Button>
              </div>
              <CoinInput
                label={'To'}
                exchangeRate={priceRate}
                defaultAccountIndex={0}
                data={
                  currentActiveTab == 'surveyAccount'
                    ? [{ surveyId: 0, surveyAccount: addressData.orgAddress }]
                    : addressData.surveyAccounts
                }
                disableSelect={
                  currentActiveTab == 'surveyAccount' ? true : false
                }
                disableInput={true}
                accountBalances={accountBalanaces}
                preferedCurrency={preferedCurrency}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 xs:gap-[18px]">
            <TransactionInfo
              label={'Funding Account Balance'}
              value={accountBalanaces[addressData.orgAddress] + ' ROSE'}
            />
            <TransactionInfo
              label={'Survey Account Balance'}
              value={
                surveyId != undefined && accountBalanaces[surveyId] != undefined
                  ? accountBalanaces[surveyId] + ' ROSE'
                  : '--'
              }
            />
            <TransactionInfo
              label={'Transaction Cost'}
              value={`0.0150 ROSE/${preferedCurrency == 'USD' ? '$' : '€'} ${(
                Number(ethers.utils.formatUnits(priceRate.toString())) *
                Number(0.015)
              ).toFixed(4)} `}
            />
          </div>
          <div className="mt-6 xs:mt-8">
            <ActiveLink
              aria-disabled={isProcessing}
              href={{
                pathname: routes.liquidityPosition,
              }}
              onClick={(e) => {
                setLoading(true);
                e.preventDefault();
                const fun = async () => {
                  await handleSubmit();
                };
                fun();
              }}
            >
              <Button
                size="large"
                shape="rounded"
                isLoading={loading}
                fullWidth={true}
                className="uppercase"
              >
                Approve Transfer
              </Button>
            </ActiveLink>
          </div>
        </Trade>
      )}
      {!addressData && <div>Loading...</div>}
    </>
  );
};

export default WalletPage;
