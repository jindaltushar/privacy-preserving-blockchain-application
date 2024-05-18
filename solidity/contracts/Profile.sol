//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ContractStore.sol";
import "./AuthenticatedViewCall.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import {AcceptsProxy} from "./IProfile.sol";
import {Organisation,SignIn, userSignupRequest,IPFSHash,OrganisationCreationRequest,UserOnBoardingStatus,UserHumanityVerificationStatus,UserSearchResultStruct,User} from "./Types.sol";

contract Profile is AuthenticatedViewCall,AcceptsProxy{
    
    error UnAuthorizedAction();
    error UserAlreadyExists();
    error InputDataError();
    error GaslessActionNotAllowed();
    error StringLengthError();
    error NoUserFound();
    error SignUpDataErrorWrongMessageSender();

    bytes32[] private tags;

    mapping (bytes32 => uint256) private userNameToIdMapping;
    mapping (address => uint256) private userAddressToIdMapping;

    mapping (uint256 => IPFSHash[]) private organisationPosts;

    bytes32[] private usernames;

    ContractStore public contractStore;

    mapping (bytes32 => bool) private GaslessActionAllowed;
    event OrganisationPosted(uint256 indexed organisationId, IPFSHash post);

    //organisation id to user id
    mapping(uint256 => uint256[]) private membersOfOrganisation;
    // userid to organisation ids
    mapping(uint256 => uint256[]) private isMemberInOrganisations;

    uint256 private userIdCounter;
    uint256 private organisationIdCounter;
    // mapping to keep track of users
    mapping(uint256 => User) private users;
    mapping(uint256 => Organisation) private organisations;
    mapping(uint256 => bytes32) private Tags;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    address[] private signedUpUserAddresses;

    constructor(address _contractStoreAddress){
        contractStore = ContractStore(_contractStoreAddress);
        GaslessActionAllowed[keccak256(bytes("userSignup"))]=true;
        GaslessActionAllowed[keccak256(bytes("userSurveyAnswer"))]=true;
        userIdCounter = 139830;
        organisationIdCounter = 893892;
    }

    function _findUserIdfromAddress(address userAddress) private view returns(uint256){
        return userAddressToIdMapping[userAddress];
    }

    function findUserIdfromAddress(address userAddress) external view returns(uint256) {
        require(contractStore.surveyContractAddress() != address(0) && contractStore.profileContractAddress()!=address(0), "Survey contract address not set");
        require(msg.sender == contractStore.surveyContractAddress() || msg.sender == contractStore.gaslessContractAddress() , "Unauthorized access");
        return userAddressToIdMapping[userAddress];
    }

    function isOrganisationIDValid(uint256 organisationId) external view returns(bool){
        require(msg.sender == contractStore.vaultContractAddress(), "Only Allowed from Vault");
        if (organisations[organisationId].createdOn == 0){
            return false;
        }
        return true;
    }

    function toLower(bytes32 _input) public pure returns (bytes32) {
        bytes32 result;
        
        for (uint256 i = 0; i < 32; i++) {
            bytes1 char = _input[i];
            if (char >= 0x41 && char <= 0x5A) {
                char |= 0x20;
            }
            result |= bytes32(char) >> (i * 8);
        }
        
        return result;
    }

    function checkUsernameAvailability(bytes32 username) external view returns(bool){
        bytes32 usernameLower = toLower(username);
        if (userNameToIdMapping[usernameLower] != 0){
            return false;
        }
        return true;
    }

    function getAllTags() external view returns(bytes32[] memory){
        return tags;
    }

    function addNewUser(userSignupRequest calldata request) internal 
     {
        // check if the useraddress is already a key in the mapping
        if (userAddressToIdMapping[request.user] != 0){
            revert UserAlreadyExists();
        }
        // create a new user
        uint256 newUserId = userIdCounter+1;
        User memory newUser = User({
            userId: newUserId,
            userAddress: request.user,
            firstName: request.firstName,
            lastName: request.lastName,
            bio: request.bio,
            profilePhotoHash: IPFSHash(request.digest,request.hashFunction,request.size),
            profileAvatar: request.profileAvatar,
            twitter_handle: request.twitter_handle,
            facebook_handle: request.facebook_handle,
            instagram_handle: request.instagram_handle,
            external_link: request.external_link,
            password: request.password,
            createdOn: block.timestamp,
            onBoardingStatus: UserOnBoardingStatus.NOT_ONBOARDED,
            humanityVerificationStatus: UserHumanityVerificationStatus.NOT_VERIFIED,
            verificationValidUntil: 0,
            username:"",
            isOrganisation: false
        });
        // add the user to the mapping
        users[newUserId] = newUser;
        userAddressToIdMapping[request.user] = newUserId;
        signedUpUserAddresses.push(request.user);
        userIdCounter = newUserId;
    }


    function createOrganisation(OrganisationCreationRequest calldata request) public returns(uint256){
        uint256 uid = _findUserIdfromAddress(msg.sender);
        if (users[uid].createdOn == 0) {
            revert NoUserFound();
        }
        require(this.checkUsernameAvailability(request.organisationUserName),"Username already exists");
        bytes32 usernameLower = toLower(request.organisationUserName);
        uint256 newOrganisationId = organisationIdCounter+1;
        Organisation memory newOrganisation = Organisation({
            username: usernameLower,
            organisationId: newOrganisationId,
            organisationName: request.organisationName,
            organisationBioIPFSHash: request.organisationBioIPFSHash,
            organisationProfilePhotoHash: request.organisationProfilePhotoHash,
            organisationProfileAvatar: request.organisationProfileAvatar,
            organisationTwitter_handle: request.organisationTwitter_handle,
            organisationFacebook_handle: request.organisationFacebook_handle,
            organisationInstagram_handle: request.organisationInstagram_handle,
            organisationExternal_link: request.organisationExternal_link,
            createdOn: block.timestamp,
            tags: request.tagsIds
        });
        organisations[newOrganisationId] = newOrganisation;
        isMemberInOrganisations[uid].push(newOrganisationId);
        membersOfOrganisation[newOrganisationId].push(uid);
        organisationIdCounter = newOrganisationId;
        usernames.push(request.organisationUserName);
        userNameToIdMapping[request.organisationUserName] = newOrganisationId;
        contractStore.gaslessContract().create_KeyPair_for_Organisation(newOrganisationId);
        return newOrganisationId;
    }

    function updateOrganisationData(uint256 givenOrganisationId,OrganisationCreationRequest calldata request) external {
        //check if sender is member of the organisation
        if (!_isAddressMemberOfOrganisation(msg.sender,givenOrganisationId)){
            revert UnAuthorizedAction();
        }
        if (organisations[givenOrganisationId].createdOn == 0){
            revert NoUserFound();
        }
        if (request.organisationUserName != "" && !this.checkUsernameAvailability(request.organisationUserName)){
            revert UserAlreadyExists();
        }
        if(request.organisationUserName!=""){
            removeUserNameFromMapping(organisations[givenOrganisationId].username);
            bytes32 usernameLower = toLower(request.organisationUserName);
            organisations[givenOrganisationId].username = usernameLower;
            usernames.push(usernameLower);
            userNameToIdMapping[usernameLower] = givenOrganisationId;
        }
        if (request.organisationName != "") {
            organisations[givenOrganisationId].organisationName = request.organisationName;
        }

        if (request.organisationBioIPFSHash.size != 0) {
            organisations[givenOrganisationId].organisationBioIPFSHash = request.organisationBioIPFSHash;
        }

        if (request.organisationProfilePhotoHash.size != 0) {
            organisations[givenOrganisationId].organisationProfilePhotoHash = request.organisationProfilePhotoHash;
        }

        if (request.organisationProfileAvatar > 0) {
            organisations[givenOrganisationId].organisationProfileAvatar = request.organisationProfileAvatar;
        }

        if (request.organisationTwitter_handle != "") {
            organisations[givenOrganisationId].organisationTwitter_handle = request.organisationTwitter_handle;
        }

        if (request.organisationFacebook_handle != "") {
            organisations[givenOrganisationId].organisationFacebook_handle = request.organisationFacebook_handle;
        }

        if (request.organisationInstagram_handle != "") {
            organisations[givenOrganisationId].organisationInstagram_handle = request.organisationInstagram_handle;
        }

        if (request.organisationExternal_link != "") {
            organisations[givenOrganisationId].organisationExternal_link = request.organisationExternal_link;
        }
    }


    function createPost(uint256 organisationId,IPFSHash calldata post) public {
        //check if organisationid is valid
        if (organisations[organisationId].createdOn == 0){
            revert NoUserFound();
        }
        //check if the user is a member of the organisation
        if (!_isAddressMemberOfOrganisation(msg.sender,organisationId)){
            revert UnAuthorizedAction();
        }
        require(post.size!=0);
        organisationPosts[organisationId].push(post);
        emit OrganisationPosted(organisationId,post);
    }

    function getAllOrganisationPost(uint256 organisationId) external view returns(IPFSHash[] memory){
        return organisationPosts[organisationId];
    }


    function getOrganisationUsernameFromId(uint256 organisationId) external view returns(bytes32){
        require(msg.sender == contractStore.surveyContractAddress(),"Unauthorized caller");
        return organisations[organisationId].username;
    }

    function getUsersOrganisationsId(address userAddress) public view returns(uint256[] memory){
        require(msg.sender==address(this)|| msg.sender == contractStore.surveyContractAddress()||msg.sender== contractStore.gaslessContractAddress(),"Unauthorized caller");
        // get the list of organisation ids the user is a member of
        uint256 uid = _findUserIdfromAddress(userAddress);
        if (users[uid].createdOn == 0){
            revert NoUserFound();
        }
        return isMemberInOrganisations[uid];
    }

    function _isAddressMemberOfOrganisation(address userAddress,uint256 organisationId) internal view returns(bool){
        uint256 uid = _findUserIdfromAddress(userAddress);
        if (users[uid].createdOn == 0){
            revert NoUserFound();
        }
        for (uint i = 0; i < isMemberInOrganisations[uid].length; i++) {
            if (isMemberInOrganisations[uid][i] == organisationId){
                return true;
            }
        }
        return false;
    }

    function isAddressMemberOfOrganisation(address userAddress,uint256 organisationId) public view returns(bool){
        require(msg.sender == contractStore.surveyContractAddress() || msg.sender == contractStore.gaslessContractAddress(),"Unauthorized caller");
        return _isAddressMemberOfOrganisation(userAddress,organisationId);
    }

    function getMyData(SignIn calldata auth) external view authenticated(auth,contractStore.profileContractAddress()) returns(User memory userProfile,Organisation[] memory memberInOrganisations){
        uint256 uid  =_findUserIdfromAddress(auth.user);
        if (users[uid].createdOn == 0){
            revert NoUserFound();
        }
        Organisation[] memory userOrganisations = new Organisation[](isMemberInOrganisations[uid].length);
        for (uint i = 0; i < isMemberInOrganisations[uid].length; i++) {
            userOrganisations[i] = organisations[isMemberInOrganisations[uid][i]];
        }
        return (users[uid],userOrganisations);
    }

    function addUserToOrganisation(address userAddress, uint256 organisationId) external  {
        // check if auth.user is memember of organisationId
        if (!_isAddressMemberOfOrganisation(msg.sender,organisationId)){
            revert UnAuthorizedAction();
        }

        uint256 uid = _findUserIdfromAddress(userAddress);
        if (users[uid].createdOn == 0){
            revert NoUserFound();
        }
        if (_isAddressMemberOfOrganisation(userAddress,organisationId)){
            revert InputDataError();
        }
        isMemberInOrganisations[uid].push(organisationId);
        membersOfOrganisation[organisationId].push(uid);
    }
    
    function listAllMembersOfOrganisation(uint256 organisationId,SignIn calldata auth) public view returns (address[] memory){
        require(isAuthenticated(auth,contractStore.profileContractAddress()));
        if (!_isAddressMemberOfOrganisation(auth.user,organisationId)){
            revert UnAuthorizedAction();
        }
        uint256[] memory members = membersOfOrganisation[organisationId];
        address[] memory memberAddresses = new address[](members.length);
        for (uint i = 0; i < members.length; i++) {
            memberAddresses[i] = users[members[i]].userAddress;
        }
        return memberAddresses;
    }

    function removeUserFromOrganisation(address userAddress,uint256 organisationId) external {
        // check if auth.user is memember of organisationId
        if (!_isAddressMemberOfOrganisation(msg.sender,organisationId)){
            revert UnAuthorizedAction();
        }
        uint256 uid = _findUserIdfromAddress(userAddress);
        if (users[uid].createdOn == 0){
            revert NoUserFound();
        }
        if (!_isAddressMemberOfOrganisation(userAddress,organisationId)){
            revert InputDataError();
        }
        if(membersOfOrganisation[organisationId].length == 1){
            revert InputDataError();
        }
        uint256[] memory newOrganisationMembers = new uint256[](membersOfOrganisation[organisationId].length-1);
        uint256 localvar = 0;
        for (uint i = 0; i < membersOfOrganisation[organisationId].length; i++) {
            if (membersOfOrganisation[organisationId][i] != uid){
                newOrganisationMembers[localvar] = membersOfOrganisation[organisationId][i];
                localvar = localvar + 1;
            }
        }
        membersOfOrganisation[organisationId] = newOrganisationMembers;
        uint256[] memory newMembersOfOrganisation = new uint256[](isMemberInOrganisations[uid].length-1);
        localvar = 0;
        for (uint i = 0; i < isMemberInOrganisations[uid].length; i++) {
            if (isMemberInOrganisations[uid][i] != organisationId){
                newMembersOfOrganisation[localvar] = isMemberInOrganisations[uid][i];
                localvar = localvar + 1;
            }
        }
        isMemberInOrganisations[uid] = newMembersOfOrganisation;
    }

    function findUserNameFromUserId(uint256 orgId) external view returns(bytes32 username,IPFSHash memory ipfs){
        return (organisations[orgId].username,organisations[orgId].organisationProfilePhotoHash);
    }

    function updateGaslessActionAllowed(string memory action, bool allowed) public {
        require(contractStore.rolesAccessControl().hasRole(ADMIN_ROLE, msg.sender));
        // TODO - check gasleft in loop
        GaslessActionAllowed[keccak256(bytes(action))]=allowed;
    }

    function isGaslessActionAllowed(string memory action) external view returns (bool) {
        return GaslessActionAllowed[keccak256(bytes(action))];
    }

    function userSignupWithProxy(userSignupRequest calldata request) external returns(bool) {
        // require that the function is gasless
        if(!GaslessActionAllowed[keccak256(bytes("userSignup"))]){revert GaslessActionNotAllowed();}
        require( msg.sender != address(0), "TX must be signed" );

        require( msg.sender == contractStore.gaslessContractAddress(), "Cannot call proxyVote directly" );
        // add the user
        addNewUser(request);
        return true;
    }

    function userSignupWithoutProxy(userSignupRequest calldata requests) external returns(bool) {
        // add the user
        if (requests.user != msg.sender){
            revert SignUpDataErrorWrongMessageSender();
        }
        addNewUser(requests);
        return true;
    }
    
    function updateUserData(userSignupRequest calldata request) external {
        uint256 uid = _findUserIdfromAddress(msg.sender);
        if (users[uid].createdOn == 0) {
            revert NoUserFound();
        }

        if (request.firstName != "") {
            users[uid].firstName = request.firstName;
        }

        if (request.lastName != "") {
            users[uid].lastName = request.lastName;
        }

        if (request.bio != "") {
            users[uid].bio = request.bio;
        }

        if (request.size != 0) {
            users[uid].profilePhotoHash = IPFSHash(request.digest,request.hashFunction,request.size);
        }

        if (request.profileAvatar>0) {
            users[uid].profileAvatar = request.profileAvatar;
        }

        if (request.twitter_handle != "") {
            users[uid].twitter_handle = request.twitter_handle;
        }

        if (request.facebook_handle != "") {
            users[uid].facebook_handle = request.facebook_handle;
        }

        if (request.instagram_handle != "") {
            users[uid].instagram_handle = request.instagram_handle;
        }

        if (request.external_link != "") {
            users[uid].external_link = request.external_link;
        }
    }

    function removeUserNameFromMapping(bytes32 username) internal {
        if (userNameToIdMapping[username] == 0){
            revert NoUserFound();
        }
        delete userNameToIdMapping[username];
    }

    function getOrganisationView(uint256 organisationId) external view returns(Organisation memory){
        return organisations[organisationId];
    }

    function searchMultipleUsersbyUsername(string memory search_term, uint _pageSize, uint _pageOffset) external view returns (UserSearchResultStruct[] memory) {
        require(_pageSize > 0, "Page size must be greater than 0");
        require(_pageOffset >= 0, "Page offset must be greater than or equal to 0");
        UserSearchResultStruct[] memory matchedUsers = new UserSearchResultStruct[](_pageSize);
        uint256 ignorehowmany = _pageSize * _pageOffset;
        uint256 localvar = 0;
        for (uint256 i = 0; i < usernames.length; i++) {
            string memory usernameStr = bytes32ToString(usernames[i]);
            if (containsSubstringIgnoreCase(usernameStr, search_term)) {
                if (ignorehowmany > 0) {
                    ignorehowmany--;
                } else {
                    uint256 id = userNameToIdMapping[usernames[i]];
                    Organisation memory organisation = organisations[id];
                    matchedUsers[localvar] = UserSearchResultStruct(
                        organisation.username,
                        id,
                        true,
                        organisation.organisationName,
                        "",
                        organisation.organisationProfilePhotoHash,
                        organisation.organisationProfileAvatar
                    );
                    localvar = localvar + 1;
                    if (localvar == _pageSize) {
                        break;
                    }
                }
            }
        }
        return matchedUsers;
    }

    function containsSubstringIgnoreCase(string memory _str, string memory _substr) public pure returns (bool) {
        bytes memory strBytes = bytes(_str);
        bytes memory substrBytes = bytes(_substr);

        uint256 j = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            // Case-insensitive comparison
            if (compareChars(tolower(strBytes[i]), tolower(substrBytes[j]))) {
                j++;
                if (j == substrBytes.length) {
                    return true; // Match found
                }
            } else {
                i -= j; // Move back to start of potential match
                j = 0;
            }
        }

        return false;
    }

    function tolower(bytes1 _b1) private pure returns (bytes1) {
        if (uint8(_b1) >= 65 && uint8(_b1) <= 90) {
            return bytes1(uint8(_b1) + 32); // Convert uppercase to lowercase
        }
        return _b1; // Leave other characters unchanged
    }

    function compareChars(bytes1 _a, bytes1 _b) private pure returns (bool) {
        return _a == _b || (tolower(_a) == tolower(_b));
    }

    function stringToBytes32(string memory _str) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(_str);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(_str, 32))
        }
    }

    function bytes32ToString(bytes32 _bytes32) private pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    function getUserVerificationStatus(uint256 user) external view 
    returns (UserHumanityVerificationStatus status,uint256 validUntil){
        return (users[user].humanityVerificationStatus,users[user].verificationValidUntil);
    }

    function updateUserVerificationStatus(address user,bool verified,uint256 validUntil) external {
        // require(msg.sender == contractStore.surveyContractAddress()||msg.sender == contractStore.surveyBackendContractAddress(), "Unauthorized access");
        require(msg.sender == contractStore.civicPassVerifyingContractAddressOnFantom());
        uint256 uid = _findUserIdfromAddress(user);
        if (users[uid].createdOn == 0){
            revert NoUserFound();
        }
        if (verified){
            users[uid].humanityVerificationStatus = UserHumanityVerificationStatus.VERIFIED;
            users[uid].verificationValidUntil = validUntil;
        }
    }

    function verifyUserHumanity(uint256 user) external view returns (bool){
        require(msg.sender == contractStore.surveyContractAddress()||msg.sender == contractStore.surveyBackendContractAddress()||msg.sender==contractStore.gaslessContractAddress());
        if (users[user].humanityVerificationStatus == UserHumanityVerificationStatus.VERIFIED && users[user].verificationValidUntil > block.timestamp){
            return true;
        }
        return false;
    }

    function verifyOrganisationVerificationStatus(uint256 organisationId) external view returns (bool){
        //check if all the members of the organisation are verified
        uint256[] memory members = membersOfOrganisation[organisationId];
        for (uint i = 0; i < members.length; i++) {
            if (users[members[i]].humanityVerificationStatus != UserHumanityVerificationStatus.VERIFIED || users[members[i]].verificationValidUntil < block.timestamp){
                return false;
            }
        }
        return true;
    }

    function adminUpdateUserVerificationStatus(uint256[] calldata user,UserHumanityVerificationStatus[] calldata status,uint256[] calldata validUntil) external {
        require(contractStore.rolesAccessControl().hasRole(VERIFIER_ROLE, msg.sender), "Unauthorized");
        for (uint i;i<user.length;i++){
        users[user[i]].humanityVerificationStatus = status[i];
        users[user[i]].verificationValidUntil = validUntil[i];
        }
    }

    function getTotalUserCount() external view returns(uint256){
        return userIdCounter-139830;
    }

    function deleteOrganisation(uint256 organisationId) external {
        // require msg.sender is part of the organisation
        if (!_isAddressMemberOfOrganisation(msg.sender,organisationId)){
            revert UnAuthorizedAction();
        }
        //require the members of this organisation length is one
        if (membersOfOrganisation[organisationId].length > 1){
            revert UnAuthorizedAction();
        }
        if (organisations[organisationId].createdOn == 0){
            revert NoUserFound();
        }
        // get address of organisation
        address orgAddress = contractStore.gaslessContract().getAddressOfOrganisation(organisationId);
        // get balance of organisation
        // if balance > 1 ethers then can't delete
        if (orgAddress.balance > 1 ether){
            revert UnAuthorizedAction();
        }
        delete organisations[organisationId];
        delete isMemberInOrganisations[organisationId];
        delete membersOfOrganisation[organisationId];
    }

function getMyAdminRoles(SignIn calldata auth) public view returns (bool[2] memory) {
    require(isAuthenticated(auth, contractStore.profileContractAddress()));

    bool isAdmin = contractStore.rolesAccessControl().hasRole(ADMIN_ROLE, auth.user);
    bool isVerifier = contractStore.rolesAccessControl().hasRole(VERIFIER_ROLE, auth.user);

    return [isAdmin, isVerifier];
}


}