// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IGatewayToken {
    function getToken(
        uint256 tokenId
    ) external view returns (address owner, uint8 state, string memory identity, uint256 expiration, uint256 bitmask);

    function getTokenIdsByOwnerAndNetwork(
        address owner,
        uint network,
        bool onlyActive
    ) external view returns (uint[] memory) ;

}