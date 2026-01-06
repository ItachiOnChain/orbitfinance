// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IdentityRegistry.sol";
import "./RWAIncomeNFT.sol";

/**
 * @title OrbitRWAPool
 * @notice Main lending pool for RWA collateral with 50% LTV
 */
contract OrbitRWAPool is ReentrancyGuard {
    IERC20 public immutable usdc;
    RWAIncomeNFT public immutable rwaIncomeNFT;
    IdentityRegistry public immutable identityRegistry;
    
    uint256 public constant LTV_RATIO = 5000; // 50% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    struct UserPosition {
        uint256[] collateralNFTs;
        uint256 totalDebt;
        bool autoRepayEnabled;
    }
    
    mapping(address => UserPosition) public userPositions;
    mapping(uint256 => address) public nftDepositor; // NFT ID => depositor
    
    event CollateralDeposited(address indexed user, uint256 indexed nftId, uint256 value);
    event Borrowed(address indexed user, uint256 amount, uint256 totalDebt);
    event Repaid(address indexed user, uint256 amount, uint256 remainingDebt);
    event CollateralWithdrawn(address indexed user, uint256 indexed nftId);
    event AutoRepayEnabled(address indexed user);
    
    constructor(
        address _usdc,
        address _rwaIncomeNFT,
        address _identityRegistry
    ) {
        usdc = IERC20(_usdc);
        rwaIncomeNFT = RWAIncomeNFT(_rwaIncomeNFT);
        identityRegistry = IdentityRegistry(_identityRegistry);
    }
    
    /**
     * @notice Deposit RWA NFT as collateral
     * @param nftId Token ID of the RWA NFT
     */
    function depositCollateral(uint256 nftId) external nonReentrant {
        require(identityRegistry.isVerified(msg.sender), "OrbitRWAPool: user not KYC verified");
        require(rwaIncomeNFT.ownerOf(nftId) == msg.sender, "OrbitRWAPool: not NFT owner");
        
        // Transfer NFT to pool
        rwaIncomeNFT.transferFrom(msg.sender, address(this), nftId);
        
        // Record collateral
        userPositions[msg.sender].collateralNFTs.push(nftId);
        nftDepositor[nftId] = msg.sender;
        
        uint256 nftValue = rwaIncomeNFT.getValue(nftId);
        emit CollateralDeposited(msg.sender, nftId, nftValue);
    }
    
    /**
     * @notice Borrow USDC against deposited collateral
     * @param amount Amount of USDC to borrow
     */
    function borrow(uint256 amount) external nonReentrant {
        require(identityRegistry.isVerified(msg.sender), "OrbitRWAPool: user not KYC verified");
        require(amount > 0, "OrbitRWAPool: amount must be > 0");
        
        UserPosition storage position = userPositions[msg.sender];
        uint256 collateralValue = getUserCollateralValue(msg.sender);
        uint256 maxBorrow = (collateralValue * LTV_RATIO) / BASIS_POINTS;
        
        require(position.totalDebt + amount <= maxBorrow, "OrbitRWAPool: exceeds LTV limit");
        require(usdc.balanceOf(address(this)) >= amount, "OrbitRWAPool: insufficient liquidity");
        
        position.totalDebt += amount;
        usdc.transfer(msg.sender, amount);
        
        emit Borrowed(msg.sender, amount, position.totalDebt);
    }
    
    /**
     * @notice Repay borrowed USDC
     * @param amount Amount to repay
     */
    function repay(uint256 amount) external nonReentrant {
        UserPosition storage position = userPositions[msg.sender];
        require(position.totalDebt > 0, "OrbitRWAPool: no debt to repay");
        
        uint256 repayAmount = amount > position.totalDebt ? position.totalDebt : amount;
        
        usdc.transferFrom(msg.sender, address(this), repayAmount);
        position.totalDebt -= repayAmount;
        
        emit Repaid(msg.sender, repayAmount, position.totalDebt);
    }
    
    /**
     * @notice Repay debt on behalf of another user (for auto-repayment)
     * @param borrower Address of the borrower
     * @param amount Amount to repay
     */
    function repayOnBehalfOf(address borrower, uint256 amount) external nonReentrant {
        UserPosition storage position = userPositions[borrower];
        require(position.totalDebt > 0, "OrbitRWAPool: no debt to repay");
        
        uint256 repayAmount = amount > position.totalDebt ? position.totalDebt : amount;
        
        usdc.transferFrom(msg.sender, address(this), repayAmount);
        position.totalDebt -= repayAmount;
        
        emit Repaid(borrower, repayAmount, position.totalDebt);
    }
    
    /**
     * @notice Withdraw collateral NFT (only if no debt)
     * @param nftId Token ID to withdraw
     */
    function withdrawCollateral(uint256 nftId) external nonReentrant {
        require(nftDepositor[nftId] == msg.sender, "OrbitRWAPool: not your collateral");
        require(userPositions[msg.sender].totalDebt == 0, "OrbitRWAPool: must repay debt first");
        
        // Remove NFT from collateral array
        UserPosition storage position = userPositions[msg.sender];
        for (uint256 i = 0; i < position.collateralNFTs.length; i++) {
            if (position.collateralNFTs[i] == nftId) {
                position.collateralNFTs[i] = position.collateralNFTs[position.collateralNFTs.length - 1];
                position.collateralNFTs.pop();
                break;
            }
        }
        
        delete nftDepositor[nftId];
        rwaIncomeNFT.transferFrom(address(this), msg.sender, nftId);
        
        emit CollateralWithdrawn(msg.sender, nftId);
    }
    
    /**
     * @notice Enable auto-repayment for user
     */
    function enableAutoRepay() external {
        userPositions[msg.sender].autoRepayEnabled = true;
        emit AutoRepayEnabled(msg.sender);
    }
    
    /**
     * @notice Get user's total debt
     * @param user Address to query
     * @return Total debt in USDC
     */
    function getUserDebt(address user) external view returns (uint256) {
        return userPositions[user].totalDebt;
    }
    
    /**
     * @notice Get user's total collateral value
     * @param user Address to query
     * @return Total collateral value in USDC
     */
    function getUserCollateralValue(address user) public view returns (uint256) {
        UserPosition storage position = userPositions[user];
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < position.collateralNFTs.length; i++) {
            totalValue += rwaIncomeNFT.getValue(position.collateralNFTs[i]);
        }
        
        return totalValue;
    }
    
    /**
     * @notice Get user's collateral NFT IDs
     * @param user Address to query
     * @return Array of NFT IDs
     */
    function getUserCollateralNFTs(address user) external view returns (uint256[] memory) {
        return userPositions[user].collateralNFTs;
    }
    
    /**
     * @notice Check if user has auto-repay enabled
     * @param user Address to query
     * @return True if enabled
     */
    function isAutoRepayEnabled(address user) external view returns (bool) {
        return userPositions[user].autoRepayEnabled;
    }
    
    /**
     * @notice Check if an NFT is locked as collateral
     * @param nftId Token ID to check
     * @return True if locked
     */
    function isNFTLocked(uint256 nftId) external view returns (bool) {
        return nftDepositor[nftId] != address(0);
    }
    
    /**
     * @notice Deposit NFT and borrow in one transaction
     * @param nftId Token ID to deposit
     * @param amount Amount to borrow
     * @param enableAutoRepay Whether to enable auto-repayment
     */
    function depositAndBorrow(uint256 nftId, uint256 amount, bool enableAutoRepay) external nonReentrant {
        require(identityRegistry.isVerified(msg.sender), "OrbitRWAPool: user not KYC verified");
        require(rwaIncomeNFT.ownerOf(nftId) == msg.sender, "OrbitRWAPool: not NFT owner");
        require(amount > 0, "OrbitRWAPool: amount must be > 0");
        
        // Transfer NFT to pool
        rwaIncomeNFT.transferFrom(msg.sender, address(this), nftId);
        
        // Record collateral
        userPositions[msg.sender].collateralNFTs.push(nftId);
        nftDepositor[nftId] = msg.sender;
        
        uint256 nftValue = rwaIncomeNFT.getValue(nftId);
        emit CollateralDeposited(msg.sender, nftId, nftValue);
        
        // Calculate max borrow (50% LTV)
        uint256 maxBorrow = (nftValue * LTV_RATIO) / BASIS_POINTS;
        require(amount <= maxBorrow, "OrbitRWAPool: exceeds 50% LTV limit");
        require(usdc.balanceOf(address(this)) >= amount, "OrbitRWAPool: insufficient liquidity");
        
        // Borrow
        userPositions[msg.sender].totalDebt += amount;
        usdc.transfer(msg.sender, amount);
        
        // Enable auto-repay if requested
        if (enableAutoRepay) {
            userPositions[msg.sender].autoRepayEnabled = true;
            emit AutoRepayEnabled(msg.sender);
        }
        
        emit Borrowed(msg.sender, amount, userPositions[msg.sender].totalDebt);
    }
}
