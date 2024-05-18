// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {SignIn} from "./Types.sol";

contract AuthenticatedViewCall {
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    string public constant SIGNIN_TYPE = "SignIn(address user,uint256 time)";
    bytes32 public constant SIGNIN_TYPEHASH = keccak256(bytes(SIGNIN_TYPE));
    bool public checkCivicPass = false;
    
    error Unauthorized();
    modifier authenticated(SignIn calldata auth,address profile_address)
    {
        if(!isAuthenticated(auth,profile_address)){
            revert Unauthorized();}
        _;
    }


    function isAuthenticated(SignIn calldata auth,address profile_address) public view returns (bool)
    {
        bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("Survey.SignIn"),
            keccak256("1"),
            block.chainid,
            profile_address
        ));
        // Must be signed within 24 hours ago.
        if( auth.time < (block.timestamp - (60*60*24)) )
        {
            return false;
        }

        // Validate EIP-712 sign-in authentication.
        bytes32 authdataDigest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                SIGNIN_TYPEHASH,
                auth.user,
                auth.time
            ))
        ));

        address recovered_address = ecrecover(
            authdataDigest, uint8(auth.rsv.v), auth.rsv.r, auth.rsv.s);

        return recovered_address == auth.user;
    }

}