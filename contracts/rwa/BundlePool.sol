// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BundlePool
 * @notice Manages investment pools with Junior and Senior Tranche system for RWA financing
 * @dev Orbit Finance creates pools, users invest in tranches using USDT
 */
contract BundlePool is Ownable, ReentrancyGuard {
    
    // Pool status lifecycle
    enum PoolStatus {
        Upcoming,
        Raising,
        Staking,
        FinalRedemption,
        Ended
    }

    // Pool data structure
    struct Pool {
        string name;
        address issuer; // Orbit Finance address
        uint256 totalInvestment;
        uint256 currentNAV;
        int256 finalAPY; // Can be negative
        uint256 expectedAPY;
        uint256 redemptionDate;
        PoolStatus status;
        uint256 juniorDistribution; // e.g., 25 for 25%
        uint256 seniorDistribution; // e.g., 75 for 75%
        uint256 createdAt;
    }

    // Tranche data structure
    struct Tranche {
        string name;
        uint256 pricePerUnit;
        uint256 totalInvested;
        uint256 currentNAV;
        uint256 currentAPY;
        uint256 distributionPercentage;
    }

    // State variables
    IERC20 public usdtToken;
    uint256 public poolCount;
    
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => Tranche) public juniorTranches;
    mapping(uint256 => Tranche) public seniorTranches;
    mapping(uint256 => mapping(address => uint256)) public juniorInvestments;
    mapping(uint256 => mapping(address => uint256)) public seniorInvestments;
    mapping(uint256 => mapping(address => uint256)) public juniorShares;
    mapping(uint256 => mapping(address => uint256)) public seniorShares;

    // Events
    event PoolCreated(
        uint256 indexed poolId,
        string name,
        address indexed issuer,
        uint256 totalInvestment,
        uint256 redemptionDate
    );

    event InvestmentMade(
        uint256 indexed poolId,
        address indexed investor,
        bool isJunior,
        uint256 amount,
        uint256 newTrancheNAV,
        uint256 userShare
    );

    event PoolStatusUpdated(
        uint256 indexed poolId,
        PoolStatus oldStatus,
        PoolStatus newStatus
    );

    event NAVUpdated(
        uint256 indexed poolId,
        uint256 newPoolNAV,
        uint256 newJuniorNAV,
        uint256 newSeniorNAV
    );

    constructor(address _usdtToken) Ownable(msg.sender) {
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @notice Create a new investment pool (Orbit Finance only)
     */
    function createPool(
        string memory _name,
        uint256 _totalInvestment,
        uint256 _expectedAPY,
        uint256 _redemptionDate,
        uint256 _juniorDistribution,
        uint256 _seniorDistribution
    ) external onlyOwner returns (uint256 poolId) {
        require(_juniorDistribution + _seniorDistribution == 100, "Distribution must equal 100%");
        require(_redemptionDate > block.timestamp, "Redemption date must be in future");

        poolId = poolCount++;

        pools[poolId] = Pool({
            name: _name,
            issuer: msg.sender,
            totalInvestment: _totalInvestment,
            currentNAV: _totalInvestment,
            finalAPY: 0,
            expectedAPY: _expectedAPY,
            redemptionDate: _redemptionDate,
            status: PoolStatus.Upcoming,
            juniorDistribution: _juniorDistribution,
            seniorDistribution: _seniorDistribution,
            createdAt: block.timestamp
        });

        // Initialize Junior Tranche
        uint256 juniorAmount = (_totalInvestment * _juniorDistribution) / 100;
        juniorTranches[poolId] = Tranche({
            name: "Junior Tranche NFT",
            pricePerUnit: 250000 * 10**6, // $250,000 USDT (6 decimals)
            totalInvested: 0,
            currentNAV: 0,
            currentAPY: _expectedAPY,
            distributionPercentage: _juniorDistribution
        });

        // Initialize Senior Tranche
        uint256 seniorAmount = (_totalInvestment * _seniorDistribution) / 100;
        seniorTranches[poolId] = Tranche({
            name: "Senior Tranche Token",
            pricePerUnit: 750000 * 10**6, // $750,000 USDT (6 decimals)
            totalInvested: 0,
            currentNAV: 0,
            currentAPY: _expectedAPY,
            distributionPercentage: _seniorDistribution
        });

        emit PoolCreated(poolId, _name, msg.sender, _totalInvestment, _redemptionDate);
    }

    /**
     * @notice Update pool status (Orbit Finance only)
     */
    function updatePoolStatus(uint256 _poolId, PoolStatus _status) external onlyOwner {
        require(_poolId < poolCount, "Pool does not exist");
        
        PoolStatus oldStatus = pools[_poolId].status;
        pools[_poolId].status = _status;

        emit PoolStatusUpdated(_poolId, oldStatus, _status);
    }

    /**
     * @notice Invest in Junior Tranche
     */
    function investJuniorTranche(uint256 _poolId, uint256 _amount) external nonReentrant {
        require(_poolId < poolCount, "Pool does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        
        Pool storage pool = pools[_poolId];
        require(
            pool.status == PoolStatus.Raising || pool.status == PoolStatus.Staking,
            "Pool not accepting investments"
        );

        Tranche storage tranche = juniorTranches[_poolId];

        // Transfer USDT from investor
        require(
            usdtToken.transferFrom(msg.sender, address(this), _amount),
            "USDT transfer failed"
        );

        // Update tranche data
        tranche.totalInvested += _amount;
        tranche.currentNAV += _amount;

        // Update pool data
        pool.totalInvestment += _amount;
        pool.currentNAV += _amount;

        // Update user investment
        juniorInvestments[_poolId][msg.sender] += _amount;

        // Calculate user share
        uint256 userShare = (juniorInvestments[_poolId][msg.sender] * 10000) / tranche.totalInvested;
        juniorShares[_poolId][msg.sender] = userShare;

        emit InvestmentMade(_poolId, msg.sender, true, _amount, tranche.currentNAV, userShare);
        emit NAVUpdated(_poolId, pool.currentNAV, juniorTranches[_poolId].currentNAV, seniorTranches[_poolId].currentNAV);
    }

    /**
     * @notice Invest in Senior Tranche
     */
    function investSeniorTranche(uint256 _poolId, uint256 _amount) external nonReentrant {
        require(_poolId < poolCount, "Pool does not exist");
        require(_amount > 0, "Amount must be greater than 0");
        
        Pool storage pool = pools[_poolId];
        require(
            pool.status == PoolStatus.Raising || pool.status == PoolStatus.Staking,
            "Pool not accepting investments"
        );

        Tranche storage tranche = seniorTranches[_poolId];

        // Transfer USDT from investor
        require(
            usdtToken.transferFrom(msg.sender, address(this), _amount),
            "USDT transfer failed"
        );

        // Update tranche data
        tranche.totalInvested += _amount;
        tranche.currentNAV += _amount;

        // Update pool data
        pool.totalInvestment += _amount;
        pool.currentNAV += _amount;

        // Update user investment
        seniorInvestments[_poolId][msg.sender] += _amount;

        // Calculate user share
        uint256 userShare = (seniorInvestments[_poolId][msg.sender] * 10000) / tranche.totalInvested;
        seniorShares[_poolId][msg.sender] = userShare;

        emit InvestmentMade(_poolId, msg.sender, false, _amount, tranche.currentNAV, userShare);
        emit NAVUpdated(_poolId, pool.currentNAV, juniorTranches[_poolId].currentNAV, seniorTranches[_poolId].currentNAV);
    }

    /**
     * @notice Get pool details
     */
    function getPoolDetails(uint256 _poolId) external view returns (Pool memory) {
        require(_poolId < poolCount, "Pool does not exist");
        return pools[_poolId];
    }

    /**
     * @notice Get tranche details
     */
    function getTrancheDetails(uint256 _poolId, bool isJunior) external view returns (
        string memory name,
        uint256 pricePerUnit,
        uint256 totalInvested,
        uint256 currentNAV,
        uint256 currentAPY,
        uint256 distributionPercentage
    ) {
        require(_poolId < poolCount, "Pool does not exist");
        
        Tranche memory tranche = isJunior ? juniorTranches[_poolId] : seniorTranches[_poolId];
        
        return (
            tranche.name,
            tranche.pricePerUnit,
            tranche.totalInvested,
            tranche.currentNAV,
            tranche.currentAPY,
            tranche.distributionPercentage
        );
    }

    /**
     * @notice Get user investment in a tranche
     */
    function getUserInvestment(uint256 _poolId, address _user, bool isJunior) 
        external view returns (uint256 investment, uint256 share) 
    {
        require(_poolId < poolCount, "Pool does not exist");
        
        if (isJunior) {
            investment = juniorInvestments[_poolId][_user];
            share = juniorShares[_poolId][_user];
        } else {
            investment = seniorInvestments[_poolId][_user];
            share = seniorShares[_poolId][_user];
        }
    }

    /**
     * @notice Get user's total investments across all pools
     */
    function getUserTotalInvestments(address _user) 
        external view returns (uint256 juniorTotal, uint256 seniorTotal) 
    {
        for (uint256 i = 0; i < poolCount; i++) {
            juniorTotal += juniorInvestments[i][_user];
            seniorTotal += seniorInvestments[i][_user];
        }
    }

    /**
     * @notice Get active pools count
     */
    function getActivePoolsCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].status == PoolStatus.Raising || pools[i].status == PoolStatus.Staking) {
                count++;
            }
        }
    }

    /**
     * @notice Get all pools
     */
    function getAllPools() external view returns (Pool[] memory) {
        Pool[] memory allPools = new Pool[](poolCount);
        for (uint256 i = 0; i < poolCount; i++) {
            allPools[i] = pools[i];
        }
        return allPools;
    }

    /**
     * @notice Get pools by status
     */
    function getPoolsByStatus(PoolStatus _status) external view returns (Pool[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].status == _status) {
                count++;
            }
        }

        Pool[] memory filteredPools = new Pool[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < poolCount; i++) {
            if (pools[i].status == _status) {
                filteredPools[index] = pools[i];
                index++;
            }
        }

        return filteredPools;
    }

    /**
     * @notice Get time remaining until redemption
     */
    function getTimeRemaining(uint256 _poolId) public view returns (
        uint256 monthsLeft,
        uint256 daysLeft,
        uint256 hoursLeft
    ) {
        require(_poolId < poolCount, "Pool does not exist");
        
        Pool memory pool = pools[_poolId];
        if (block.timestamp >= pool.redemptionDate) {
            return (0, 0, 0);
        }
        
        uint256 remaining = pool.redemptionDate - block.timestamp;
        monthsLeft = remaining / 30 days;
        daysLeft = (remaining % 30 days) / 1 days;
        hoursLeft = (remaining % 1 days) / 1 hours;
        
        return (monthsLeft, daysLeft, hoursLeft);
    }

    /**
     * @notice Update NAV (Orbit Finance only) - for performance adjustments
     */
    function updateNAV(uint256 _poolId, uint256 _newPoolNAV) external onlyOwner {
        require(_poolId < poolCount, "Pool does not exist");
        
        Pool storage pool = pools[_poolId];
        pool.currentNAV = _newPoolNAV;

        // Update tranche NAVs proportionally
        juniorTranches[_poolId].currentNAV = (_newPoolNAV * pool.juniorDistribution) / 100;
        seniorTranches[_poolId].currentNAV = (_newPoolNAV * pool.seniorDistribution) / 100;

        emit NAVUpdated(_poolId, _newPoolNAV, juniorTranches[_poolId].currentNAV, seniorTranches[_poolId].currentNAV);
    }

    /**
     * @notice Update final APY (Orbit Finance only) - when pool ends
     */
    function updateFinalAPY(uint256 _poolId, int256 _finalAPY) external onlyOwner {
        require(_poolId < poolCount, "Pool does not exist");
        pools[_poolId].finalAPY = _finalAPY;
    }
}
