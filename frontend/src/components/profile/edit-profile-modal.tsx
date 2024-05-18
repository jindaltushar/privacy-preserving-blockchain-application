'use client';

import { useState, useContext } from 'react';
import Button from '@/components/ui/button/button';
import { useModal } from '@/components/modal-views/context';
import { Close } from '@/components/icons/close';
import Input from '@/components/ui/forms/input';
import InputLabel from '@/components/ui/input-label';
import FileInput from '@/components/ui/file-input';
import Textarea from '@/components/ui/forms/textarea';
import { EyeIcon } from '@/components/icons/eye';
import { EyeSlashIcon } from '@/components/icons/eyeslash';
import { Unlocked } from '@/components/icons/unlocked';
import ToggleBar from '@/components/ui/toggle-bar';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { IPFSHash } from '@/app/shared/types';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { toast } from 'sonner';
import { stringToBytes32 } from '@/app/shared/utils';
export default function ProfileEditModal() {
  var [state, setState] = useState(false);
  var [multiImages, setMultiImages] = useState<Array<File>>([]);
  var [multiImagesIpfsHash, setMultiImagesIpfsHash] = useState<Array<IPFSHash>>(
    [],
  );
  var { currentAccount } = useContext(SignerProviderContext);
  const { updateProfileData, profileData } = useContext(ProfileContractContext);
  const { closeModal } = useModal();
  const [socialMediaInfoUnlocked, setSocialMediaInfoUnlocked] = useState(false);
  const [bio, setBio] = useState('');
  const handleBioChange = (event) => {
    const inputText = event.target.value;
    // Check if the input text length exceeds 31 characters
    if (inputText.length <= 31) {
      setBio(inputText);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.loading('Updating Profile...');
    //disable the button
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const updateRequest = {
      user: currentAccount,
      firstName: stringToBytes32(String(data.firstName)),
      lastName: stringToBytes32(String(data.lastName)),
      bio: stringToBytes32(String(bio)),
      digest:
        multiImagesIpfsHash.length > 0
          ? multiImagesIpfsHash[0].digest
          : stringToBytes32(''),
      hashFunction:
        multiImagesIpfsHash.length > 0
          ? multiImagesIpfsHash[0].hashFunction
          : 0,
      size: multiImagesIpfsHash.length > 0 ? multiImagesIpfsHash[0].size : 0,
      profileAvatar: 0,
      twitter_handle: stringToBytes32(String(data.twitter_handle)),
      facebook_handle: stringToBytes32(String(data.facebook_handle)),
      instagram_handle: stringToBytes32(String(data.instagram_handle)),
      external_link: stringToBytes32(String(data.external_link)),
      password: stringToBytes32(''),
    };
    console.log(updateRequest);
    const res = await updateProfileData(updateRequest);

    if (res) {
      toast.success('Profile Updated Successfully');
      // reload the page
      window.location.reload();
    } else {
      toast.error('Failed to update Profile');
      // enable the button
    }
  };

  return (
    <div className="w-full md:w-[680px]">
      <div className="relative flex flex-grow flex-col overflow-hidden rounded-lg bg-white p-4 shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-dashed pb-6 text-lg font-medium capitalize -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:border-gray-700 dark:text-white lg:text-xl">
          Update Profile
          <Button
            title="Close"
            color="white"
            shape="circle"
            variant="transparent"
            size="small"
            onClick={() => closeModal()}
          >
            <Close className="h-auto w-2.5" />
          </Button>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <Input
              name="firstName"
              type="text"
              placeholder={profileData?.firstName || 'First Name'}
              inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
              onKeyDown={(e: any) => {
                if (!/[a-z]/i.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <Input
              name="lastName"
              type="text"
              placeholder={profileData?.lastName || 'Last Name'}
              inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
              onKeyDown={(e) => {
                if (!/[a-z]/i.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
          {/* <Input
        type="text"
        placeholder="Choose a username"
        inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
      /> */}
          <div>
            <InputLabel
              important
              title="Your Bio"
              subTitle="The description will be included on your profile page."
            />
            <Textarea
              name="bio"
              value={bio}
              onChange={handleBioChange}
              placeholder="I work in NYC and is badminton enthusiast."
            />
          </div>
          <div>
            <InputLabel title="Upload your Profile Picture" />
            <FileInput
              multiple={false}
              accept={'img'}
              placeholder={'Only IMG data allowed.'}
              multiImages={multiImages}
              setMultiImages={setMultiImages}
              // @ts-ignore
              multiImagesIpfsHash={multiImagesIpfsHash}
              // @ts-ignore
              setMultiImagesIpfsHash={setMultiImagesIpfsHash}
            />
          </div>
          {/* Social Media Info */}
          <div>
            <ToggleBar
              title="Social Media Info"
              subTitle="Include your social media info on your profile."
              icon={<Unlocked />}
              checked={socialMediaInfoUnlocked}
              onChange={() =>
                setSocialMediaInfoUnlocked(!socialMediaInfoUnlocked)
              }
            >
              {socialMediaInfoUnlocked && (
                <>
                  <Input
                    name="twitter_handle"
                    placeholder={
                      profileData?.twitter_handle != 'undefined'
                        ? profileData?.twitter_handle
                        : 'Twitter Handle'
                    }
                  />
                  <Input
                    name="facebook_handle"
                    placeholder={
                      profileData?.facebook_handle != 'undefined'
                        ? profileData?.facebook_handle
                        : 'Facebook Handle'
                    }
                  />
                  <Input
                    name="instagram_handle"
                    placeholder={
                      profileData?.instagram_handle != 'undefined'
                        ? profileData?.instagram_handle
                        : 'Instagram Handle'
                    }
                  />
                </>
              )}
            </ToggleBar>
          </div>
          {/* External Link */}
          <div>
            <InputLabel
              title="External link"
              subTitle="You can add a link to your website or social media profile."
            />
            <Input
              name="external_link"
              type="text"
              placeholder={profileData?.external_link || 'https://youtube.com/'}
            />
          </div>
          {/* Password */}
          <div className="relative mb-4">
            {/* <Input
              name="password"
              type={state ? 'text' : 'password'}
              placeholder="Password , Used for account recovery. "
              inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
            /> */}
            <span
              className="absolute bottom-3 right-4 cursor-pointer text-[#6B7280] rtl:left-4 rtl:right-auto sm:bottom-3.5"
              onClick={() => setState(!state)}
            >
              {state ? (
                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </span>
          </div>

          <Button
            type="submit"
            className="mt-5 rounded-lg !text-sm uppercase tracking-[0.04em]"
          >
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
