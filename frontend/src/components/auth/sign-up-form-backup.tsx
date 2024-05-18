'use client';

import { useState, useContext, useEffect } from 'react';
import AnchorLink from '@/components/ui/links/anchor-link';
import Checkbox from '@/components/ui/forms/checkbox';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/forms/input';
import InputLabel from '@/components/ui/input-label';
import FileInput from '@/components/ui/file-input';
import Textarea from '@/components/ui/forms/textarea';
// import icons
import { stringToBytes32 } from '@/app/shared/utils';
import { EyeIcon } from '@/components/icons/eye';
import { EyeSlashIcon } from '@/components/icons/eyeslash';
import { Unlocked } from '@/components/icons/unlocked';
import ToggleBar from '@/components/ui/toggle-bar';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { IPFSHash, userSignupRequest } from '@/app/shared/types';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import { set } from 'lodash';
import { toast } from 'sonner';
export default function SignUpForm() {
  const [bio, setBio] = useState('');
  var [multiImages, setMultiImages] = useState<Array<File>>([]);
  var [formDataSubmitted, setFormDataSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  var [multiImagesIpfsHash, setMultiImagesIpfsHash] = useState<Array<IPFSHash>>(
    [],
  );
  const [formData, setFormData] = useState<userSignupRequest>(
    {} as userSignupRequest,
  );
  const { userSignup } = useContext(ProfileContractContext);
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Toggle the isChecked state
  };
  const { gaslessReader } = useContext(GaslessContractContext);

  var { currentAccount } = useContext(SignerProviderContext);
  function handleSubmit(e: any) {
    e.preventDefault();
    if (!isChecked) {
      toast.error('Please agree to the terms and privacy policy.');
      return;
    }
    setLoading(true);
    //console log the form data
    const formDatatemp = new FormData(e.target);
    const data = Object.fromEntries(formDatatemp.entries());
    if (data.firstName == '') {
      toast.error('Please enter first name');
      return;
    }
    setFormData({
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
    });
    setFormDataSubmitted(true);
  }

  useEffect(() => {
    if (formDataSubmitted) {
      console.log(formData);
      const callusersignup = async () => {
        return await userSignup(formData);
      };
      const resp = callusersignup();
      console.log(resp);
      setFormDataSubmitted(false);
    }
  }, [formDataSubmitted]);

  const [socialMediaInfoUnlocked, setSocialMediaInfoUnlocked] = useState(false);

  const handleBioChange = (event) => {
    const inputText = event.target.value;
    // Check if the input text length exceeds 31 characters
    if (inputText.length <= 31) {
      setBio(inputText);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
        <Input
          name="firstName"
          type="text"
          placeholder="First Name"
          inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
          onKeyDown={(e) => {
            if (!/[a-z]/i.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
        <Input
          name="lastName"
          type="text"
          placeholder="Last Name"
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
          subTitle="The description will be included on your profile page.(Max 31 Characters)"
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
          multiImagesIpfsHash={multiImagesIpfsHash}
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
          onChange={() => setSocialMediaInfoUnlocked(!socialMediaInfoUnlocked)}
        >
          {socialMediaInfoUnlocked && (
            <>
              <Input
                name="twitter_handle"
                placeholder='Enter your twitter handle example "UniSwap"'
              />
              <Input
                name="facebook_handle"
                placeholder='Enter your facebook handle example "rihannadaily"'
              />
              <Input
                name="instagram_handle"
                placeholder='Enter your instagram handle example "justinbieber"'
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
          placeholder="https://yoursite.io/"
        />
      </div>
      {/* Password */}
      {/* <div className="relative mb-4">
        <Input
          name="password"
          type={state ? 'text' : 'password'}
          placeholder="Password , Used for account recovery. "
          inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
        />
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
      </div> */}
      {/* Terms and conditions */}
      <Checkbox
        name="terms"
        iconClassName="bg-[#4B5563] rounded mt-0.5"
        label={
          <>
            I’ve read and agree with
            <AnchorLink
              href={'#'}
              className="ml-2 font-medium tracking-[0.5px] underline dark:text-gray-300"
            >
              Terms of Service and our Privacy Policy
            </AnchorLink>
          </>
        }
        labelPlacement="end"
        labelClassName="ml-1.5 text-[#4B5563] !text-xs dark:text-gray-300 tracking-[0.5px] !leading-7"
        containerClassName="!items-start"
        inputClassName="mt-1 focus:!ring-offset-[1px]"
        size="sm"
        checked={isChecked} // Pass the isChecked state as the checked prop
        onChange={handleCheckboxChange} // Handle onChange event
      />
      <Button
        type="submit"
        isLoading={loading}
        className="mt-5 rounded-lg !text-sm uppercase tracking-[0.04em] disabled:text-black"
        disabled={!gaslessReader}
      >
        {gaslessReader ? 'sign up' : 'Error! Kindly Refresh the page.'}
      </Button>
    </form>
  );
}
