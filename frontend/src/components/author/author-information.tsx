'use client';
import cn from 'classnames';
import Button from '@/components/ui/button';
import AnchorLink from '@/components/ui/links/anchor-link';
import { InfoIcon } from '@/components/icons/info-icon';
import { useLayout } from '@/lib/hooks/use-layout';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import { Instagram } from '@/components/icons/brands/instagram';
import { Twitter } from '@/components/icons/brands/twitter';
import { Facebook } from '@/components/icons/brands/facebook';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { useContext, useEffect, useState } from 'react';
import { useModal } from '@/components/modal-views/context';
import { UserHumanityVerificationStatus } from '@/app/shared/types';
import { toast } from 'sonner';
import { requestCivicVerification } from '@/app/shared/central-server';
import { IdentityContext } from '@/app/shared/IdentityContext';
interface AuthorInformationProps {
  className?: string;
}

export default function AuthorInformation({
  className = 'md:hidden',
}: AuthorInformationProps) {
  const { layout } = useLayout();
  const { getIdentity } = useContext(IdentityContext);
  var { profileData, getMyVerificationStatusTx } = useContext(
    ProfileContractContext,
  );
  var [socials_mapping, setSocials_mapping] = useState([]);
  const { openModal } = useModal();
  var [link_mapping, setLink_mapping] = useState([]);
  var [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  var [year, setYear] = useState('');
  useEffect(() => {
    setSocials_mapping([
      {
        id: 1,
        title: `@${profileData?.twitter_handle}`,
        link: `https://twitter.com/${profileData?.twitter_handle}`,
        icon: <Twitter className="w-4" />,
      },
      {
        id: 2,
        title: `@${profileData?.facebook_handle}`,
        link: `https://www.facebook.com/${profileData?.facebook_handle}`,
        icon: <Facebook className="w-4" />,
      },
      {
        id: 3,
        title: `@${profileData?.instagram_handle}`,
        link: `https://www.instagram.com/${profileData?.instagram_handle}`,
        icon: <Instagram className="w-4" />,
      },
    ]);
    setLink_mapping([
      {
        id: 1,
        title: 'external_link',
        link: profileData?.external_link,
      },
    ]);
    const timestampInMilliseconds = profileData?.createdOn * 1000;

    // Create a Date object using the timestamp
    const dateObject = new Date(timestampInMilliseconds);

    // Get the month and year from the Date object
    setMonth(dateObject.toLocaleString('en-US', { month: 'long' }));
    setYear(dateObject.getFullYear().toString());
  }, [profileData]);
  return (
    <div className={`${className}`}>
      {/* Bio */}
      <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
        <div className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
          Bio
        </div>
        <div className="text-sm leading-6 tracking-tighter text-gray-600 dark:text-gray-400">
          {profileData?.bio}
        </div>
      </div>

      {/* Social */}
      {layout !== LAYOUT_OPTIONS.RETRO && (
        <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
          <div className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
            Social
          </div>
          {socials_mapping?.map(
            (social: any) =>
              social?.link !== null &&
              social?.link !== '' &&
              social?.title != '@undefined' &&
              social?.title != '@' && (
                <AnchorLink
                  href={social?.link}
                  target="_blank"
                  className="mb-2 flex items-center gap-x-2 text-sm tracking-tight text-gray-600 transition last:mb-0 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                  key={`social-key-${social?.id}`}
                >
                  {social?.icon}
                  {social?.title}
                </AnchorLink>
              ),
          )}
        </div>
      )}

      {/* Links */}
      <div
        className={cn(
          'border-y  border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6',
        )}
      >
        <div className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
          Links
        </div>
        {link_mapping?.map(
          (item: any) =>
            // Check if item.link is not null or empty
            item?.link !== null &&
            item?.link !== '' && (
              <AnchorLink
                href={item?.link}
                target={'_blank'}
                className="mb-2 flex items-center text-sm tracking-tight text-gray-600 transition last:mb-0 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                key={`link-key-${item?.id}`}
              >
                {item?.link}
              </AnchorLink>
            ),
        )}
      </div>

      {/* Join date */}
      {layout !== LAYOUT_OPTIONS.RETRO && (
        <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
          <div className="text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
            Joined {month} {year}
          </div>
        </div>
      )}
      {/* Report button */}

      <Button
        color="gray"
        className="mt-5 h-8 font-normal text-gray-600 hover:text-gray-900 dark:bg-gray-600 dark:text-gray-200 dark:hover:text-white md:h-9 md:px-4 lg:mt-6"
        onClick={() => openModal('EDIT_PROFILE')}
      >
        <span className="flex items-center gap-2">
          <InfoIcon className="h-3 w-3" /> edit profile
        </span>
      </Button>
      {/* {profileData?.humanityVerificationStatus !==
        UserHumanityVerificationStatus.VERIFIED && (
        <Button
          color="gray"
          isLoading={loading}
          disabled={disabled}
          className="mt-5 h-8 font-normal text-gray-600 hover:text-gray-900 dark:bg-gray-600 dark:text-gray-200 dark:hover:text-white md:h-9 md:px-4 lg:mt-6"
          onClick={async () => {
            const insidefn = async () => {
              setLoading(true);
              const auth = await getIdentity();
              const res = requestCivicVerification(
                profileData?.userId,
                auth?.user,
                auth?.time,
                auth?.rsv.r,
                auth?.rsv.s,
                auth?.rsv.v,
              );
              if (res) {
                setDisabled(true);
                setLoading(false);
                toast.success(
                  'Verification request sent, It may take few minutes to appear on your profile.',
                );
              } else {
                setLoading(false);
                toast.error('Error while sending verification request');
              }
            };
            insidefn();
          }}
        >
          <span className="flex items-center gap-2">
            <InfoIcon className="h-3 w-3" /> verify humanity
          </span>
        </Button>
      )} */}
    </div>
  );
}
