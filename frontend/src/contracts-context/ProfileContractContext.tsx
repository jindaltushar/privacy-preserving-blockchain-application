'use client';

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { SignerProviderContext } from '@/app/shared/signerProvider';
import { readIPFS, sendJSONToIPFS } from '@/app/shared/ipfs';
import { GaslessContractContext } from '@/contracts-context/GaslessContractContext';
import {
  OrganisationIdUsernameMapping,
  profileAdminRolesAtom,
} from '@/stores/atoms';
import {
  ProfileContractABI,
  ProfileContractAddress,
} from '@/contracts/constants';
import { getSignUpSignature } from '@/app/shared/signature-helper';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { toast } from 'sonner';
import {
  bytes32ToString,
  stringToBytes32,
  isObjectEmpty,
} from '@/app/shared/utils';
import { useEthereum } from '@/app/shared/web3-provider';
import {
  OrganisationCreationRequest,
  userSignupRequest,
  User,
  UserSearchResultStruct,
  Organisation,
  IPFSHash,
  UserHumanityVerificationStatus,
} from '@/app/shared/types';
import { selectedProfileAtom } from '@/stores/atoms';
import { useRecoilState } from 'recoil';
import { set } from 'lodash';

function formatUser(user: any): User {
  return {
    userId: formatBigNumber(user.userId),
    userAddress: user.userAddress,
    firstName: bytes32ToString(user.firstName),
    lastName: bytes32ToString(user.lastName),
    bio: bytes32ToString(user.bio),
    profilePhotoHash: user.profilePhotoHash,
    profileAvatar: user.profileAvatar,
    twitter_handle: bytes32ToString(user.twitter_handle),
    facebook_handle: bytes32ToString(user.facebook_handle),
    instagram_handle: bytes32ToString(user.instagram_handle),
    external_link: bytes32ToString(user.external_link),
    password: user.password,
    createdOn: formatBigNumber(user.createdOn),
    onBoardingStatus: user.onBoardingStatus,
    humanityVerificationStatus: user.humanityVerificationStatus,
    verificationValidUntil: formatBigNumber(user.verificationValidUntil),
    username: bytes32ToString(user.username),
    isOrganisation: user.isOrganisation,
  };
}

async function formatOrganisation(request: any) {
  if (!request) {
    return [];
  }
  // if the object does not have a property of organisationId then it is an array of organisations
  if (request.organisationId === undefined) {
    // Map over each element and await each call to formatOrganisation
    const formattedOrganisations = await Promise.all(
      request.map((element: any) => formatOrganisation(element)),
    );
    return formattedOrganisations;
  }

  const bio = (await readIPFS(request.organisationBioIPFSHash)).orgbio;

  return {
    organisationId: formatBigNumber(request.organisationId),
    organisationName: bytes32ToString(request.organisationName),
    organisationBioIPFSHash: request.organisationBioIPFSHash,
    organisationProfilePhotoHash: request.organisationProfilePhotoHash,
    organisationBioText: bio,
    organisationProfileAvatar: request.organisationProfileAvatar,
    organisationTwitter_handle: bytes32ToString(
      request.organisationTwitter_handle,
    ),
    organisationFacebook_handle: bytes32ToString(
      request.organisationFacebook_handle,
    ),
    organisationInstagram_handle: bytes32ToString(
      request.organisationInstagram_handle,
    ),
    organisationExternal_link: bytes32ToString(
      request.organisationExternal_link,
    ),
    createdOn: formatBigNumber(request.createdOn),
    username: bytes32ToString(request.username),
    tagsIds: formatBigNumber(request.tags),
  };
}

function formatBigNumber(value: any) {
  if (typeof value === 'object' && value._hex) {
    return parseInt(value._hex);
  }
  // if type of value is list then return a list with each element formatted
  if (Array.isArray(value)) {
    return value.map((element) => formatBigNumber(element));
  }
}

