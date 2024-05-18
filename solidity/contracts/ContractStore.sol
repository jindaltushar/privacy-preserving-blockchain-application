//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./GaslessContract.sol";
import "./Vault.sol";
import "./SurveyContract.sol";
import "./Profile.sol";
import "./RolesAccessControl.sol";
import "./PriceOracle.sol";
import "./SurveyBackendContract.sol";
import "./IMsgExampleBasic.sol";

contract ContractStore {

    // this contract will be used to set the address of these contracts 
    // so that we can use them in the future
    address public roleAccessControlAddress;
    RolesAccessControl public rolesAccessControl;
    address public priceOracleAddress;
    PriceOracle public priceOracle;
    address public gaslessContractAddress;
    GaslessContract public gaslessContract;
    address public surveyContractAddress;
    SurveyContract public surveyContract;
    address public profileContractAddress;
    Profile public profileContract;
    address public vaultContractAddress;
    Vault public vaultContract;
    address public owner;
    address public surveyBackendContractAddress;
    SurveyBackendContract public surveyBackendContract;
    address public msgExampleBasicAddress;
    IMsgExampleBasic public msgExampleBasic;
    address public civicPassVerifyingContractAddressOnFantom;

    constructor() {
        owner = msg.sender;
        roleAccessControlAddress = address(0);
        priceOracleAddress = address(0);
        gaslessContractAddress = address(0);
        surveyContractAddress = address(0);
        profileContractAddress = address(0);
        vaultContractAddress = address(0);
        surveyBackendContractAddress= address(0);
        msgExampleBasicAddress = address(0);
        civicPassVerifyingContractAddressOnFantom = address(0);
    }

    function setRoleAccessControlAddress(address _roleAccessControlAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        roleAccessControlAddress = _roleAccessControlAddress;
        rolesAccessControl = RolesAccessControl(roleAccessControlAddress);
    }


    function setPriceOracleAddress(address _priceOracleAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        priceOracleAddress = _priceOracleAddress;
        priceOracle = PriceOracle(priceOracleAddress);
    }

    function setGaslessContractAddress(address _gaslessContractAddress) public  {
        require(msg.sender == owner, "Only owner can set the address");
        gaslessContractAddress = _gaslessContractAddress;
        gaslessContract = GaslessContract(gaslessContractAddress);
    }

    function setSurveyContractAddress(address _surveyContractAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        surveyContractAddress = _surveyContractAddress;
        surveyContract = SurveyContract(surveyContractAddress);
    }

    function setProfileContractAddress(address _profileContractAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        profileContractAddress = _profileContractAddress;
        profileContract = Profile(profileContractAddress);
    }

    function setVaultContractAddress(address _vaultContractAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        vaultContractAddress = _vaultContractAddress;
        vaultContract = Vault(vaultContractAddress);
    }

    function setSurveyBackendContractAddress(address _surveyBackendContractAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        surveyBackendContractAddress = _surveyBackendContractAddress;
        surveyBackendContract = SurveyBackendContract(surveyBackendContractAddress);
    }

    function setMsgExampleBasicAddress(address _msgExampleBasicAddress) public {
        require(msg.sender == owner, "Only owner can set the address");
        msgExampleBasicAddress = _msgExampleBasicAddress;
        msgExampleBasic = IMsgExampleBasic(msgExampleBasicAddress);
    }

    function setFantomCivicPassVerifyingContractAddress(address _civicPassVerifyingContractAddressOnFantom) public {
        require(msg.sender == owner, "Only owner can set the address");
        civicPassVerifyingContractAddressOnFantom = _civicPassVerifyingContractAddressOnFantom;
    }
}