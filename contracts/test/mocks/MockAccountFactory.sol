// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAccountFactory} from "../../interfaces/IAccountFactory.sol";

contract MockAccountFactory is IAccountFactory {
    mapping(address => bool) private validAccounts;
    mapping(address => address) private userAccounts;

    function registerAccount(address account) external {
        validAccounts[account] = true;
    }

    function isValidAccount(address account) external view returns (bool) {
        return validAccounts[account];
    }

    function createAccount(address user) external returns (address) {
        address account = address(
            uint160(uint256(keccak256(abi.encodePacked(user, block.timestamp))))
        );
        validAccounts[account] = true;
        userAccounts[user] = account;
        return account;
    }

    function getAccount(address user) external view returns (address) {
        return userAccounts[user];
    }
}
