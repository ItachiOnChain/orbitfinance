// Mock data for RWA protocol metrics
// In production, fetch from subgraph/API

export const protocolMetrics = {
    totalValueLocked: 1245000,
    assetsTokenized: 127,
    activeLoans: 89,
    seniorTVL: 845000,
    juniorTVL: 400000,
    averageYield: 8.5,
};

export const assetPools = [
    {
        id: 'rental',
        name: 'Rental Income Pool',
        apy: 8.2,
        ltv: 50,
        color: '#00F5A0',
        totalValue: 520000,
        activeAssets: 45,
    },
    {
        id: 'invoice',
        name: 'Invoice Pool',
        apy: 12.5,
        ltv: 60,
        color: '#00D4FF',
        totalValue: 385000,
        activeAssets: 38,
    },
    {
        id: 'bond',
        name: 'Bond Pool',
        apy: 6.8,
        ltv: 70,
        color: '#FFB800',
        totalValue: 340000,
        activeAssets: 44,
    },
];

export const howItWorksSteps = [
    {
        number: 1,
        title: 'Tokenize Your Asset',
        description: 'Convert your rental property, invoice, or bond into an income-generating NFT. Our smart contracts verify and track your revenue streams on-chain.',
        icon: '📄',
    },
    {
        number: 2,
        title: 'Borrow Against NFT',
        description: 'Access instant liquidity at 50% LTV. Your tokenized asset serves as collateral while continuing to generate income for auto-repayment.',
        icon: '💰',
    },
    {
        number: 3,
        title: 'Auto-Repay via SPV',
        description: 'Our SPV automatically routes your asset income to repay loans. Set it and forget it—your debt decreases as your asset earns.',
        icon: '🔄',
    },
];
