import Avatar from '@/components/ui/avatar';
import { useModal } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import Scrollbar from '@/components/ui/scrollbar';
import AvatarIPFS from '@/components/ui/avatar-ipfs';
import UserIMage from '@/assets/images/user.png';
import { useContext } from 'react';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { removeFollowing } from '@/app/shared/central-server';
import { toast } from 'sonner';
export default function Followers({ ...props }) {
  const { getIdentity } = useContext(IdentityContext);
  const { data } = useModal();
  console.log(data);
  const handleRemove = async (orgId: number) => {
    getIdentity().then(async (identity) => {
      const res = await removeFollowing(
        orgId,
        identity.user,
        identity.time,
        identity.rsv.r,
        identity.rsv.s,
        identity.rsv.v,
      );
      if (res) {
        console.log('removed');
        //reload the page
        window.location.reload();
      } else {
        toast.error('Failed to remove');
      }
    });
  };
  return (
    <div className="relative z-50 mx-auto h-[600px] w-[540px] max-w-full rounded-lg bg-white px-6 py-6 dark:bg-light-dark">
      <h3 className="mb-5 text-lg font-medium ltr:text-left rtl:text-right">
        {data.modalTitle} ({data.users && data.users?.count})
      </h3>
      <Scrollbar style={{ height: 'calc(100% - 60px)' }}>
        <div className="ltr:pr-2 rtl:pl-2">
          {data.users?.map((user: any, index: number) => (
            <div
              className="flex items-center border-b border-dashed border-gray-200 py-4 text-center dark:border-gray-700"
              key={user.orgId + index}
            >
              {data.users &&
                data.users?.profilePic &&
                data.users?.profilePic.size != 0 && (
                  <AvatarIPFS
                    hash={data.users?.profilePic}
                    // size="sm"
                    alt="Author"
                    // className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              {data.users &&
                data.users?.profilePic &&
                data.users?.profilePic.size == 0 && (
                  <Avatar
                    // size="xl"
                    image={UserIMage}
                    alt="Author"
                    // className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              <h2 className="text-md tracking-tighter text-gray-900 ltr:ml-4 rtl:mr-4 dark:text-white">
                {user?.username}
              </h2>
              <Button
                color="white"
                className="shadow-card ltr:ml-auto rtl:mr-auto dark:bg-light-dark md:h-10 md:px-5 xl:h-12 xl:px-7"
                onClick={() => handleRemove(user?.orgId)}
              >
                Unfollow
              </Button>
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}
