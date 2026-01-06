// RWA Contract addresses and ABIs
// Loaded from deployment artifacts

import deployments from '../../../deployments/anvil-rwa.json';

// Contract addresses
export const RWA_ADDRESSES = {
    IdentityRegistry: deployments.IdentityRegistry as `0x${string}`,
    RWAIncomeNFT: deployments.RWAIncomeNFT as `0x${string}`,
    OrbitRWAPool: deployments.OrbitRWAPool as `0x${string}`,
    SPVManager: deployments.SPVManager as `0x${string}`,
    SeniorTranche: deployments.SeniorTranche as `0x${string}`,
    JuniorTranche: deployments.JuniorTranche as `0x${string}`,
    WaterfallDistributor: deployments.WaterfallDistributor as `0x${string}`,
    MockUSDC: deployments.MockUSDC as `0x${string}`,
};

// Contract ABIs - Import from artifacts
// For now using minimal ABIs, will expand as needed
export const RWA_ABIS = {
    IdentityRegistry: [
        {
            inputs: [{ name: 'user', type: 'address' }],
            name: 'isVerified',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ name: 'user', type: 'address' }],
            name: 'isAdmin',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ name: 'user', type: 'address' }],
            name: 'verifyUser',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const,

    RWAIncomeNFT: [
        {
            inputs: [{ name: 'owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'to', type: 'address' },
                { name: 'assetName', type: 'string' },
                { name: 'assetType', type: 'uint8' }, // 0=RENTAL, 1=INVOICE, 2=BOND
                { name: 'monthlyIncome', type: 'uint256' },
                { name: 'duration', type: 'uint256' },
                { name: 'totalValue', type: 'uint256' },
            ],
            name: 'mint',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'tokenId', type: 'uint256' }],
            name: 'getMetadata',
            outputs: [{
                name: '',
                type: 'tuple',
                components: [
                    { name: 'assetName', type: 'string' },
                    { name: 'assetType', type: 'uint8' },
                    { name: 'monthlyIncome', type: 'uint256' },
                    { name: 'duration', type: 'uint256' },
                    { name: 'totalValue', type: 'uint256' },
                    { name: 'mintedAt', type: 'uint256' },
                    { name: 'spvApproved', type: 'bool' },
                ],
            }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'to', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'owner', type: 'address' }],
            name: 'tokensOfOwner',
            outputs: [{ name: '', type: 'uint256[]' }],
            stateMutability: 'view',
            type: 'function',
        },
    ] as const,

    OrbitRWAPool: [
        {
            inputs: [{ name: 'user', type: 'address' }],
            name: 'getUserDebt',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'nftId', type: 'uint256' },
                { name: 'amount', type: 'uint256' },
                { name: 'enableAutoRepay', type: 'bool' },
            ],
            name: 'depositAndBorrow',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'nftId', type: 'uint256' }],
            name: 'isNFTLocked',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ name: 'user', type: 'address' }],
            name: 'getUserCollateralNFTs',
            outputs: [{ name: '', type: 'uint256[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ name: 'amount', type: 'uint256' }],
            name: 'repay',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { name: 'borrower', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            name: 'repayOnBehalfOf',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'nftId', type: 'uint256' }],
            name: 'withdrawCollateral',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const,

    SeniorTranche: [
        {
            inputs: [],
            name: 'totalAssets',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'assets', type: 'uint256' },
                { name: 'receiver', type: 'address' },
            ],
            name: 'deposit',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { name: 'assets', type: 'uint256' },
                { name: 'receiver', type: 'address' },
                { name: 'owner', type: 'address' },
            ],
            name: 'withdraw',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
    ] as const,

    JuniorTranche: [
        {
            inputs: [],
            name: 'totalAssets',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'assets', type: 'uint256' },
                { name: 'receiver', type: 'address' },
            ],
            name: 'deposit',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { name: 'assets', type: 'uint256' },
                { name: 'receiver', type: 'address' },
                { name: 'owner', type: 'address' },
            ],
            name: 'withdraw',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
    ] as const,

    MockUSDC: [
        {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const,

    WaterfallDistributor: [
        {
            inputs: [{ name: 'amount', type: 'uint256' }],
            name: 'distributeYield',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const,

    SPVManager: [
        {
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'metadata', type: 'string' },
            ],
            name: 'approveAsset',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ] as const,
};

// Helper to get contract config
export function getContractConfig(contractName: keyof typeof RWA_ADDRESSES) {
    return {
        address: RWA_ADDRESSES[contractName],
        abi: RWA_ABIS[contractName],
    };
}
