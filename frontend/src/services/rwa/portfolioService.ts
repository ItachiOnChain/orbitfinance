// Portfolio service for aggregating user data across RWA contracts
// In production, query multiple contracts and aggregate results

export interface PortfolioMetrics {
    netWorth: number;
    totalDebt: number;
    collateralValue: number;
    totalEarnings: number;
}

export interface AutoRepayEvent {
    date: string;
    asset: string;
    amountRepaid: number;
    debtAfter: number;
}

export interface UserAsset {
    tokenId: number;
    name: string;
    currentDebt: number;
    autoRepayEnabled: boolean;
    nextPayment: {
        date: string;
        amount: number;
    };
}

export interface UserInvestment {
    tranche: 'senior' | 'junior';
    balance: number;
    apy: number;
    earned: number;
}

// Mock data for development
const mockMetrics: PortfolioMetrics = {
    netWorth: 68000,
    totalDebt: 52000,
    collateralValue: 120000,
    totalEarnings: 1250,
};

const mockAssets: UserAsset[] = [
    {
        tokenId: 1,
        name: 'Downtown Apartment 4B',
        currentDebt: 52000,
        autoRepayEnabled: true,
        nextPayment: {
            date: '2026-02-01',
            amount: 2500,
        },
    },
];

const mockInvestments: UserInvestment[] = [
    {
        tranche: 'senior',
        balance: 10000,
        apy: 5.2,
        earned: 433,
    },
    {
        tranche: 'junior',
        balance: 5000,
        apy: 14.8,
        earned: 617,
    },
];

const mockAutoRepayHistory: AutoRepayEvent[] = [
    {
        date: '2026-01-01',
        asset: 'Downtown Apartment 4B',
        amountRepaid: 2500,
        debtAfter: 57500,
    },
    {
        date: '2025-12-01',
        asset: 'Downtown Apartment 4B',
        amountRepaid: 2500,
        debtAfter: 60000,
    },
    {
        date: '2025-11-01',
        asset: 'Downtown Apartment 4B',
        amountRepaid: 2500,
        debtAfter: 62500,
    },
];

export const portfolioService = {
    async getNetWorth(address: string): Promise<number> {
        // In production: aggregate from all contracts
        console.log('Fetching net worth for:', address);
        return mockMetrics.netWorth;
    },

    async getTotalDebt(address: string): Promise<number> {
        // In production: query OrbitRWAPool.getUserDebt(address)
        console.log('Fetching total debt for:', address);
        return mockMetrics.totalDebt;
    },

    async getCollateralValue(address: string): Promise<number> {
        // In production: sum all NFT valuations
        console.log('Fetching collateral value for:', address);
        return mockMetrics.collateralValue;
    },

    async getTotalEarnings(address: string): Promise<number> {
        // In production: query tranches for earned yield
        console.log('Fetching total earnings for:', address);
        return mockMetrics.totalEarnings;
    },

    async getPortfolioMetrics(address: string): Promise<PortfolioMetrics> {
        console.log('Fetching portfolio metrics for:', address);
        return mockMetrics;
    },

    async getUserAssets(address: string): Promise<UserAsset[]> {
        // In production: query RWAIncomeNFT and OrbitRWAPool
        console.log('Fetching user assets for:', address);
        return mockAssets;
    },

    async getUserInvestments(address: string): Promise<UserInvestment[]> {
        // In production: query SeniorTranche and JuniorTranche
        console.log('Fetching user investments for:', address);
        return mockInvestments;
    },

    async getAutoRepayHistory(address: string): Promise<AutoRepayEvent[]> {
        // In production: query SPVManager events filtered by user
        console.log('Fetching auto-repay history for:', address);
        return mockAutoRepayHistory;
    },

    exportToCSV(data: {
        metrics: PortfolioMetrics;
        assets: UserAsset[];
        investments: UserInvestment[];
        history: AutoRepayEvent[];
    }): void {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `orbit-portfolio-${timestamp}.csv`;

        let csv = 'Orbit Finance Portfolio Export\n\n';

        // Metrics
        csv += 'ACCOUNT OVERVIEW\n';
        csv += 'Metric,Value\n';
        csv += `Net Worth,$${data.metrics.netWorth}\n`;
        csv += `Total Debt,$${data.metrics.totalDebt}\n`;
        csv += `Collateral Value,$${data.metrics.collateralValue}\n`;
        csv += `Total Earnings,$${data.metrics.totalEarnings}\n\n`;

        // Assets
        csv += 'TOKENIZED ASSETS\n';
        csv += 'Asset Name,Current Debt,Auto-Repay,Next Payment Date,Next Payment Amount\n';
        data.assets.forEach(asset => {
            csv += `${asset.name},$${asset.currentDebt},${asset.autoRepayEnabled ? 'Yes' : 'No'},${asset.nextPayment.date},$${asset.nextPayment.amount}\n`;
        });
        csv += '\n';

        // Investments
        csv += 'INVESTMENTS\n';
        csv += 'Tranche,Balance,APY,Earned\n';
        data.investments.forEach(inv => {
            csv += `${inv.tranche},$${inv.balance},${inv.apy}%,$${inv.earned}\n`;
        });
        csv += '\n';

        // History
        csv += 'AUTO-REPAYMENT HISTORY\n';
        csv += 'Date,Asset,Amount Repaid,Debt After\n';
        data.history.forEach(event => {
            csv += `${event.date},${event.asset},$${event.amountRepaid},$${event.debtAfter}\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },
};
