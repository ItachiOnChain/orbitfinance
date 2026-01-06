// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IdentityRegistry
 * @notice KYC whitelist management for RWA participants
 */
contract IdentityRegistry {
    mapping(address => bool) public isVerified;
    mapping(address => bool) public isAdmin;
    
    event UserVerified(address indexed user, address indexed verifiedBy);
    event AdminAdded(address indexed admin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "IdentityRegistry: caller is not admin");
        _;
    }
    
    constructor() {
        isAdmin[msg.sender] = true;
        emit AdminAdded(msg.sender, msg.sender);
    }
    
    /**
     * @notice Verify a user for KYC compliance
     * @param user Address to verify
     */
    function verifyUser(address user) external onlyAdmin {
        require(!isVerified[user], "IdentityRegistry: user already verified");
        isVerified[user] = true;
        emit UserVerified(user, msg.sender);
    }
    
    /**
     * @notice Mock verification for testing (anyone can call)
     * @param user Address to verify
     */
    function mockVerifyUser(address user) external {
        isVerified[user] = true;
        emit UserVerified(user, msg.sender);
    }
    
    /**
     * @notice Add a new admin
     * @param newAdmin Address to grant admin privileges
     */
    function addAdmin(address newAdmin) external onlyAdmin {
        require(!isAdmin[newAdmin], "IdentityRegistry: already admin");
        isAdmin[newAdmin] = true;
        emit AdminAdded(newAdmin, msg.sender);
    }
    
    /**
     * @notice Remove an admin
     * @param admin Address to revoke admin privileges
     */
    function removeAdmin(address admin) external onlyAdmin {
        require(isAdmin[admin], "IdentityRegistry: not an admin");
        require(admin != msg.sender, "IdentityRegistry: cannot remove self");
        isAdmin[admin] = false;
        emit AdminRemoved(admin, msg.sender);
    }
    
    /**
     * @notice Batch verify multiple users
     * @param users Array of addresses to verify
     */
    function batchVerifyUsers(address[] calldata users) external onlyAdmin {
        for (uint256 i = 0; i < users.length; i++) {
            if (!isVerified[users[i]]) {
                isVerified[users[i]] = true;
                emit UserVerified(users[i], msg.sender);
            }
        }
    }
}
