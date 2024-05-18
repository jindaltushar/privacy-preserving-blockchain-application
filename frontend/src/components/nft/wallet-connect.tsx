'use client';

import cn from 'classnames';
import Button from '@/components/ui/button';
import { Menu } from '@/components/ui/menu';
import { Transition } from '@/components/ui/transition';
import ActiveLink from '@/components/ui/links/active-link';
import { ChevronDown } from '@/components/icons/chevron-down';
import { useMeasure } from '@/lib/hooks/use-measure';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { motion } from 'framer-motion';
import { PowerIcon } from '@/components/icons/power';
import * as React from 'react';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import AuthorCard from '@/components/ui/author-card';
import { toast } from 'sonner';
import { selectedProfileAtom } from '@/stores/atoms';
import { useModal } from '@/components/modal-views/context';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import {
  isSurveyPrivacySetAtom,
  isActiveProfileOrganisationAtom,
  viewMasterSurveySetttingsAtom,
  previewSurveyAtom,
  showSurveyFinalCreatePageAtom,
  surveyAudienceAtom,
  masterSettingsAtom,
  nodesAtom,
} from '@/stores/atoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useEffect } from 'react';
export default function WalletConnect({
  btnClassName,
  anchorClassName,
}: {
  btnClassName?: string;
  anchorClassName?: string;
}) {
  const [viewPreview, setViewPreview] = useRecoilState(previewSurveyAtom);
  const { currentAccount, connectWalletOnClick, disconnectWallet } =
    React.useContext(SignerProviderContext);
  const [ref, { height }] = useMeasure<HTMLUListElement>();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isChildrenActive, setIsChildrenActive] = React.useState(false);
  const [isActiveProfileAnOrganisation, setIsProfileOrganisation] =
    useRecoilState(isActiveProfileOrganisationAtom);
  const isPrivacySet = useRecoilValue(isSurveyPrivacySetAtom);
  const [viewMasterSurveySettings, setViewMasterSurveySettings] =
    useRecoilState(viewMasterSurveySetttingsAtom);
  const [showSurveyFinalCreatePage, setShowSurveyFinalCreatePage] =
    useRecoilState(showSurveyFinalCreatePageAtom);
  const [surveyAudience] = useRecoilState(surveyAudienceAtom);
  const [masterSettings] = useRecoilState(masterSettingsAtom);
  const [nodes] = useRecoilState(nodesAtom);
  const [selectedProfile, setSelectedProfile] =
    useRecoilState(selectedProfileAtom);
  const { getOrganisationAccountPublicKeyWithOrgId } = React.useContext(
    GaslessContractContext,
  );

  const {
    allProfiles,
    setAllProfiles,
    currentProfileSelected,
    setcurrentProfileSelected,
    isUserSignedIn,
    profileGaslessAddress,
    setProfileGaslessAddress,
    currentAccountBalance,
  } = React.useContext(ProfileContractContext);

  const changeProfile = (isOrganisation: boolean, organisationValue: any) => {
    if (isOrganisation) {
      const organisationid = organisationValue.organisationId;
      const previousSelectedProfile = allProfiles.find(
        (profile) => profile.selected === true,
      );
      var isOrganisationMember = false;
      var newProfileIndex = null;
      for (let i = 0; i < allProfiles.length; i++) {
        if (
          allProfiles[i].value.organisationId &&
          allProfiles[i].value.organisationId == organisationid
        ) {
          isOrganisationMember = true;
          newProfileIndex = i;
        }
      }
      if (isOrganisationMember) {
        // if (previousSelectedProfile.value.organisationId && previousSelectedProfile.value.organisationId != organisationid) {
        setAllProfiles((prev) => {
          return prev.map((profile) => {
            if (
              profile.value.organisationId &&
              profile.value.organisationId == organisationid
            ) {
              return { ...profile, selected: true };
            } else {
              return { ...profile, selected: false };
            }
          });
        });
        // window.location.href = '/404';
        // fetch organisations address from gasless contract
        const getAddress = async (id: number) => {
          const address = await getOrganisationAccountPublicKeyWithOrgId(id);
          setProfileGaslessAddress(address);
        };
        getAddress(organisationid);
        setcurrentProfileSelected(allProfiles[newProfileIndex]);
        setSelectedProfile(allProfiles[newProfileIndex]);
        setIsProfileOrganisation(true);
      }
    } else {
      const profileId = organisationValue.userId;
      setAllProfiles((prev) => {
        return prev.map((profile) => {
          if (profile.value.userId && profile.value.userId == profileId) {
            return { ...profile, selected: true };
          } else {
            return { ...profile, selected: false };
          }
        });
      });
      // get the index of the new profile
      var newProfileIndex = allProfiles.findIndex((profile) => {
        if (profile.value.userId && profile.value.userId == profileId) {
          return true;
        }
      });
      // window.location.href = '/404';
      setcurrentProfileSelected(allProfiles[newProfileIndex]);
      setSelectedProfile(allProfiles[newProfileIndex]);
      setIsProfileOrganisation(false);
    }
  };

  const { openModal } = useModal();

  // useEffect(() => {
  //   console.log(currentProfileSelected);
  // }, [currentProfileSelected]);

  if (currentAccount && isUserSignedIn) {
    return (
      <>
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          <div className="relative flex-shrink-0">
            <Menu>
              <Menu.Button
                className="block h-10 w-10 overflow-hidden rounded-full border-3 border-solid border-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-main transition-all hover:-translate-y-0.5 hover:shadow-large dark:border-gray-700 sm:h-12 sm:w-12"
                style={{ willChange: 'transform, box-shadow' }}
              ></Menu.Button>
              <Transition
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-300"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                {allProfiles && (
                  <Menu.Items className="absolute -right-20 mt-3 w-72 origin-top-right rounded-lg bg-white shadow-large dark:bg-gray-900 sm:-right-14">
                    <Menu.Item>
                      <div className="border-b border-dashed border-gray-200 p-3 dark:border-gray-700">
                        <>
                          <div
                            className={cn(
                              'relative flex h-12 cursor-pointer items-center justify-between whitespace-nowrap  rounded-lg px-4 transition-all',
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsOpen(!isOpen);
                            }}
                          >
                            <span className="z-[1] flex items-center ltr:mr-3 rtl:ml-3">
                              <span className={cn('ltr:mr-3 rtl:ml-3')}>
                                {/* {icon} */}
                                <span className="h-8 w-8 rounded-full border-2 border-solid border-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:border-gray-700"></span>
                                <span className="grow uppercase">
                                  SWITCH PROFILE
                                </span>
                              </span>
                            </span>
                            <span
                              className={`z-[1] transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            >
                              <ChevronDown />
                            </span>

                            {isChildrenActive && (
                              <motion.span
                                className={cn(
                                  'absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand opacity-0 shadow-large transition-opacity',
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                              />
                            )}
                          </div>

                          <div
                            style={{
                              height: isOpen ? height : 0,
                            }}
                            className="ease-[cubic-bezier(0.33, 1, 0.68, 1)] overflow-hidden transition-all duration-[350ms]"
                          >
                            <ul ref={ref}>
                              {allProfiles.map((item, index) => {
                                if (item.selected == true) return null;
                                var profileData = {};
                                if (item.isOrganisation) {
                                  profileData['firstName'] =
                                    item.value.organisationName;
                                  profileData['lastName'] = '';
                                  profileData['profilePhotoHash'] =
                                    item.value.organisationProfilePhotoHash;
                                  profileData['username'] = item.value.username;
                                  profileData['userId'] =
                                    item.value.organisationId;
                                } else {
                                  profileData = item.value;
                                }
                                return (
                                  <li
                                    className="first:pt-2"
                                    key={item.localindex}
                                  >
                                    <ActiveLink
                                      onClick={() => {
                                        changeProfile(
                                          item.isOrganisation,
                                          item.value,
                                        );
                                        console.log('yesyes');
                                      }}
                                      href={item.isOrganisation ? '' : ''}
                                    >
                                      <AuthorCard
                                        profileData={profileData}
                                        showusername={true}
                                      />
                                    </ActiveLink>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      <Menu.Item>
                        <div className="border-b border-dashed border-gray-200 px-6 py-5 dark:border-gray-700">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium -tracking-tighter text-gray-600 dark:text-gray-400">
                              Balance
                            </span>
                            <span className="rounded-lg bg-gray-100 px-2 py-1 text-sm tracking-tighter dark:bg-gray-800">
                              {profileGaslessAddress
                                ? profileGaslessAddress.slice(0, 6) +
                                  '...' +
                                  profileGaslessAddress.slice(
                                    profileGaslessAddress.length - 6,
                                  )
                                : currentAccount.slice(0, 6) +
                                  '...' +
                                  currentAccount.slice(
                                    currentAccount.length - 6,
                                  )}
                            </span>
                          </div>
                          <div className="mt-3 font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                            {currentAccountBalance ? currentAccountBalance : 0}{' '}
                            ETH
                          </div>
                        </div>
                      </Menu.Item>
                    </Menu.Item>
                    <Menu.Item>
                      <div className="p-3">
                        <div
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                          onClick={() => disconnectWallet()}
                        >
                          <PowerIcon />
                          <span className="grow uppercase">Disconnect</span>
                        </div>
                      </div>
                    </Menu.Item>
                  </Menu.Items>
                )}
              </Transition>
            </Menu>
          </div>
          {currentProfileSelected.isOrganisation ? (
            isPrivacySet ? (
              !viewMasterSurveySettings ? (
                <>
                  {/* <ActiveLink
                    href="#"
                    className={cn(anchorClassName)}
                    onClick={(e) => {
                      e.preventDefault();
                      setViewPreview(true);
                      setViewMasterSurveySettings(false);
                      setShowSurveyFinalCreatePage(false);
                      openModal('SURVEY_PREVIEW');
                    }}
                  >
                    <Button
                      className={cn(
                        'shadow-main hover:shadow-large',
                        btnClassName,
                      )}
                    >
                      PREVIEW
                    </Button>
                  </ActiveLink> */}
                  <ActiveLink
                    href="#"
                    className={cn(anchorClassName)}
                    onClick={(e) => {
                      e.preventDefault();
                      setViewMasterSurveySettings(true);
                      setViewPreview(false);
                      setShowSurveyFinalCreatePage(false);
                    }}
                  >
                    <Button
                      className={cn(
                        'shadow-main hover:shadow-large',
                        btnClassName,
                      )}
                    >
                      SURVEY SETTINGS
                    </Button>
                  </ActiveLink>
                </>
              ) : (
                <>
                  <ActiveLink
                    href="#"
                    className={cn(anchorClassName)}
                    onClick={(e) => {
                      e.preventDefault();
                      setViewMasterSurveySettings(false);
                      setViewPreview(false);
                      setShowSurveyFinalCreatePage(false);
                    }}
                  >
                    <Button
                      className={cn(
                        'shadow-main hover:shadow-large',
                        btnClassName,
                      )}
                    >
                      BACK TO FORM
                    </Button>
                  </ActiveLink>
                  <ActiveLink
                    href="#"
                    className={cn(anchorClassName)}
                    onClick={() => {
                      if (
                        surveyAudience.length == 0 &&
                        masterSettings.is_survey_private == true
                      ) {
                        toast.error(
                          'You need to select an audience to proceed',
                        );
                        return;
                      }
                      if (nodes.length == 0) {
                        toast.error(
                          'You need to add at least one question to proceed',
                        );
                        return;
                      }
                      setShowSurveyFinalCreatePage(true);
                      setViewMasterSurveySettings(false);
                      setViewPreview(false);
                    }}
                  >
                    <Button
                      className={cn(
                        'shadow-main hover:shadow-large',
                        btnClassName,
                      )}
                    >
                      SUBMIT SURVEY
                    </Button>
                  </ActiveLink>
                </>
              )
            ) : (
              <ActiveLink href="/survey/create" className={cn(anchorClassName)}>
                <Button
                  className={cn('shadow-main hover:shadow-large', btnClassName)}
                >
                  CREATE SURVEY
                </Button>
              </ActiveLink>
            )
          ) : (
            <ActiveLink href="" className={cn(anchorClassName)}>
              <Button
                className={cn('shadow-main hover:shadow-large', btnClassName)}
                onClick={() => openModal('CREATE_ORGANISATION')}
              >
                CREATE ORGANISATION
              </Button>
            </ActiveLink>
          )}
        </div>
      </>
    );
  } else {
    return (
      <Button
        onClick={() => connectWalletOnClick(null)}
        className={cn('shadow-main hover:shadow-large', btnClassName)}
      >
        CONNECT
      </Button>
    );
  }
}
