// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import { userSignupRequest} from "./Types.sol";

interface AcceptsProxy{
    function isGaslessActionAllowed(string memory action) external view returns (bool);
    function userSignupWithProxy(userSignupRequest calldata request) external returns(bool);
}