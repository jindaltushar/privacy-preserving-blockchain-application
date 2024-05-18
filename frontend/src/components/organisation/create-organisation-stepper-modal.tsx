'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import Button from '@/components/ui/button/button';
import { useModal } from '@/components/modal-views/context';
import { Close } from '@/components/icons/close';
import Text from '@/components/ui/text';
import { OrganisationCreationRequest } from '@/app/shared/types';
import Input from '@/components/ui/forms/input';
import InputLabel from '@/components/ui/input-label';
import FileInput from '@/components/ui/file-input';
import Textarea from '@/components/ui/forms/textarea';
import AnchorLink from '@/components/ui/links/anchor-link';
import Checkbox from '../ui/forms/checkbox';
import { stringToBytes32 } from '@/app/shared/utils';
import { sendJSONToIPFS } from '@/app/shared/ipfs';
import { toast } from 'sonner';
import { IPFSHash } from '@/app/shared/types';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
type TagProps = {
  label: string;
  link: string;
  handleChange?: (e: any, key: string) => void;
  formData?: OrganisationCreationRequest;
};

const tags = [
  {
    label: 'Technology',
    link: '#',
  },
  {
    label: 'Education',
    link: '#',
  },
  {
    label: 'Health and Wellness',
    link: '#',
  },
  {
    label: 'Environment',
    link: '#',
  },
  {
    label: 'Finance',
    link: '#',
  },
  {
    label: 'Arts and Culture',
    link: '#',
  },
  {
    label: 'Science',
    link: '#',
  },
  {
    label: 'Marketing',
    link: '#',
  },
  {
    label: 'Food and Agriculture',
    link: '#',
  },
  {
    label: 'Fashion',
    link: '#',
  },
  {
    label: 'Sports',
    link: '#',
  },
  {
    label: 'Travel',
    link: '#',
  },
  {
    label: 'Nonprofit and Social Services',
    link: '#',
  },
  {
    label: 'Government',
    link: '#',
  },
  {
    label: 'Manufacturing',
    link: '#',
  },
  {
    label: 'Entertainment',
    link: '#',
  },
  {
    label: 'Law',
    link: '#',
  },
  {
    label: 'Spiritual',
    link: '#',
  },
  {
    label: 'Community',
    link: '#',
  },
];

