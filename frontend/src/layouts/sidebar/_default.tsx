'use client';

import cn from 'classnames';
import AuthorCard from '@/components/ui/author-card';
import Logo from '@/components/ui/logo';
import { MenuItem } from '@/components/ui/collapsible-menu';
// import Scrollbar from '@/components/ui/scrollbar';
import Button from '@/components/ui/button';
import { useDrawer } from '@/components/drawer-views/context';
import { Close } from '@/components/icons/close';
import { defaultMenuItems } from '@/layouts/sidebar/_menu-items';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import SurveyRespondSidebarComponent from '@/components/survey/respondantSidebar';
import { usePathname } from 'next/navigation';
//images
import { profileAdminRolesAtom } from '@/stores/atoms';
import React, { useEffect } from 'react';
import SurveySiderbarComponent from '@/components/survey/sidebar';
import { useRecoilValue } from 'recoil';
interface SidebarProps {
  className?: string;
  layoutOption?: string;
  menuItems?: any[];
}

export default function Sidebar({
  className,
  layoutOption = '',
  menuItems = defaultMenuItems,
}: SidebarProps) {
  const adminroles = useRecoilValue(profileAdminRolesAtom);
  const { closeDrawer } = useDrawer();
  const sideBarMenus = menuItems?.map((item) => ({
    name: item.name,
    icon: item.icon,
    showToOrganisation: item?.showToOrganisation,
    showToIndividual: item?.showToIndividual,
    checkAccess: item?.checkAccess,
    href:
      layoutOption +
      (layoutOption === `/${LAYOUT_OPTIONS.RETRO}` && item.href === '/'
        ? ''
        : item.href),
    ...(item.dropdownItems && {
      dropdownItems: item?.dropdownItems?.map((dropdownItem: any) => ({
        name: dropdownItem.name,
        ...(dropdownItem?.icon && { icon: dropdownItem.icon }),
        href:
          item.name === 'Authentication'
            ? layoutOption + dropdownItem.href
            : '/' + LAYOUT_OPTIONS.RETRO + dropdownItem.href,
      })),
    }),
  }));

  function convertKeyName(obj: any) {
    return {
      firstName: obj.value.organisationName,
      lastName: '',
      profilePhotoHash: obj.value.organisationProfilePhotoHash,
      username: obj.value.username,
    };
  }
  var { profileData, allProfiles, currentProfileSelected } = React.useContext(
    ProfileContractContext,
  );
  const [selectedProfile, setSelectedProfile] = React.useState(
    currentProfileSelected,
  );

  const pathname = usePathname();
  React.useEffect(() => {
    setSelectedProfile(currentProfileSelected);
  }, [currentProfileSelected]);
  function returnsame(obj: any) {
    return obj;
  }
  return (
    <aside
      className={cn(
        'relative top-0 z-40 h-full w-full max-w-full border-dashed border-gray-200 bg-body ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l dark:border-gray-700 dark:bg-dark xs:w-80 xl:fixed  xl:w-72 2xl:w-80',
        className,
      )}
    >
      <div className="relative">
        <div className="flex h-24 items-center justify-between overflow-hidden px-6 py-4 2xl:px-8">
          <Logo />
          <div className="md:hidden">
            <Button
              title="Close"
              color="white"
              shape="circle"
              variant="transparent"
              size="small"
              onClick={closeDrawer}
            >
              <Close className="h-auto w-2.5" />
            </Button>
          </div>
        </div>

        <div className="custom-scrollbar h-[calc(100%-98px)] overflow-hidden overflow-y-auto">
          <div className="px-6 pb-5 2xl:px-8">
            <AuthorCard
              profileData={
                currentProfileSelected.isOrganisation
                  ? convertKeyName(currentProfileSelected)
                  : returnsame(currentProfileSelected.value)
              }
              showusername={true}
            />

            <div className="mt-12">
              {sideBarMenus
                ?.filter(
                  (item) =>
                    (currentProfileSelected.isOrganisation &&
                      item.showToOrganisation) ||
                    (!currentProfileSelected.isOrganisation &&
                      item.showToIndividual),
                )
                .map((item, index) => {
                  if (item.checkAccess && !adminroles[0] && !adminroles[1]) {
                    return null;
                  }
                  return (
                    <MenuItem
                      key={'default' + item.name + index}
                      name={item.name}
                      href={item.href}
                      icon={item.icon}
                      dropdownItems={item.dropdownItems}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-5">
        {pathname.includes('survey/create') && <SurveySiderbarComponent />}
        {pathname.includes('survey/respond') && (
          <SurveyRespondSidebarComponent />
        )}
      </div>
    </aside>
  );
}
