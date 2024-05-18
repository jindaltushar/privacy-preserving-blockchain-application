'use client';

import { useState, useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';
import OrganisationAuthorInformation from '@/components/author/organisation-author-information';
import { Check } from '@/components/icons/check';
import { Copy } from '@/components/icons/copy';
import ProfileTab from '@/components/profile/profile-tab';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { useContext } from 'react';
import { getOrganisationFollowers } from '@/app/shared/central-server';
import Button from '@/components/ui/button';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { addFollowing, removeFollowing } from '@/app/shared/central-server';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
export default function OrganisationProfile({
  profileData,
  isOtherOrganisation,
}) {
  const { currentAccount } = useContext(SignerProviderContext);
  const { getIdentity } = useContext(IdentityContext);
  const activeProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  const [copyButtonStatus, setCopyButtonStatus] = useState(false);
  const [followingThisUser, setFollowingThisUser] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [_, copyToClipboard] = useCopyToClipboard();
  function handleCopyToClipboard() {
    copyToClipboard(currentAccount);
    setCopyButtonStatus(true);
    setTimeout(() => {
      setCopyButtonStatus(copyButtonStatus);
    }, 2500);
  }
  useEffect(() => {
    const insidefn = async () => {
      const res = await getOrganisationFollowers(profileData.userId);
      console.log('frmorgpr', res);
      setFollowers(res.length);
      if (!activeProfileOrganisation) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].follower === currentAccount) {
            setFollowingThisUser(true);
            break;
          }
        }
      }
    };
    insidefn();
  }, []);

  const handleFollow = async () => {
    getIdentity().then(async (identity) => {
      if (followingThisUser) {
        await removeFollowing(
          profileData.userId,
          identity.user,
          identity.time,
          identity.rsv.r,
          identity.rsv.s,
          identity.rsv.v,
        );
        setFollowingThisUser(false);
        setFollowers(followers - 1);
      } else {
        await addFollowing(
          profileData.userId,
          identity.user,
          identity.time,
          identity.rsv.r,
          identity.rsv.s,
          identity.rsv.v,
        );
        setFollowingThisUser(true);
        setFollowers(followers + 1);
      }
    });
  };

  return (
    <div className="flex w-full flex-col pt-4 md:flex-row md:pt-10 lg:flex-row 3xl:pt-12">
      <div className="shrink-0 border-dashed border-gray-200 dark:border-gray-700 md:w-72 ltr:md:border-r md:ltr:pr-7 rtl:md:border-l md:rtl:pl-7 lg:ltr:pr-10 lg:rtl:pl-10 2xl:w-80 3xl:w-96 3xl:ltr:pr-14 3xl:rtl:pl-14">
        <div className="text-center ltr:md:text-left rtl:md:text-right">
          <h2 className="text-xl font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl">
            {profileData?.firstName} {profileData?.lastName}
          </h2>
          <div className="mt-1 text-sm font-medium tracking-tighter text-gray-600 dark:text-gray-400 xl:mt-3">
            @
            {profileData?.username ? profileData?.username : 'username not set'}
          </div>
          <div className="md:max-w-auto mx-auto mt-5 flex h-9 max-w-sm items-center rounded-full bg-white shadow-card dark:bg-light-dark md:mx-0 xl:mt-6">
            <div className="inline-flex h-full shrink-0 grow-0 items-center rounded-full bg-gray-900 px-4 text-xs text-white sm:text-sm">
              #{profileData?.userId}
            </div>
            <div className="text truncate text-ellipsis bg-center text-xs text-gray-500 ltr:pl-4 rtl:pr-4 dark:text-gray-300 sm:text-sm">
              {currentAccount}
            </div>
            <div
              title="Copy Address"
              className="flex cursor-pointer items-center px-4 text-gray-500 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              onClick={() => handleCopyToClipboard()}
            >
              {copyButtonStatus ? (
                <Check className="h-auto w-3.5 text-green-500" />
              ) : (
                <Copy className="h-auto w-3.5" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-y border-dashed border-gray-200 py-5 text-center dark:border-gray-700 md:justify-start ltr:md:text-left rtl:md:text-right xl:mt-12 xl:gap-8 xl:py-6">
          {/* <div>
            <div className="mb-1.5 text-lg font-medium tracking-tighter text-gray-900 dark:text-white">
              {authorData?.following}
            </div>
            <div className="text-sm tracking-tighter text-gray-600 dark:text-gray-400">
              Following
            </div>
          </div> */}
          <div>
            <div className="mb-1.5 text-lg font-medium tracking-tighter text-gray-900 dark:text-white">
              {followers}
            </div>
            <div className="text-sm tracking-tighter text-gray-600 dark:text-gray-400">
              Followers
            </div>
          </div>
          {isOtherOrganisation && !activeProfileOrganisation && (
            <Button
              color="white"
              className="shadow-card dark:bg-light-dark md:h-10 md:px-5 xl:h-12 xl:px-7"
              onClick={() => handleFollow()}
            >
              {followingThisUser ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>

        {profileData && (
          <OrganisationAuthorInformation
            profileData={profileData}
            isOtherOrganisation={isOtherOrganisation}
            className="hidden md:block"
          />
        )}
      </div>
      <div className="grow pb-9 pt-6 md:-mt-2.5 md:pb-0 md:pt-1.5 md:ltr:pl-7 md:rtl:pr-7 lg:ltr:pl-10 lg:rtl:pr-10 3xl:ltr:pl-14 3xl:rtl:pr-14">
        {profileData && (
          <ProfileTab
            orgId={profileData.userId}
            isOrganisation={true}
            isOtherOrganisation={isOtherOrganisation}
          />
        )}
      </div>
      {profileData && (
        <OrganisationAuthorInformation
          profileData={profileData}
          isOtherOrganisation={isOtherOrganisation}
        />
      )}
    </div>
  );
}