export function Tag({ label, link, handleChange, formData }: TagProps) {
  var [active, setActive] = useState(false);
  useEffect(() => {
    if (formData?.tagsIds?.includes(parseInt(link))) {
      setActive(true);
    }
  }, []);
  return (
    <AnchorLink
      onClick={(e) => {
        handleChange(e, 'Tag_' + link);
        setActive(!active);
      }}
      href={link}
      className={
        active
          ? 'mr-2.5 mt-2.5 inline-flex transform rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium tracking-tighter text-gray-900 shadow-light outline-none transition-transform duration-200 last:mr-0 hover:-translate-y-0.5 hover:bg-gray-50 focus:-translate-y-0.5 focus:bg-gray-50 dark:bg-gray-800 dark:text-white xs:mr-3 xs:mt-3 xs:px-3 xs:py-2 xs:text-sm border-4 border-black dark:border-white'
          : 'mr-2.5 mt-2.5 inline-flex transform rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium tracking-tighter text-gray-900 shadow-light outline-none transition-transform duration-200 last:mr-0 hover:-translate-y-0.5 hover:bg-gray-50 focus:-translate-y-0.5 focus:bg-gray-50 dark:bg-gray-800 dark:text-white xs:mr-3 xs:mt-3 xs:px-3 xs:py-2 xs:text-sm'
      }
    >
      {label}
    </AnchorLink>
  );
}
function BasicInfoHTML({
  multiImages,
  setMultiImages,
  multiImagesIpfsHash,
  setMultiImagesIpfsHash,
  handleChange,
  formData,
}: {
  multiImages: Array<File>;
  setMultiImages: (images: Array<File>) => void;
  multiImagesIpfsHash: Array<IPFSHash>;
  setMultiImagesIpfsHash: (images: Array<IPFSHash>) => void;
  handleChange: (e: any, key: string) => void;
  formData: OrganisationCreationRequest;
}) {
  return (
    <div>
      <Input
        name="organisationUserName"
        type="text"
        className="mb-4 mr-4"
        defaultValue={formData.organisationUserName || null}
        placeholder="Choose a Unique Username for your Organisation"
        inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
        // suffix="Username already taken"
        suffixClassName="text-xs text-red-500 justify-end"
        onKeyDown={(e) => {
          if (!/[a-z\s]/i.test(e.key) || e.key === ' ') {
            e.preventDefault();
          }
        }}
        onBlur={(e) => handleChange(e, 'organisationUserName')}
      />
      <Input
        name="organisationName"
        type="text"
        value={formData.organisationName || null}
        placeholder="Organisation Name"
        className="mb-4 mr-4"
        inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
        onKeyDown={(e) => {
          if (!/[a-z\s]/i.test(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => handleChange(e, 'organisationName')}
      />
      <Textarea
        name="bio"
        className="mb-4 mr-4"
        defaultValue={formData.organisationBioText || null}
        placeholder="What would you tell others about your Organisation?"
        onBlur={(e) => handleChange(e, 'organisationBioText')}
      />
      <div>
        <InputLabel title="Upload Organisation Logo" />
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
    </div>
  );
}

function SocialMedia({
  handleChange,
  formData,
}: {
  handleChange: (e: any, key: string) => void;
  formData: OrganisationCreationRequest;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Input
          name="twitter_handle"
          type="text"
          value={formData.organisationTwitter_handle || null}
          placeholder="Twitter Handle"
          inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
          onChange={(e) => handleChange(e, 'organisationTwitter_handle')}
        />
        <Input
          name="facebook_handle"
          type="text"
          value={formData.organisationFacebook_handle || null}
          placeholder="Facebook Handle"
          inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
          onChange={(e) => handleChange(e, 'organisationFacebook_handle')}
        />
        <Input
          name="instagram_handle"
          type="text"
          value={formData.organisationInstagram_handle || null}
          placeholder="Instagram Handle"
          inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
          onChange={(e) => handleChange(e, 'organisationInstagram_handle')}
        />
      </div>
      <Input
        name="external_link"
        type="text"
        value={formData.organisationExternal_link || null}
        placeholder="External Link"
        inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
        onChange={(e) => handleChange(e, 'organisationExternal_link')}
      />
    </div>
  );
}

function Tags({
  handleChange,
  formData,
}: {
  handleChange: (e: any, key: string) => void;
  formData: OrganisationCreationRequest;
}) {
  return (
    <>
      {tags.map((tag, index) => (
        <Tag
          key={index}
          label={tag.label}
          link={String(index + 1)}
          handleChange={handleChange}
          formData={formData}
        />
      ))}
    </>
  );
}

function Requirements({
  handleChange,
  formData,
  terms,
}: {
  handleChange: (e: any, key: string) => void;
  formData: OrganisationCreationRequest;
  terms: Array<boolean>;
}) {
  return (
    <>
      <Checkbox
        name="terms1"
        onChange={(e) => handleChange(e, 'terms1')}
        iconClassName="bg-[#4B5563] rounded mt-0.5"
        label={
          <>
            I’ve read and understood how to use the application given in
            <AnchorLink
              href={'https://docs.orcp.app/application-guide/for-organisations'}
              target="_blank"
              className="ml-2 font-medium tracking-[0.5px] underline dark:text-gray-300"
            >
              Guide for Organisations
            </AnchorLink>
          </>
        }
        labelPlacement="end"
        labelClassName="ml-1.5 text-[#4B5563] !text-xs dark:text-gray-300 tracking-[0.5px] !leading-7"
        containerClassName="!items-start"
        inputClassName="mt-1 focus:!ring-offset-[1px]"
        size="sm"
      />
      <Checkbox
        name="terms2"
        onChange={(e) => handleChange(e, 'terms2')}
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
      />
    </>
  );
}

const stepperContent = [
  {
    id: 1,
    title: 'Basic Information',
    content: BasicInfoHTML,
  },
  {
    id: 2,
    title: 'Social Media',
    content: SocialMedia,
  },
  {
    id: 3,
    title: 'Tags and Keywords',
    content: Tags,
  },
  {
    id: 4,
    title: 'Just some additional formalities',
    content: Requirements,
  },
];

function Stepper({
  currentTab,
  className,
  multiImages,
  setMultiImages,
  multiImagesIpfsHash,
  setMultiImagesIpfsHash,
  handleChange,
  formData,
  terms,
}: {
  currentTab: number;
  className?: string;
  multiImages: Array<File>;
  setMultiImages: (images: Array<File>) => void;
  multiImagesIpfsHash: Array<IPFSHash>;
  setMultiImagesIpfsHash: (images: Array<IPFSHash>) => void;
  handleChange: (e: any, key: string) => void;
  formData: OrganisationCreationRequest;
  terms: Array<boolean>;
}) {
  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {stepperContent.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <div key={item.id} className="text-start">
            <Text
              tag="h5"
              className={cn(
                'mb-4 text-base font-medium text-gray-500',
                isActive && '!text-brand dark:!text-gray-100',
              )}
            >{`${item.id}. ${item.title}`}</Text>

            {isActive && (
              <AnimatePresence>
                <motion.div
                  layout
                  initial="exit"
                  animate="enter"
                  exit="exit"
                  variants={fadeInBottom('easeIn', 0.25, 16)}
                >
                  <Text className="ps-8 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {item.id === 1 ? (
                      <BasicInfoHTML
                        multiImages={multiImages}
                        setMultiImages={setMultiImages}
                        multiImagesIpfsHash={multiImagesIpfsHash}
                        setMultiImagesIpfsHash={setMultiImagesIpfsHash}
                        handleChange={handleChange}
                        formData={formData}
                      />
                    ) : item.id === 2 ? (
                      <SocialMedia
                        handleChange={handleChange}
                        formData={formData}
                      />
                    ) : item.id === 3 ? (
                      <Tags handleChange={handleChange} formData={formData} />
                    ) : (
                      <Requirements
                        handleChange={handleChange}
                        formData={formData}
                        terms={terms}
                      />
                    )}
                  </Text>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function createOrganisationStepper() {
  const { closeModal } = useModal();
  var { createOrganisation, checkUserNameAvailability } = useContext(
    ProfileContractContext,
  );
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [formData, setFormData] = useState({} as OrganisationCreationRequest);
  var [multiImages, setMultiImages] = useState<Array<File>>([]);
  var [multiImagesIpfsHash, setMultiImagesIpfsHash] = useState<Array<IPFSHash>>(
    [],
  );
  var [terms, setTerms] = useState([false, false]);
  const totalTabCount = stepperContent.length;
  const handledNextTabChange = (e: any) => {
    if (current === totalTabCount) {
      handleFormSubmit(e);
      return;
    }
    current < totalTabCount && setCurrent((prev) => prev + 1);
  };
  const handledPrevTabChange = () => {
    current > 1 && setCurrent((prev) => prev - 1);
  };

  const handleFormSubmit = async (e: any) => {
    if (!terms[0] || !terms[1]) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    if (!formData.organisationName || !formData.organisationBioText) {
      toast.error('Please fill Organisation Name and Bio');
      return;
    }
    if (!formData.organisationUserName) {
      toast.error('Please fill Organisation Username');
      return;
    }
    if (formData.organisationUserName.length < 5) {
      toast.error('Username should be more than 5 characters');
      return;
    }
    setLoading(true);
    e.target.disabled = true;
    console.log(formData);
    // add organisationBio to ipfs
    const jsonObj = { orgbio: formData.organisationBioText };
    const organisationBioIPFSHash = await sendJSONToIPFS(jsonObj);
    toast.loading('Creating Organisation', { id: 'loading-toast' });
    var request = {
      organisationUserName: stringToBytes32(formData.organisationUserName),
      organisationName: stringToBytes32(formData.organisationName),
      organisationBioText: formData.organisationBioText,
      organisationProfilePhotoHash:
        multiImagesIpfsHash.length > 0
          ? multiImagesIpfsHash[0]
          : { digest: stringToBytes32(''), hashFunction: 0, size: 0 },
      organisationProfileAvatar: 0,
      organisationTwitter_handle: formData.organisationTwitter_handle
        ? stringToBytes32(formData.organisationTwitter_handle)
        : stringToBytes32(''),
      organisationFacebook_handle: formData.organisationFacebook_handle
        ? stringToBytes32(formData.organisationFacebook_handle)
        : stringToBytes32(''),
      organisationInstagram_handle: formData.organisationInstagram_handle
        ? stringToBytes32(formData.organisationInstagram_handle)
        : stringToBytes32(''),
      organisationExternal_link: formData.organisationExternal_link
        ? stringToBytes32(formData.organisationExternal_link)
        : stringToBytes32(''),
      tagsIds: formData.tagsIds || [],
      organisationBioIPFSHash: organisationBioIPFSHash,
    };
    console.log(request);
    try {
      createOrganisation(request).then((res) => {
        console.log(res);
        if (res) {
          toast.success('Organisation Created', { id: 'loading-toast' });
          setLoading(false);
          closeModal();

          // reload the page
          window.location.reload();
        } else {
          toast.error('Error Creating Organisation', { id: 'loading-toast' });
          setLoading(false);
        }
      });
    } catch {
      toast.error('Error Creating Organisation', { id: 'loading-toast' });
      setLoading(false);
    }
  };

  function handleChange(e: any, key: string) {
    e.preventDefault();
    if (key.includes('Tag_')) {
      var tag_id = parseInt(key.split('_')[1]);
      var tag_ids = formData.tagsIds;
      if (!tag_ids) tag_ids = [];
      if (tag_ids.includes(tag_id)) {
        tag_ids = tag_ids.filter((item) => item !== tag_id);
      } else {
        tag_ids.push(tag_id);
      }
      setFormData({ ...formData, tagsIds: tag_ids });
    } else if (key.includes('terms')) {
      var term_id = parseInt(key.split('terms')[1]) - 1;
      var temp = terms;
      temp[term_id] = e.target.checked;
      setTerms(temp);
    } else if (key === 'organisationUserName') {
      // check if size of organisationUserName is more than 31 then return
      if (e.target.value.length > 31) {
        return toast.error('Username should be less than 31 characters', {
          id: 'checking-username',
        });
      }
      if (e.target.value.length < 5) {
        return toast.error('Username should be more than 5 characters', {
          id: 'checking-username',
        });
      }
      toast.loading('Checking Username', { id: 'checking-username' });
      e.target.disabled = true;
      var username = e.target.value;
      checkUserNameAvailability(username).then((res) => {
        if (res) {
          toast.success('Username is available', { id: 'checking-username' });
          setFormData({ ...formData, [key]: e.target.value });
        } else {
          toast.error('Username is already taken', { id: 'checking-username' });
        }
        e.target.disabled = false;
        // set suffix property on e.target
        e.target.suffix = !res && 'Username already taken';
      });
    } else if (key == 'organisationBioText') {
      if (e.target.value.length > 200) {
        return toast.error('Bio should be less than 200 characters', {
          id: 'checking-bio',
        });
      } else {
        setFormData({ ...formData, [key]: e.target.value });
      }
    } else {
      setFormData({ ...formData, [key]: e.target.value });
    }
  }
  return (
    <div className="w-full md:w-[880px]">
      <div className="relative flex flex-grow flex-col overflow-hidden rounded-lg bg-white p-4 shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark md:p-8">
        <div className="mb-8 flex items-center justify-between border-b border-dashed pb-6 text-lg font-medium capitalize -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:border-gray-700 dark:text-white lg:text-xl">
          Lets setup your Organisation
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

        <div className=" items-start gap-9 sm:items-center">
          <Stepper
            currentTab={current}
            className="order-2 sm:order-1"
            multiImages={multiImages}
            setMultiImages={setMultiImages}
            multiImagesIpfsHash={multiImagesIpfsHash}
            setMultiImagesIpfsHash={setMultiImagesIpfsHash}
            handleChange={handleChange}
            formData={formData}
            terms={terms}
          />
        </div>
        <div className="mt-13 flex items-end justify-between">
          <Link
            href="https://docs.orcp.app/"
            target="_blank"
            className="text-sm leading-6 text-gray-500 hover:text-brand dark:text-gray-300"
          >
            Help Center
          </Link>
          <div className="flex gap-3">
            <Button
              shape="rounded"
              onClick={() => handledPrevTabChange()}
              disabled={loading}
              className={cn(
                'disabled:text-gray-500 dark:disabled:bg-brand',
                current === 1 && 'hidden',
              )}
            >
              Previous
            </Button>
            <Button
              shape="rounded"
              id="next-button-organisation-creation"
              onClick={(e) => handledNextTabChange(e)}
              isLoading={loading}
              className="disabled:text-gray-500 dark:disabled:bg-brand"
            >
              {totalTabCount === current ? 'Submit' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
