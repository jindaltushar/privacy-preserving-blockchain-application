'use client';
import cn from 'classnames';
import Button from '@/components/ui/button';
import AnchorLink from '@/components/ui/links/anchor-link';
import { InfoIcon } from '@/components/icons/info-icon';
import { Instagram } from '@/components/icons/brands/instagram';
import { Twitter } from '@/components/icons/brands/twitter';
import { Facebook } from '@/components/icons/brands/facebook';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { useContext, useEffect, useState } from 'react';
import { isActiveProfileOrganisationAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { useModal } from '@/components/modal-views/context';
interface AuthorInformationProps {
  profileData: any;
  isOtherOrganisation: boolean;
  className?: string;
}

export default function OrganisationAuthorInformation({
  profileData,
  isOtherOrganisation,
  className = 'md:hidden',
}: AuthorInformationProps) {
  const { allProfiles } = useContext(ProfileContractContext);
  var [socials_mapping, setSocials_mapping] = useState([]);
  const { openModal } = useModal();
  var [link_mapping, setLink_mapping] = useState([]);
  const isCurrentProfileOrganisation = useRecoilValue(
    isActiveProfileOrganisationAtom,
  );
  var [month, setMonth] = useState('');
  var [year, setYear] = useState('');
  useEffect(() => {
    //check if selected profile is organisation
    setSocials_mapping([
      {
        id: 1,
        title: `@${profileData.organisationTwitter_handle}`,
        link: 'https://dontbesovasya.io',
        icon: <Twitter className="w-4" />,
      },
      {
        id: 2,
        title: `@${profileData.organisationFacebook_handle}`,
        link: 'https://dontbesovasya.io',
        icon: <Facebook className="w-4" />,
      },
      {
        id: 3,
        title: `@${profileData.organisationInstagram_handle}`,
        link: 'https://dontbesovasya.io',
        icon: <Instagram className="w-4" />,
      },
    ]);
    setLink_mapping([
      {
        id: 1,
        title: '@dontbesovasya',
        link: profileData.organisationExternal_link,
      },
    ]);
    const timestampInMilliseconds = profileData.createdOn * 1000;

    // Create a Date object using the timestamp
    const dateObject = new Date(timestampInMilliseconds);

    // Get the month and year from the Date object
    setMonth(dateObject.toLocaleString('en-US', { month: 'long' }));
    setYear(dateObject.getFullYear().toString());
  }, []);
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
      <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
        <div className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
          Social
        </div>
        {/* {socials_mapping?.map((social: any) => (
          <AnchorLink
            href={social?.link}
            className="mb-2 flex items-center gap-x-2 text-sm tracking-tight text-gray-600 transition last:mb-0 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
            key={`social-key-${social?.id}`}
          >
            {social?.icon}
            {social?.title}
          </AnchorLink>
        ))} */}
      </div>

      {/* Links */}
      <div
        className={cn(
          'border-y  border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6',
        )}
      >
        <div className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
          Links
        </div>
        {/* {link_mapping?.map((item: any) => (
          <AnchorLink
            href={item?.link}
            className="mb-2 flex items-center text-sm tracking-tight text-gray-600 transition last:mb-0 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
            key={`link-key-${item?.id}`}
          >
            {item?.link}
          </AnchorLink>
        ))} */}
      </div>

      {/* Join date */}
      <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
        <div className="text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
          Joined {month} {year}
        </div>
      </div>
      {/* Report button */}
      {/* {isCurrentProfileOrganisation && !isOtherOrganisation && (
        <Button
          color="gray"
          shape="rounded"
          className="w-full dark:bg-gray-600 dark:text-gray-200 dark:hover:text-white m-2"
          // className="mt-5 h-8 font-normal text-gray-600 hover:text-gray-900 dark:bg-gray-600 dark:text-gray-200 dark:hover:text-white md:h-9 md:px-4 lg:mt-6"
          onClick={() => openModal('EDIT_PROFILE')}
        >
          <span className="flex items-center gap-2">
            <InfoIcon className="h-3 w-3" /> Edit Profile
          </span>
        </Button>
      )} */}
      {isCurrentProfileOrganisation && !isOtherOrganisation && (
        <Button
          color="gray"
          shape="rounded"
          className="w-full dark:bg-gray-600 dark:text-gray-200 dark:hover:text-white m-2 p-2"
          // className="mt-5 h-8 font-normal text-gray-600 hover:text-gray-900 dark:bg-gray-600 dark:text-gray-200 dark:hover:text-white md:h-9 md:px-4 lg:mt-6"
          onClick={() =>
            openModal('EDIT_ORGANISATION_MEMBERS', {
              organisationId: profileData.userId,
            })
          }
        >
          <span className="flex items-center gap-2">
            <InfoIcon className="h-3 w-3" /> Edit Members
          </span>
        </Button>
      )}
    </div>
  );
}
