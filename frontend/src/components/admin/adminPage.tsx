'use client';

import { useRecoilValue } from 'recoil';
import { profileAdminRolesAtom } from '@/stores/atoms';
import { useState, useContext, useEffect } from 'react';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { UserHumanityVerificationStatus } from '@/app/shared/types';
import Datepicker, { DateRangeType } from 'react-tailwindcss-datepicker';
import Input from '@/components/ui/forms/input';
import Button from '@/components/ui/button';
import { generateRandomString } from '@/app/shared/utils';
import { toast } from 'sonner';
import { set } from 'lodash';
interface HumanityStatusUpdateObject {
  user: number;
  humanityStatus: UserHumanityVerificationStatus;
  validTill: {
    startDate: string;
    endDate: string;
  };
}
export default function AdminPage() {
  const adminRoles = useRecoilValue(profileAdminRolesAtom);
  const [loading, setLoading] = useState(false);
  const { adminUpdateUserVerificationStatus } = useContext(
    ProfileContractContext,
  );
  const [humanityStatus, setHumanityStatus] = useState<
    HumanityStatusUpdateObject[]
  >([]);

  function addNewUser() {
    console.log('clicked');
    setHumanityStatus([
      ...humanityStatus,
      {
        user: 0,
        humanityStatus: UserHumanityVerificationStatus.VERIFIED,
        validTill: {
          startDate: 'a',
          endDate: 'a',
        },
      },
    ]);
  }

  function deleteUser(index: number) {
    setHumanityStatus([
      ...humanityStatus.slice(0, index),
      ...humanityStatus.slice(index + 1),
    ]);
  }

  function updateUserHumanity(key: number, type: string, newval: any) {
    if (type == 'date') {
      setHumanityStatus([
        ...humanityStatus.slice(0, key),
        {
          ...humanityStatus[key],
          validTill: newval,
        },
        ...humanityStatus.slice(key + 1),
      ]);
    }
    if (type == 'user') {
      setHumanityStatus([
        ...humanityStatus.slice(0, key),
        {
          ...humanityStatus[key],
          user: newval,
        },
        ...humanityStatus.slice(key + 1),
      ]);
    }
  }

  async function submitUpdate() {
    //create a list of list from humanityStatus
    var users = [];
    var humanitystatus = [];
    var validtill = [];
    if (humanityStatus.length == 0) {
      toast.error('No users to update');
      return;
    }
    setLoading(true);
    toast.loading('Updating the humanity verification status', {
      id: 'updateHumanityStatus',
    });
    humanityStatus.map((user) => {
      users.push(Number(user.user));
      humanitystatus.push(user.humanityStatus);
      validtill.push(new Date(user.validTill.startDate).getTime() / 1000);
    });
    console.log('users', users);
    console.log('humanitystatus', humanitystatus);
    console.log('validtil', validtill);
    const res = await adminUpdateUserVerificationStatus(
      users,
      humanitystatus,
      validtill,
    );
    if (res) {
      toast.success('Successfully updated the humanity verification status', {
        id: 'updateHumanityStatus',
      });
      setHumanityStatus([]);
      setLoading(false);
    } else {
      toast.error('Failed to update the humanity verification status', {
        id: 'updateHumanityStatus',
      });
      setLoading(false);
    }
  }
  return (
    <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
      <span className="text-lg">
        {' '}
        <Button shape="pill" size="mini" color="gray" className="mr-4">
          Role: <b>Verifier</b>
        </Button>
        Add Humanity Verification for Users
      </span>
      <div className=" border-b border-gray-200 dark:border-gray-700 my-4"></div>
      {humanityStatus.map((user, index) => {
        return (
          <div
            key={generateRandomString(10)}
            className=" grid grid-cols-3 gap-4"
          >
            <div className={'mt-2 '}>
              <Input
                type="number"
                useUppercaseLabel={false}
                label="Input the UserId"
                defaultValue={user.user}
                onBlur={(e) =>
                  updateUserHumanity(index, 'user', e.target.value)
                }
                inputClassName="sm:!h-10"
              />
            </div>
            <div className={'mt-2 text-xs sm:text-sm'}>
              <span
                className={
                  'block font-medium tracking-widest dark:text-gray-100 mb-2'
                }
              >
                Choose the Expiry
              </span>
              <Datepicker
                useRange={false}
                asSingle={true}
                value={user.validTill}
                onChange={(val) => updateUserHumanity(index, 'date', val)}
                minDate={new Date()}
              />
            </div>
            <div className="self-end">
              <Button
                className={'h-10'}
                shape="rounded"
                onClick={() => deleteUser(index)}
              >
                Delete
              </Button>
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Button shape="rounded" onClick={() => addNewUser()}>
            Add New
          </Button>
        </div>
        <div>
          <div className="grid justify-items-end">
            <Button
              shape="rounded"
              isLoading={loading}
              onClick={() => submitUpdate()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
