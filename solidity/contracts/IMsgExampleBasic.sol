// SPDX-License-Identifier: GPL-3.0-only

pragma solidity >=0.8.9;

interface IMsgExampleBasic {
    function sendMessage(address _dstContract, uint64 _dstChainId, bytes calldata _message) external payable;
}
