import Avatar from '@/components/ui/avatar';
import { useContext } from 'react';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import AvatarIPFS from '@/components/ui/avatar-ipfs';
import UserIMage from '@/assets/images/user.png';

export default function AuthorCard({
  profileData,
  showusername,
}: {
  profileData: any;
  showusername?: boolean;
}) {
  return (
    <div
      className={`flex items-center rounded-lg  ${
        'bg-gray-100  p-5  dark:bg-light-dark mb-3'
        // : 'ml-3 justify-center bg-none p-5 dark:mr-3 dark:bg-none'
      }`}
    >
      {profileData?.profilePhotoHash &&
      profileData?.profilePhotoHash.size != 0 ? (
        <AvatarIPFS hash={profileData?.profilePhotoHash} alt="Author" />
      ) : (
        <Avatar image={UserIMage} alt="Author" />
      )}
      <div className="ltr:pl-3 rtl:pr-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-gray-900 dark:text-white">
          {profileData?.firstName} {profileData?.lastName}
        </h3>
        {showusername && (
          <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
            {profileData?.username ? profileData?.username : 'Individual'}
          </span>
        )}
      </div>
    </div>
  );
}