interface ProfileContractContextValue {
  profileReader: any; // Replace 'any' with the actual type of your profileReader
  profileWriter: any; // Replace 'any' with the actual type of your profileWriter
  userSignup: (request: userSignupRequest) => Promise<void>;
  updateAdminGaslessAction: (action: string, value: any) => Promise<void>;
  getProfile: () => Promise<User>;
  profileData: User | null;
  searchUserByUserId: (userId: number) => Promise<UserSearchResultStruct>;
  searchUserByAddress: (address: string) => Promise<UserSearchResultStruct>;
  searchUserByUsername: (
    username: string,
    page_size: number,
    page_offset: number,
  ) => Promise<UserSearchResultStruct[]>;
  updateProfileData: (profile: userSignupRequest) => Promise<boolean>;
  createOrganisation: (
    request: OrganisationCreationRequest,
  ) => Promise<boolean>;
  checkUserNameAvailability: (username: string) => Promise<boolean>;
  allProfiles: any;
  setAllProfiles: (profiles: any) => void;
  currentProfileSelected: any;
  setcurrentProfileSelected: (profile: any) => void;
  isGaslessActionAllowed: (action: string) => Promise<boolean>;
  isUserSignedIn: boolean;
  profileGaslessAddress: any;
  setProfileGaslessAddress: (address: any) => void;
  currentAccountBalance: any;
  setcurrentAccountBalance: (balance: any) => void;
  createPost: (poststring: string, image: string) => Promise<boolean>;
  findUserNameFromUserId: (userId: number) => Promise<any>;
  getOrganisationView: (organisationId: number) => Promise<any>;
  listAllMembersOfOrganisation: (organisationId: number) => Promise<string[]>;
  addUserToOrganisation: (
    address: string,
    organisationId: number,
  ) => Promise<boolean>;
  removeUserFromOrganisation: (
    address: string,
    organisationId: number,
  ) => Promise<boolean>;
  getMyVerificationStatusTx: () => Promise<void>;
  getTotalUserCount: () => Promise<number>;
  loadingProfile: boolean;
  getMyAdminRoles: () => Promise<[boolean, boolean]>;
  adminUpdateUserVerificationStatus: (
    user: number[],
    humanityStatus: UserHumanityVerificationStatus[],
    validTill: number[],
  ) => Promise<boolean>;
}

interface ProfileContractProviderProps {
  children: ReactNode;
}

export const ProfileContractContext =
  createContext<ProfileContractContextValue>({} as ProfileContractContextValue);

export const ProfileContractProvider: React.FC<
  ProfileContractProviderProps
