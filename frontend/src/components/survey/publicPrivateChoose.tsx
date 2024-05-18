'use client';
import Button from '@/components/ui/button';
import PublicVsPrivateComparisionTable from '@/components/survey/publicVsPrivateComparisionTable';
import Checkbox from '@/components/ui/forms/checkbox';
import AnchorLink from '@/components/ui/links/anchor-link';
import cn from 'classnames';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { masterSettingsAtom, isSurveyPrivacySetAtom } from '@/stores/atoms';
import { toast } from 'sonner';

const PublicPrivateChoose = () => {
  var [termsChecked, setTermsChecked] = useState(false);
  const [masterSettings, setMasterSettings] =
    useRecoilState(masterSettingsAtom);

  const [privacyset, setPrivacyIsSet] = useRecoilState(isSurveyPrivacySetAtom);

  // Update the masterSettingsAtom with the new valu
  const handleOnClick = (buttonName: string) => {
    if (!termsChecked) {
      toast.error('Please accept terms and conditions');
      return;
    }
    if (buttonName === 'PRIVATE')
      setMasterSettings({ ...masterSettings, ['is_survey_private']: true });
    else setMasterSettings({ ...masterSettings, ['is_survey_private']: false });
    setPrivacyIsSet(true);
  };

  return (
    <div className="h-full w-full grid grid-cols-[3fr_1fr] gap-4 px-16 max-md:px-8 max-sm:px-2 py-16 max-md:py-8">
      <div className="col-span-2 w-full space-y-8">
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="w-full text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Lets get your survey setup
          </h1>
          <p className="w-2/3 max-md:w-full text-center leading-7 [&:not(:first-child)]:mt-6">
            Choose the privacy settings for your survey. You can <b>not</b>{' '}
            change this later.
          </p>
          <div className="pt-2 text-sm xl:pt-2">
            <div className="mx-auto w-full  rounded-lg bg-white p-5 pt-4 shadow-card dark:bg-light-dark xs:p-6 xs:pt-5">
              <div
                className={cn(
                  'sticky bottom-0 z-10 bg-body dark:bg-dark md:-mx-2',
                )}
              >
                <PublicVsPrivateComparisionTable />
                <div className="-mx-4 border-t-2 border-gray-900 px-4 pt-4 dark:border-gray-700 sm:-mx-6 sm:px-6 md:mx-2"></div>
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
                  containerClassName="!items-start flex justify-center mb-2"
                  inputClassName="mt-1 focus:!ring-offset-[1px]"
                  size="sm"
                  checked={termsChecked}
                  onChange={() => setTermsChecked(!termsChecked)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    shape="rounded"
                    onClick={() => handleOnClick('PRIVATE')}
                  >
                    PRIVATE
                  </Button>
                  <Button
                    shape="rounded"
                    variant="solid"
                    color="gray"
                    className="dark:bg-gray-800"
                    onClick={() => handleOnClick('PUBLIC')}
                  >
                    PUBLIC
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPrivateChoose;
