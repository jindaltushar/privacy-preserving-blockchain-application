import Avatar from '@/components/ui/avatar';
import { useModal } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import Scrollbar from '@/components/ui/scrollbar';
import AvatarIPFS from '@/components/ui/avatar-ipfs';
import UserIMage from '@/assets/images/user.png';
import { useContext, useState, useEffect } from 'react';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { removeFollowing } from '@/app/shared/central-server';
import { toast } from 'sonner';
import { generateRandomString } from '@/app/shared/utils';
import InputLabel from '@/components/ui/input-label';
import Input from '@/components/ui/forms/input';
import { set } from 'lodash';

export default function EditMembersModal({ ...props }) {
  const {
    listAllMembersOfOrganisation,
    addUserToOrganisation,
    removeUserFromOrganisation,
  } = useContext(ProfileContractContext);
  const { data } = useModal();
  const [allAddresses, setAllAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState('');
  useEffect(() => {
    const insidefn = async () => {
      const res = await listAllMembersOfOrganisation(data.organisationId);
      setAllAddresses(res);
    };
    insidefn();
  }, []);

  const handleRemove = async (address: string) => {
    setLoading(true);
    const res = await removeUserFromOrganisation(address, data.organisationId);
    if (res) {
      toast.success('User removed successfully');
      const newAddresses = allAddresses.filter((item) => item !== address);
      setAllAddresses(newAddresses);
    } else {
      toast.error('Failed to remove user');
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    setLoading(true);
    const res = await addUserToOrganisation(inputAddress, data.organisationId);
    if (res) {
      toast.success('User added successfully');
      const newAddresses = allAddresses.concat(inputAddress);
      setAllAddresses(newAddresses);
      setInputAddress('');
    } else {
      toast.error('Failed to add user');
    }
    setLoading(false);
  };

  return (
    <div className="relative z-50 mx-auto h-[600px] w-[600px] max-w-full rounded-lg bg-white px-6 py-6 dark:bg-light-dark">
      <h3 className="mb-5 text-lg font-medium ltr:text-left rtl:text-right">
        Add/Remove Members
      </h3>
      <InputLabel
        title="Add Member"
        subTitle="Note - This user will have admin access to your Organisation."
      />
      <Input
        placeholder="Enter address 0x3d3..."
        value={inputAddress}
        onChange={(e) => {
          setInputAddress(e.target.value);
        }}
      />
      <Button
        color="primary"
        variant="solid"
        shape="rounded"
        isLoading={loading}
        className="mt-2 w-full shadow-card dark:bg-light-dark md:h-10 md:px-5 xl:h-12 xl:px-7"
        onClick={() => handleAdd()}
      >
        Add New Member
      </Button>
      <div className="flex items-center border-b border-dashed border-gray-200 py-4 text-center dark:border-gray-700">
        <h2 className="text-md tracking-tighter text-gray-900 ltr:ml-4 rtl:mr-4 dark:text-white">
          Current Members
        </h2>
      </div>
      <Scrollbar style={{ height: 'calc(100% - 60px)' }}>
        <div className="ltr:pr-2 rtl:pl-2">
          {allAddresses?.map((address: any, index: number) => (
            <div
              className="flex items-center border-b border-dashed border-gray-200 py-4 text-center dark:border-gray-700"
              key={index + generateRandomString(10)}
            >
              <h2 className="text-md tracking-tighter text-gray-900 ltr:ml-4 rtl:mr-4 dark:text-white">
                {address}
              </h2>
              <Button
                color="danger"
                isLoading={loading}
                shape="rounded"
                disabled={loading || allAddresses?.length < 2}
                className="shadow-card ltr:ml-auto rtl:mr-auto dark:bg-light-dark md:h-10 md:px-5 xl:h-12 xl:px-7"
                onClick={() => handleRemove(address)}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}
