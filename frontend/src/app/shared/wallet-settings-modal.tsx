import Button from '@/components/ui/button';
import Scrollbar from '@/components/ui/scrollbar';
import { useModal } from '@/components/modal-views/context';
import { useContext } from 'react';
import { generateRandomString } from './utils';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import { toast } from 'sonner';
export interface AccountNonceUpdate {
  surveyId: number | null;
  nonce: number;
}

export default function WalletSettingsModal() {
  const { data } = useModal();
  const {
    manually_adjust_nonce_for_organisationAccount,
    manually_adjust_nonce_for_surveyAccount,
  } = useContext(GaslessContractContext);

  const handleClick = async (account: AccountNonceUpdate) => {
    toast.loading('Updating Nonce', { id: 'nonce' });
    if (account.surveyId) {
      const res = await manually_adjust_nonce_for_surveyAccount(
        account.surveyId,
        account.nonce,
      );
      if (res) {
        toast.success('Nonce updated successfully', { id: 'nonce' });
      } else {
        toast.error('Failed to update nonce', { id: 'nonce' });
      }
    } else {
      const res = await manually_adjust_nonce_for_organisationAccount(
        account.nonce,
      );
      if (res) {
        toast.success('Nonce updated successfully', { id: 'nonce' });
      } else {
        toast.error('Failed to update nonce', { id: 'nonce' });
      }
    }
  };

  return (
    <div className="relative z-50 mx-auto h-[600px] w-[540px] max-w-full rounded-lg bg-white px-6 py-6 dark:bg-light-dark">
      <h3 className="mb-5 text-lg font-medium ltr:text-left rtl:text-right">
        Adjust Nonce
      </h3>
      <Scrollbar style={{ height: 'calc(100% - 60px)' }}>
        <div className="ltr:pr-2 rtl:pl-2">
          {data.noncesInfo.map((account: any, index: number) => (
            <div
              className="flex items-center border-b border-dashed border-gray-200 py-4 text-center dark:border-gray-700"
              key={generateRandomString(10)}
            >
              <h2 className="text-md tracking-tighter text-gray-900 ltr:ml-4 rtl:mr-4 dark:text-white">
                {account.surveyId
                  ? `Survey #${account.surveyId}`
                  : `Organisation Account`}
              </h2>
              <Button
                color="white"
                className="shadow-card ltr:ml-auto rtl:mr-auto dark:bg-light-dark md:h-10 md:px-5 xl:h-12 xl:px-7"
                onClick={() => handleClick(account)}
              >
                Update Nonce to {account.nonce}
              </Button>
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}
