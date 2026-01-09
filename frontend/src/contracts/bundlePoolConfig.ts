export const BUNDLE_POOL_ADDRESS = '0x851356ae760d987e095750cceb3bc6014560891c';

export const BUNDLE_POOL_ABI = [
    {
        "type": "constructor",
        "inputs": [{ "name": "_usdtToken", "type": "address", "internalType": "address" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createPool",
        "inputs": [
            { "name": "_name", "type": "string", "internalType": "string" },
            { "name": "_totalInvestment", "type": "uint256", "internalType": "uint256" },
            { "name": "_expectedAPY", "type": "uint256", "internalType": "uint256" },
            { "name": "_redemptionDate", "type": "uint256", "internalType": "uint256" },
            { "name": "_juniorDistribution", "type": "uint256", "internalType": "uint256" },
            { "name": "_seniorDistribution", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "poolId", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "investJuniorTranche",
        "inputs": [
            { "name": "_poolId", "type": "uint256", "internalType": "uint256" },
            { "name": "_amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "investSeniorTranche",
        "inputs": [
            { "name": "_poolId", "type": "uint256", "internalType": "uint256" },
            { "name": "_amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getPoolDetails",
        "inputs": [{ "name": "_poolId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [{
            "name": "",
            "type": "tuple",
            "internalType": "struct BundlePool.Pool",
            "components": [
                { "name": "name", "type": "string", "internalType": "string" },
                { "name": "issuer", "type": "address", "internalType": "address" },
                { "name": "totalInvestment", "type": "uint256", "internalType": "uint256" },
                { "name": "currentNAV", "type": "uint256", "internalType": "uint256" },
                { "name": "finalAPY", "type": "int256", "internalType": "int256" },
                { "name": "expectedAPY", "type": "uint256", "internalType": "uint256" },
                { "name": "redemptionDate", "type": "uint256", "internalType": "uint256" },
                { "name": "status", "type": "uint8", "internalType": "enum BundlePool.PoolStatus" },
                { "name": "juniorDistribution", "type": "uint256", "internalType": "uint256" },
                { "name": "seniorDistribution", "type": "uint256", "internalType": "uint256" },
                { "name": "createdAt", "type": "uint256", "internalType": "uint256" }
            ]
        }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getTrancheDetails",
        "inputs": [
            { "name": "_poolId", "type": "uint256", "internalType": "uint256" },
            { "name": "isJunior", "type": "bool", "internalType": "bool" }
        ],
        "outputs": [
            { "name": "name", "type": "string", "internalType": "string" },
            { "name": "pricePerUnit", "type": "uint256", "internalType": "uint256" },
            { "name": "totalInvested", "type": "uint256", "internalType": "uint256" },
            { "name": "currentNAV", "type": "uint256", "internalType": "uint256" },
            { "name": "currentAPY", "type": "uint256", "internalType": "uint256" },
            { "name": "distributionPercentage", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getAllPools",
        "inputs": [],
        "outputs": [{
            "name": "",
            "type": "tuple[]",
            "internalType": "struct BundlePool.Pool[]",
            "components": [
                { "name": "name", "type": "string", "internalType": "string" },
                { "name": "issuer", "type": "address", "internalType": "address" },
                { "name": "totalInvestment", "type": "uint256", "internalType": "uint256" },
                { "name": "currentNAV", "type": "uint256", "internalType": "uint256" },
                { "name": "finalAPY", "type": "int256", "internalType": "int256" },
                { "name": "expectedAPY", "type": "uint256", "internalType": "uint256" },
                { "name": "redemptionDate", "type": "uint256", "internalType": "uint256" },
                { "name": "status", "type": "uint8", "internalType": "enum BundlePool.PoolStatus" },
                { "name": "juniorDistribution", "type": "uint256", "internalType": "uint256" },
                { "name": "seniorDistribution", "type": "uint256", "internalType": "uint256" },
                { "name": "createdAt", "type": "uint256", "internalType": "uint256" }
            ]
        }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getTimeRemaining",
        "inputs": [{ "name": "_poolId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            { "name": "monthsLeft", "type": "uint256", "internalType": "uint256" },
            { "name": "daysLeft", "type": "uint256", "internalType": "uint256" },
            { "name": "hoursLeft", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "PoolCreated",
        "inputs": [
            { "name": "poolId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "name", "type": "string", "indexed": false, "internalType": "string" },
            { "name": "issuer", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "totalInvestment", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "redemptionDate", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "InvestmentMade",
        "inputs": [
            { "name": "poolId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "investor", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "isJunior", "type": "bool", "indexed": false, "internalType": "bool" },
            { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "newTrancheNAV", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "userShare", "type": "uint256", "indexed": false, "internalType": "uint256" }
        ],
        "anonymous": false
    }
] as const;
