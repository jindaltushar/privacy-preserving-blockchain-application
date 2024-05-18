
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {Sapphire} from '@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol';
import {EIP155Signer} from '@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol';
import {SignatureRSV,EthereumUtils} from '@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol';
import {UserHumanityVerificationStatus,SurveyAccount,userSignupRequest,AnswerSurveyRequest,QuestionType,AnswerType,EthereumKeypair,changedAnswerRequest,SignIn} from "./Types.sol";
import {ContractStore} from "./ContractStore.sol";
import "./safeMath.sol";
import "./AuthenticatedViewCall.sol";



contract GaslessContract is AuthenticatedViewCall {
    error AuthenticationFailed();
    using SafeMath for uint256;

    EthereumKeypair[] private keypairs;

    mapping(address => uint256) keypair_addresses;

    bytes32 immutable private encryptionSecret;
    bytes32 immutable private textResponseNonce;

    uint64 private gaslimit = 900000;
    uint64 private masterGasPrice = 100000000000;
    uint256 private minimumMaintainBalance = 100000000000000000;
    ContractStore public contractStore;
    mapping(uint256 => address) private organisationIdAccount;
    mapping(uint256 => address) private surveyOnChainAccount;
    mapping(uint256 => uint256[]) private organisationSurveyIds;
    mapping(bytes32 => uint256) private amountPaid;
    address[] private adminAccounts;

    mapping(bytes32 => uint64) private functionGasCost;

    constructor (address _contract_store) 
        payable
    {
        contractStore = ContractStore(_contract_store);
        // Generate an encryption key, it is only used by this contract to encrypt data for itself
        encryptionSecret = bytes32(Sapphire.randomBytes(32, ""));
        textResponseNonce = bytes32(Sapphire.randomBytes(32, ""));
        // Generate a keypair which will be used to submit transactions to invoke this contract
        //(signerAddr, signerSecret) = EthereumUtils.generateKeypair();
        
        // generate 10 keypairs and distribute the gas money to them
        address signerAddr = internal_addKeypair();
        adminAccounts.push(signerAddr);
        if( msg.value > 0 ) {
            payable(signerAddr).transfer(msg.value);
        }
        functionGasCost[keccak256(abi.encodePacked("userSignup"))] = 500000;
        functionGasCost[keccak256(abi.encodePacked("perAnswer"))] = 500000;
        functionGasCost[keccak256(abi.encodePacked("answerBaseFee"))] = 800000;
        functionGasCost[keccak256(abi.encodePacked("transferTokenTransaction"))] = 150000;
    }


    function create_KeyPair_for_Organisation(uint256 organisationId) external {
        require(msg.sender == contractStore.profileContractAddress());
        address signerAddr = internal_addKeypair();
        organisationIdAccount[organisationId] = signerAddr;
    }

    function getOrganisationAccountPublicKey(uint256 organisationId) external view returns (address){
        return organisationIdAccount[organisationId];
    }

    function internal_addKeypair()
        internal
        returns (address)
    {
        (address signerAddr, bytes32 signerSecret) = EthereumUtils.generateKeypair();

        keypair_addresses[signerAddr] = keypairs.length + 1;

        keypairs.push(EthereumKeypair(
            signerAddr,
            signerSecret,
            0
        ));

        return signerAddr;
    }

    function getCostOfFunction(string memory function_name) public view returns (uint64){
        return functionGasCost[keccak256(abi.encodePacked(function_name))];
    }

    function setCostOfFunction(string memory function_name, uint64 cost) public {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));
        functionGasCost[keccak256(abi.encodePacked(function_name))] = cost;
    }

    function setMinimumMaintainBalance(uint256 newMinimumMaintainBalance) public {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));
        minimumMaintainBalance = newMinimumMaintainBalance;
    }

    /**
     * Select a random keypair
     */
    function internal_randomKeypair()
        internal view
        returns (EthereumKeypair storage)
    {
        uint16 x = uint16(bytes2(Sapphire.randomBytes(2, "")));
        // chose random address from organisationID where id is my_id;
        return internal_keypairByAddress(adminAccounts[x % adminAccounts.length]);
    }

    function internal_KeypairForSurvey(uint256 surveyId)
        internal view
        returns (EthereumKeypair storage)
    {
        return internal_keypairByAddress(surveyOnChainAccount[surveyId]);
    }

    function getAllAdminAddresses(SignIn calldata auth) external view returns (address[] memory){
        if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), auth.user));
        return adminAccounts;
    }

    function setGasPrice(uint64 newgasprice) external {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));
        masterGasPrice = newgasprice;
    }
    /**
     * Select a keypair given its address
     * Reverts if it's not one of our keypairs
     * @param addr Ethererum public address
     */
    function internal_keypairByAddress(address addr)
        internal view
        returns (EthereumKeypair storage)
    {
        uint256 offset = keypair_addresses[addr];

        require( offset != 0 );

        return keypairs[offset - 1];
    }

    /**
     * Reimburse msg.sender for the gas spent
     * @param gas_start Statring gas measurement
     */
    function internal_reimburse(uint gas_start)
        internal
    {
        uint my_balance = address(this).balance;

        if( my_balance > 0 )
        {
            uint gas_cost = (gasleft() - gas_start) + 20000;

            uint to_transfer = (gas_cost * tx.gasprice) + block.basefee;

            to_transfer = to_transfer > my_balance ? my_balance : to_transfer;

            if( to_transfer > 0 )
            {
                payable(msg.sender).transfer(to_transfer);
            }
        }
    }

    event KeypairCreated(address addr);

    /**
     * Create a random keypair, sending some gas to it
     */
    function addAdminKeypair ()
        external payable
    {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));

        address addr = internal_addKeypair();

        adminAccounts.push(addr);
        emit KeypairCreated(addr);

        if( msg.value > 0 )
        {
            payable(addr).transfer(msg.value);
        }
    }

    function newSurveyCreated(uint256 surveyId,uint256 createdBy) public returns(address) {
        require(msg.sender!=address(0));
        require(msg.sender == contractStore.surveyContractAddress()||msg.sender == contractStore.surveyBackendContractAddress());
        address signerAddr = internal_addKeypair();
        surveyOnChainAccount[surveyId] = signerAddr;
        organisationSurveyIds[createdBy].push(surveyId);
        return signerAddr;
    }

    function getChainId()
        external view
        returns (uint256)
    {
        return block.chainid;
    }

    function makeUserSignupTransaction(userSignupRequest calldata request,SignIn calldata auth) external view  returns (bytes memory output){
        if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        require(contractStore.profileContract().isGaslessActionAllowed("userSignup"));
        // Encrypt request to authenticate it when invoked again
        bytes32 ciphertextNonce = keccak256(abi.encodePacked(encryptionSecret,auth.user,block.timestamp));
        // Inner call to DAO contract
        bytes memory innercall = abi.encodeWithSelector(contractStore.profileContract().userSignupWithProxy.selector,request);
        // Encrypt inner call, with DAO address as target
        bytes memory ciphertext = Sapphire.encrypt(encryptionSecret, ciphertextNonce, abi.encode(contractStore.profileContractAddress(), innercall), "");

        // Call will invoke the proxy
        bytes memory data = abi.encodeWithSelector(this.proxy.selector, ciphertextNonce, ciphertext);

        // Retreive a random keypair
        EthereumKeypair storage kp = internal_randomKeypair();

        return EIP155Signer.sign(kp.addr, kp.secret, EIP155Signer.EthTx({
            nonce: kp.nonce,
            gasPrice: masterGasPrice,
            gasLimit: functionGasCost[keccak256(abi.encodePacked("userSignup"))], // Consider adjusting this gas limit
            to: address(this),
            value: 0,
            data: data,
            chainId: block.chainid
        }));
    }

    function makeAnswerSurveyTransaction(uint256 surveyId,uint256[] calldata questionIndex,bytes32[] calldata answerHashIPFSDigest,uint8[] calldata answerHashIPFSHashFunction, uint8[] calldata answerHashIPFSHashSize, uint256[][] calldata  optionIndexes,AnswerType[] calldata ansType,SignIn calldata auth) external view returns (bytes memory output){
          if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        require(contractStore.profileContract().isGaslessActionAllowed("userSurveyAnswer"));
        uint256 userId = contractStore.profileContract().findUserIdfromAddress(auth.user);
        (UserHumanityVerificationStatus status,uint256 until) = contractStore.profileContract().getUserVerificationStatus(userId);
        require(status == UserHumanityVerificationStatus.VERIFIED && until > block.timestamp);
        require(checkSurveyAccountBalance(surveyId) > 1  ether);
        // Encrypt request to authenticate it when invoked again
        bytes32 ciphertextNonce = keccak256(abi.encodePacked(encryptionSecret,auth.user,block.timestamp));
        // Inner call to DAO contract
        // get userId of the auth.user
        // uint256 userId = contractStore.profileContract().findUserIdfromAddress(auth.user);

        bytes memory innercall = abi.encodeWithSelector(contractStore.surveyContract().SubmitAnswerToSurveyWithProxy.selector,surveyId,questionIndex,answerHashIPFSDigest,answerHashIPFSHashFunction,answerHashIPFSHashSize,optionIndexes,ansType,auth.user);
        // Encrypt inner call, with DAO address as target
        bytes memory ciphertext = Sapphire.encrypt(encryptionSecret, ciphertextNonce, abi.encode(contractStore.surveyContractAddress(), innercall), "");

        // Call will invoke the proxy
        bytes memory data = abi.encodeWithSelector(this.proxy.selector, ciphertextNonce, ciphertext);

        // Retreive  keypair for survey
        EthereumKeypair storage kp = internal_KeypairForSurvey(surveyId);

        return EIP155Signer.sign(kp.addr, kp.secret, EIP155Signer.EthTx({
            nonce: kp.nonce,
            gasPrice: masterGasPrice,
            gasLimit: (functionGasCost[keccak256(abi.encodePacked("perAnswer"))] * uint64(questionIndex.length)) + functionGasCost[keccak256(abi.encodePacked("answerBaseFee"))], // Consider adjusting this gas limit
            to: address(this),
            value: 0,
            data: data,
            chainId: block.chainid
        }));
    }

    function payRespondant(uint256 surveyId,address respondant,uint256 amount) external view returns (bytes memory output) {
        require(msg.sender == contractStore.surveyContractAddress());
        require(surveyOnChainAccount[surveyId].balance > amount);
        return createProxySendValueTransaction(amount,respondant,surveyOnChainAccount[surveyId],true);
    }

    function walletTransactFromOrganisation(address to,uint256 orgId,uint256 amount,SignIn calldata auth) external view returns (bytes memory output){
        if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        //check if auth.user is part of organisation
        require(contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,orgId));
        //get the address of organisation
        address from = organisationIdAccount[orgId];
        //check if balance of from is greater than amount
        require(from.balance > amount);
        // check if the auth.user is owner of from
        // if address is part of organisation id
        return createProxySendValueTransaction(amount,to,from,false);
    }

    function walletTransactFromSurvey(address to,uint256 surveyId,uint256 amount,SignIn calldata auth) external view returns (bytes memory output){
        if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        // get the organisation id of survey
        uint256 orgId = contractStore.surveyContract().getSurveyCreatedBy(surveyId);
        //check if auth.user is part of organisation
        require(contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,orgId));
        //get the address of survey
        address from = surveyOnChainAccount[surveyId];
        //check if balance of from is greater than amount
        require(from.balance > amount);
        return createProxySendValueTransaction(amount,to,from,false);
    }

    function createProxySendValueTransaction(uint256 value, address recipient,address sender,bool isSecondCall) internal view returns (bytes memory) {
        bytes32 ciphertextNonce = keccak256(abi.encodePacked(encryptionSecret,recipient,sender,block.timestamp));
        bytes memory ciphertext = Sapphire.encrypt(encryptionSecret, ciphertextNonce, abi.encode(recipient,1), "");
        bytes memory data = abi.encodeWithSelector(this.proxySendValue.selector, ciphertextNonce, ciphertext);
        EthereumKeypair memory kp = internal_keypairByAddress(sender);
        uint64 newNonce ; 
        if(isSecondCall){
            newNonce = kp.nonce +1;
        }else{
            newNonce = kp.nonce;
        }
        return EIP155Signer.sign(kp.addr, kp.secret, EIP155Signer.EthTx({
            nonce: newNonce, // Update with appropriate nonce
            gasPrice: masterGasPrice, // Update with appropriate gas price
            gasLimit: functionGasCost[keccak256(abi.encodePacked("transferTokenTransaction"))], // Update with appropriate gas limit
            to: address(this),
            value: value,
            data: data,
            chainId: block.chainid
        }));
    }

    function proxySendValue(bytes32 ciphertextNonce,bytes calldata ciphertext) external payable {
        uint gas_start = gasleft();
        EthereumKeypair storage kp = internal_keypairByAddress(msg.sender);
        (address addr,) = abi.decode(Sapphire.decrypt(encryptionSecret,ciphertextNonce, ciphertext, ""),(address,uint256));
        bool success = payable(addr).send(msg.value);
        kp.nonce += 1;
        amountPaid[keccak256(abi.encode(msg.sender,addr))] = msg.value;
        internal_reimburse(gas_start);

    }

    function getAmountPaid(uint256 surveyId,address respondant) external view returns (uint256){
        return amountPaid[keccak256(abi.encode(surveyOnChainAccount[surveyId],respondant))];
    }

    function proxy(bytes32 ciphertextNonce, bytes memory data) 
        external payable
    {
        uint gas_start = gasleft();

        EthereumKeypair storage kp = internal_keypairByAddress(msg.sender);

        (address addr, bytes memory subcall_data) = abi.decode(Sapphire.decrypt(encryptionSecret, ciphertextNonce, data, ""), (address, bytes));
            (bool success, bytes memory result) =  addr.call{value: msg.value}(subcall_data);
        kp.nonce += 1;
        internal_reimburse(gas_start);
    }

    function getNonceOfKeyPairAddress(address addr) external view returns (uint64){
        EthereumKeypair storage kp = internal_keypairByAddress(addr);
        return kp.nonce;
    }

    function manually_adjust_nonce(address addr, uint64 nonce)
        external
    {
        require(contractStore.rolesAccessControl().hasRole(keccak256("ADMIN_ROLE"), msg.sender));

        EthereumKeypair storage kp = internal_keypairByAddress(addr);

        kp.nonce = nonce;
    }

    function manually_adjust_nonce_for_organisationAccount(uint256 organisationId, uint64 nonce) public  {
        // check if msg.sender has access in organisation from profile contract
        uint256[] memory ids = contractStore.profileContract().getUsersOrganisationsId(msg.sender);
        bool hasAccess = false;
        for (uint i = 0; i < ids.length; i++){
            if (ids[i] == organisationId){
                hasAccess = true;
                break;
            }
        }
        require(hasAccess);
        EthereumKeypair storage kp = internal_keypairByAddress(organisationIdAccount[organisationId]);
        kp.nonce = nonce;

    }

    function manually_adjust_nonce_for_surveyAccount(uint256 surveyId,uint256 organisationId, uint64 nonce) public  {
        //check if survey id exists in organisation survey ids
        bool hasAccess = false;
        for (uint i = 0; i < organisationSurveyIds[organisationId].length; i++){
            if (organisationSurveyIds[organisationId][i] == surveyId){
                hasAccess = true;
                break;
            }
        }
        require(hasAccess);
        // check if msg.sender has access in organisation from profile contract
        uint256[] memory ids = contractStore.profileContract().getUsersOrganisationsId(msg.sender);
        hasAccess = false;
        for (uint i = 0; i < ids.length; i++){
            if (ids[i] == organisationId){
                hasAccess = true;
                break;
            }
        }
        require(hasAccess);
        EthereumKeypair storage kp = internal_keypairByAddress(surveyOnChainAccount[surveyId]);
        kp.nonce = nonce;

    }

    function encode(SignIn calldata auth,string calldata _data) public view 
     returns (bytes memory cipher,bytes32 nonce){
          if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
            //create nonce from auth.user and block.timestamp
            bytes32 _nonce = keccak256(abi.encodePacked(auth.user));
            //encrypt data with nonce
            bytes memory _ciphertext = Sapphire.encrypt(encryptionSecret,_nonce,abi.encode(_data),"");
            return (_ciphertext,_nonce);
    }

    function decode(bytes memory _cipherText,bytes32 _nonce) public view returns (string memory){
        //decrypt data with nonce
        bytes memory _data = Sapphire.decrypt(encryptionSecret,_nonce,_cipherText,"");
        return abi.decode(_data,(string));
    }

    function SapphireEncrypt(bytes memory _data,bytes32 _nonce) public view returns (bytes memory){
        require(contractStore.surveyContractAddress() == msg.sender||contractStore.surveyBackendContractAddress() == msg.sender,"Only Survey or Survey Backend contract can call this function");
        //encrypt data with nonce
        bytes memory _ciphertext = Sapphire.encrypt(encryptionSecret,_nonce,_data,"");
        return _ciphertext;
    }


    function encodeTextAnswer(uint256 surveyId,string calldata answerText,SignIn calldata auth) public view  returns (bytes memory cypherForOrganisation,bytes memory cypherForUser){
       //get the address of userid
         if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
       uint256 createdBy = contractStore.surveyContract().getSurveyCreatedBy(surveyId);
       bytes32 nonce1 = keccak256(abi.encodePacked(createdBy,textResponseNonce));
       bytes memory _cypherForOrganisation = Sapphire.encrypt(encryptionSecret,nonce1,abi.encode(answerText),"");
       bytes32 nonce2 = keccak256(abi.encodePacked(auth.user,textResponseNonce));
       bytes memory _cypherForUser = Sapphire.encrypt(encryptionSecret,nonce2,abi.encode(answerText),"");
       return (_cypherForOrganisation,_cypherForUser);
    }

    function decodeTextAnswerForOrganisation(uint256 orgId,bytes memory _cypherText,SignIn calldata auth) public view  returns (string memory){
          if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        //check if auth.user is part of the organisation
        require(contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,orgId));
        bytes32 nonce = keccak256(abi.encodePacked(orgId,textResponseNonce));
        bytes memory _data = Sapphire.decrypt(encryptionSecret,nonce,_cypherText,"");
        return abi.decode(_data,(string));
    }

    function decodeTextAnswerForUser(bytes memory _cypherText,SignIn calldata auth) public view  returns (string memory){
          if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        bytes32 nonce = keccak256(abi.encodePacked(auth.user,textResponseNonce));
        bytes memory _data = Sapphire.decrypt(encryptionSecret,nonce,_cypherText,"");
        return abi.decode(_data,(string));
    }
    
    function getAddressesOfOrganisation(uint256 organisationId,SignIn calldata auth) public view returns (address orgAddress,SurveyAccount[] memory surveyAccounts){
        if(!isAuthenticated(auth,contractStore.profileContractAddress())){
            revert AuthenticationFailed();
        }
        require(contractStore.profileContract().isAddressMemberOfOrganisation(auth.user,organisationId));
        address orgAddr = organisationIdAccount[organisationId];
        uint256[] memory surveyIds = organisationSurveyIds[organisationId];
        SurveyAccount[] memory _surveyAccounts = new SurveyAccount[](surveyIds.length);
        for (uint i = 0; i < surveyIds.length; i++){
            _surveyAccounts[i] = SurveyAccount(surveyIds[i],surveyOnChainAccount[surveyIds[i]]);
        }
        return (orgAddr,_surveyAccounts);
    }

    function checkSurveyAccountBalance(uint256 surveyId) public view returns (uint256){
        return surveyOnChainAccount[surveyId].balance;
    }

    function getAddressOfOrganisation(uint256 organisationId) public view returns (address){
        return organisationIdAccount[organisationId];
    }
    function getorganisationSurveyIds(uint256 oid) public view returns (uint256[] memory){
        return organisationSurveyIds[oid];
    }
    function getsurveyOnChainAccount(uint256 surveyId) public view returns (address){
        return surveyOnChainAccount[surveyId];
    }

    
}
