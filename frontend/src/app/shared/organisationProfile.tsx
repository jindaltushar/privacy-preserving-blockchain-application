'use client';
import Image from '@/components/ui/image';
import AvatarIPFS from '@/components/ui/avatar-ipfs';
import Avatar from '@/components/ui/avatar';
import OrganisationProfile from '@/components/profile/oragnisationProfile';
import UserIMage from '@/assets/images/user.png';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
// static data
import { authorData } from '@/data/static/author';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { useContext, useEffect, useState } from 'react'; // Import useEffect and useState
// import { readIPFS } from '@/app/shared/ipfs';
import { User } from '@/app/shared/types';
const OrganisationProfilePage = ({
  organisationId,
}: {
  organisationId?: number;
}) => {
  const router = useRouter();
  const { allProfiles, getOrganisationView } = useContext(
    ProfileContractContext,
  );
  const [profileData, setProfileData] = useState(null);
  const [otherOrganisationData, setOtherOrganisationData] = useState(null);
  const [isOtherOrganisation, setIsOtherOrganisation] = useState(false);
  useEffect(() => {
    if (!organisationId) {
      //check if selected profile is organisation
      const selectedProfile = allProfiles.find(
        (profile) => profile.selected === true,
      );
      //check if selected profile is organisation
      if (selectedProfile?.isOrganisation) {
        setProfileData({
          profilePhotoHash: selectedProfile?.value.organisationProfilePhotoHash,
          firstName: selectedProfile?.value.organisationName,
          lastName: '',
          username: selectedProfile?.value.username,
          userId: selectedProfile?.value.organisationId,
          organisationTwitter_handle:
            selectedProfile?.value.organisationTwitter_handle,
          organisationFacebook_handle:
            selectedProfile?.value.organisationFacebook_handle,
          organisationInstagram_handle:
            selectedProfile?.value.organisationInstagram_handle,
          organisationExternal_link:
            selectedProfile?.value.organisationExternal_link,
          bio: selectedProfile?.bio,
          createdOn: selectedProfile?.value.createdOn,
        });
        console.log(
          'selectedProfile?.createdOn',
          selectedProfile?.value.createdOn,
        );
        setIsOtherOrganisation(false);
      }
    } else {
      getOrganisationView(organisationId).then((data) => {
        if (data.createdOn == 0) {
          toast.error('Organisation not found');
          router.push('/');
        }
        const newOrgData = {
          profilePhotoHash: data.organisationProfilePhotoHash,
          firstName: data.organisationName,
          lastName: '',
          username: data.username,
          userId: data.organisationId,
          organisationTwitter_handle: data.organisationTwitter_handle,
          organisationFacebook_handle: data.organisationFacebook_handle,
          organisationInstagram_handle: data.organisationInstagram_handle,
          organisationExternal_link: data.organisationExternal_link,
          bio: data.organisationBioText,
          createdOn: data.createdOn,
        };
        console.log('received other org data :', newOrgData);
        setProfileData(newOrgData);
        setIsOtherOrganisation(true);
      });
    }
  }, []);
  return (
    <>
      <div className="relative h-36 w-full overflow-hidden rounded-lg sm:h-44 md:h-64 xl:h-80 2xl:h-96 3xl:h-[448px]">
        <Image
          src={authorData?.cover_image?.thumbnail}
          placeholder="blur"
          quality={100}
          className="!h-full w-full !object-cover"
          alt="Cover Image"
        />
      </div>
      <div className="mx-auto flex w-full shrink-0 flex-col md:px-4 xl:px-6 3xl:max-w-[1700px] 3xl:px-12">
        {profileData &&
          profileData?.profilePhotoHash &&
          profileData?.profilePhotoHash.size != 0 && (
            <AvatarIPFS
              hash={profileData?.profilePhotoHash}
              size="xl"
              alt="Author"
              className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
            />
          )}
        {profileData &&
          profileData?.profilePhotoHash &&
          profileData?.profilePhotoHash.size == 0 && (
            <Avatar
              size="xl"
              image={UserIMage}
              alt="Author"
              className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
            />
          )}
        {profileData && (
          <OrganisationProfile
            profileData={profileData}
            isOtherOrganisation={isOtherOrganisation}
          />
        )}
      </div>
    </>
  );
};

export default OrganisationProfilePage;
