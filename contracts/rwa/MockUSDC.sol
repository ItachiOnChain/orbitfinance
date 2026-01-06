// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Test stablecoin for RWA lending
 */
contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 10_000_000 * 10**6); // 10M USDC
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    /**
     * @notice Mint new tokens (for testing)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Mint tokens to caller (for testing)
     * @param amount Amount to mint
     */
    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