> = ({ children }) => {
  var { signerProvider, currentAccount, fetchContract, createSignature } =
    useContext(SignerProviderContext);

  var { getIdentity, flushIdentity } = useContext(IdentityContext);
  var [isInitialized, setIsInitialized] = useState(false);
  var { gaslessReader, gaslessWriter, getOrganisationAccountPublicKey } =
    useContext(GaslessContractContext);
  var [currentProfileSelected, setcurrentProfileSelected] = useState({});
  var [allProfiles, setAllProfiles] = useState<any | null>(null);
  var [profileReader, setProfileReader] = useState<any | null>(null);
  var [profileWriter, setProfileWriter] = useState<any | null>(null);
  var [profileData, setProfileData] = useState<any | null>(null);
  var [profileGaslessAddress, setProfileGaslessAddress] = useState<any | null>(
    null,
  );
  var [currentAccountBalance, setcurrentAccountBalance] = useState<any | null>(
    null,
  );
  const [adminroles, setAdminRoles] = useRecoilState(profileAdminRolesAtom);
  const { checkEtherBalance } = useEthereum();
  const [selectedProfile, setSelectedProfile] =
    useRecoilState(selectedProfileAtom);

  // action is a string
  const isGaslessActionAllowed = async (action: string): Promise<boolean> => {
    return profileReader.isGaslessActionAllowed(action);
  };

  function receiveProfiles(userProfile: User, organisations: Organisation[]) {
    //create an object with key as localindex, isOrganisation and value as the profile
    var profiles = [];
    var localindex = 0;
    organisations.forEach((element) => {
      profiles.push({
        localindex: localindex,
        isOrganisation: true,
        value: element,
        selected: false,
      });
      localindex += 1;
    });
    profiles.push({
      localindex: localindex,
      isOrganisation: false,
      value: userProfile,
      selected: true,
    });
    setAllProfiles(profiles);
    setcurrentProfileSelected({
      localindex: localindex,
      isOrganisation: false,
      value: userProfile,
      selected: true,
    });
    setSelectedProfile({
      localindex: localindex,
      isOrganisation: false,
      value: userProfile,
      selected: true,
    });
  }

  const userSignup = async (request: userSignupRequest) => {
    //check if gasless action is allowed
    const action = 'userSignup';
    const allowed = await isGaslessActionAllowed(action);
    console.log('signup.gasless: allowed', allowed);
    console.log('signup.gasless: request', request);
    if (signerProvider) {
      if (allowed) {
        const rsv = await getIdentity();
        console.log('signup.gasless: rsv', rsv);
        console.log('signup.gasless: SignupRequest', request);
        console.log(rsv);
        console.log('use this');
        const tx = await gaslessReader.makeUserSignupTransaction(request, rsv);
        console.log('signup.gasless: tx', tx);
        toast.loading('Signing you up... Kindly Wait', { id: 'signup' });
        const txResponse = await signerProvider.sendTransaction(tx);
        console.log('signup.gasless: waiting for tx', txResponse.hash);
        const receipt = await signerProvider.waitForTransaction(
          txResponse.hash,
          1,
        );
        if (receipt.status === 1) {
          console.log('signup.gasless: tx success', receipt);
          // reload the page
          toast.success('Sucessfully Signedup.....', { id: 'signup' });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Transaction Failed. Kindly check the logs', {
            id: 'signup',
          });
          console.error('signup.gasless: tx failed', receipt);
        }

        // await checkUserAdded();
      } else {
        try {
          const resp = await profileWriter.userSignupWithoutProxy(request);
          console.log('signup: with gas : resp', resp);
          // await checkUserAdded();
        } catch (error: any) {
          if (error.code.toString() === 'ACTION_REJECTED') {
            console.log('signup.with gas: user rejected action');
            return;
          }
          console.log('signup: with gas : error', error);
          return;
        }
      }
    }
  };

  const getMyVerificationStatusTx = async () => {
    if (gaslessReader) {
      const auth = await getIdentity();
      const tx = await gaslessReader.getMyVerificationStatusTx(auth);
      console.log('verifyCivic.gasless: tx', tx);
      toast.loading('Verifying your Civic Status', { id: 'civic' });
      const txResponse = await signerProvider.sendTransaction(tx);
      console.log('verifyCivic.gasless: waiting for tx', txResponse.hash);
      const receipt = await signerProvider.waitForTransaction(
        txResponse.hash,
        1,
      );
      if (receipt.status === 1) {
        console.log('verifyCivic.gasless: tx success', receipt);
        // reload the page
        toast.success(
          'Sucessfully submitted your verification request..... It may take upto 5 minutes to be visible on your profile.',
          { id: 'civic' },
        );
      } else {
        toast.error('Transaction Failed. Kindly check the logs', {
          id: 'civic',
        });
        console.error('verifyCivic.gasless: tx failed', receipt);
      }
    }
  };

  const getProfile = async () => {
    const auth = await getIdentity();
    // auth.rsv.r =
    //   '0xa64197d717ba970819e123ed92befb0adaf158ce5eb215f33711f3948bccaf2a';
    if (profileReader) {
      try {
        const response = await profileReader.getMyData(auth);
        const adminRolesResponse = await profileReader.getMyAdminRoles(auth);
        setAdminRoles(adminRolesResponse);
        if (response) {
          var profile = formatUser(response.userProfile);
          var organisations = await formatOrganisation(response[1]);
          console.log('organisations data is', organisations);
          setProfileData(profile);
          // @ts-ignore
          receiveProfiles(profile, organisations);
          return profile;
        }
        return {} as User;
      } catch (error: any) {
        console.log('User not found');
        return {} as User;
      }
    } else {
      console.log('profile reader not available');
      return {} as User;
    }
  };

  const createOrganisation = async (request: OrganisationCreationRequest) => {
    try {
      //  request except key organisationBioText
      const modifiedRequest = { ...request };
      // Delete the 'organisationBioText' key from the modified request
      delete modifiedRequest.organisationBioText;
      console.log('final request', modifiedRequest);
      const tx = await profileWriter.createOrganisation(modifiedRequest);
      const receipt = await tx.wait();
      console.log('createOrganisation: tx', tx);
      if (receipt.status === 1) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('Error creating organisation', e);
      return false;
    }
  };

  const checkUserNameAvailability = async (username: string) => {
    const tx = await profileReader.checkUsernameAvailability(
      stringToBytes32(username),
    );
    console.log('checkUserNameAvailability: tx', tx);
    return tx;
  };

  const searchUserByUserId = async (userId: number) => {
    const tx = await profileReader.searchUserByUserId(userId);
    console.log('searchUserByUserId: tx', tx);
    return tx;
  };

  const searchUserByAddress = async (address: string) => {
    const tx = await profileReader.searchUserByAddress(address);
    console.log('searchUserByAddress: tx', tx);
    return tx;
  };

  const getOrganisationView = async (organisationId: number) => {
    const tx = await profileReader.getOrganisationView(organisationId);
    const org = await formatOrganisation(tx);
    return org;
  };

  const searchUserByUsername = async (
    username: string,
    page_size: number,
    page_offset: number,
  ) => {
    const tx = await profileReader.searchMultipleUsersbyUsername(
      username,
      page_size,
      page_offset,
    );
    console.log('searchUserByUsername: tx', tx);
    return tx;
  };

  const updateProfileData = async (updateRequest: userSignupRequest) => {
    // make sure all keys are defined in updaterequest and if not then set them to ""
    try {
      const tx = await profileWriter.updateUserData(updateRequest);
      const receipt = await tx.wait();
      console.log('updateProfileData: tx', tx);
      if (receipt.status === 1) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('Error updating profile data', e);
      return false;
    }
  };

  const findUserNameFromUserId = async (userId: number) => {
    const resp = await profileReader.findUserNameFromUserId(userId);
    console.log('finduserresp', resp);
    return { username: bytes32ToString(resp.username), ipfs: resp.ipfs };
  };

  const createPost = async (
    poststring: string,
    image: string,
  ): Promise<boolean> => {
    toast.loading('Creating Post... Kindly Wait', { id: 'createpost' });
    // @ts-ignore
    const organisationId = currentProfileSelected?.value?.organisationId;
    if (organisationId) {
      const jsonObj = {
        post: poststring,
        image: image,
        time: new Date().getTime(),
        createdBy: organisationId,
      };
      // send json to ipfs
      // get hash
      const ipfs = await sendJSONToIPFS(jsonObj);
      const tx = await profileWriter.createPost(organisationId, ipfs);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        toast.success('Post Created Successfully', { id: 'createpost' });
        return true;
      } else {
        toast.error('Post Creation Failed', { id: 'createpost' });
        return false;
      }
    }
  };

  const updateAdminGaslessAction = async (action: string, value: any) => {
    console.log(profileWriter);
    const tx = await profileWriter.updateGaslessActionAllowed(action, value);
    //check if transaction is successful

    console.log('update admin gasless: tx for action ' + action, tx);
  };

  const listAllMembersOfOrganisation = async (
    organisationId: number,
  ): Promise<string[]> => {
    const auth = await getIdentity();
    const response = await profileReader.listAllMembersOfOrganisation(
      organisationId,
      auth,
    );
    return response;
  };

  const addUserToOrganisation = async (
    address: string,
    organisationId: number,
  ): Promise<boolean> => {
    const response = await profileWriter.addUserToOrganisation(
      address,
      organisationId,
    );
    const reciept = await response.wait();
    if (reciept.status === 1) {
      return true;
    } else {
      return false;
    }
  };

  const removeUserFromOrganisation = async (
    address: string,
    organisationId: number,
  ): Promise<boolean> => {
    const response = await profileWriter.removeUserFromOrganisation(
      address,
      organisationId,
    );
    const reciept = await response.wait();
    if (reciept.status === 1) {
      return true;
    } else {
      return false;
    }
  };

  const getTotalUserCount = async () => {
    const response = await profileReader.getTotalUserCount();
    return Number(response);
  };

  const getMyAdminRoles = async (): Promise<[boolean, boolean]> => {
    const auth = await getIdentity();
    const response = await profileReader.getMyAdminRoles(auth);
    return response;
  };

  const adminUpdateUserVerificationStatus = async (
    user: number[],
    humanityStatus: UserHumanityVerificationStatus[],
    validTill: number[],
  ): Promise<boolean> => {
    const res = await profileWriter.adminUpdateUserVerificationStatus(
      user,
      humanityStatus,
      validTill,
    );
    const receipt = await res.wait();
    if (receipt.status === 1) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const setupContract = async () => {
      if (signerProvider) {
        const { reader, writer } = fetchContract(
          ProfileContractAddress,
          ProfileContractABI,
          signerProvider,
        );
        console.log('i am here reading');
        setProfileReader(reader);
        setProfileWriter(writer);
        setIsInitialized(true); // Set the initialization status to true
      }
    };

    setupContract();
  }, [currentAccount]);

  //use effect to fetch user balance
  useEffect(() => {
    const insidefnB = async (addr: string) => {
      return await checkEtherBalance(23295, addr);
    };

    if (currentProfileSelected) {
      // @ts-ignore
      if (currentProfileSelected?.isOrganisation) {
        const balance = insidefnB(profileGaslessAddress);
        setcurrentAccountBalance(balance);
      } else {
        const balance = insidefnB(currentAccount);
        setcurrentAccountBalance(balance);
      }
    }
  }, [currentProfileSelected]);

  var [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchData = async () => {
    if (currentAccount && profileReader) {
      setLoadingProfile(true);
      // Check if profileReader is available
      try {
        console.log('fetching data in profile contract context');
        const userData = await getProfile();
        // check if userData is not empty object
        if (!isObjectEmpty(userData)) {
          setIsUserSignedIn(true);
        } else {
          setIsUserSignedIn(false);
        }
        setLoadingProfile(false);
      } catch (error) {
        // Handle errors if needed
        console.error('Error in fetchData in page.tsx IndexPageModern:', error);
        setIsUserSignedIn(false);
        setLoadingProfile(false);
      }
      setLoadingProfile(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [profileReader]); // Add profileReader to the dependencies

  return (
    <ProfileContractContext.Provider
      value={{
        profileReader,
        profileWriter,
        userSignup,
        updateAdminGaslessAction,
        getProfile,
        profileData,
        searchUserByUserId,
        searchUserByAddress,
        searchUserByUsername,
        updateProfileData,
        createOrganisation,
        checkUserNameAvailability,
        allProfiles,
        setAllProfiles,
        currentProfileSelected,
        setcurrentProfileSelected,
        isGaslessActionAllowed,
        isUserSignedIn,
        profileGaslessAddress,
        setProfileGaslessAddress,
        currentAccountBalance,
        setcurrentAccountBalance,
        createPost,
        findUserNameFromUserId,
        getOrganisationView,
        listAllMembersOfOrganisation,
        addUserToOrganisation,
        removeUserFromOrganisation,
        getMyVerificationStatusTx,
        getTotalUserCount,
        loadingProfile,
        getMyAdminRoles,
        adminUpdateUserVerificationStatus,
      }}
    >
      {children}
    </ProfileContractContext.Provider>
  );
};
