// Admin service for SPV operations
// Only callable by admin addresses

export interface PendingAsset {
    userAddress: string;
    assetName: string;
    assetType: string;
    estimatedValue: number;
    submittedAt: string;
}

export interface ActivityLogEntry {
    timestamp: string;
    action: string;
    details: string;
}

// Mock data for development
const mockPendingAssets: PendingAsset[] = [];

const mockActivityLog: ActivityLogEntry[] = [];

export const adminService = {
    async submitAssetForApproval(data: {
        assetName: string;
        assetType: string;
        monthlyIncome: number;
        duration: number;
    }) {
        // In production: emit event or store in database
        console.log('Submitting asset for approval:', data);

        // Add to pending queue
        mockPendingAssets.push({
            userAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Current user
            assetName: data.assetName,
            assetType: data.assetType.toUpperCase(),
            estimatedValue: data.monthlyIncome * data.duration,
            submittedAt: new Date().toISOString(),
        });

        return { success: true };
    },

    async approveAsset(userAddress: string, metadata: any) {
        // In production: call SPVManager.approveAsset()
        console.log('Approving asset for:', userAddress, metadata);
        return { success: true, txHash: '0x...' };
    },

    async rejectAsset(userAddress: string, reason: string) {
        // In production: call SPVManager.rejectAsset()
        console.log('Rejecting asset for:', userAddress, reason);
        return { success: true };
    },

    async distributeYield(amount: number) {
        // In production: call WaterfallDistributor.distributeYield()
        console.log('Distributing yield:', amount);

        const distribution = {
            autoRepay: amount * 0.7,
            senior: amount * 0.2,
            junior: amount * 0.1,
        };

        return { success: true, txHash: '0x...', distribution };
    },

    async applyAutoRepayment(borrower: string, nftId: number, amount: number) {
        // In production: call SPVManager.applyAutoRepayment()
        console.log('Applying auto-repayment:', { borrower, nftId, amount });
        return { success: true, txHash: '0x...', debtAfter: 50000 };
    },

    async getSPVBalance(): Promise<number> {
        // In production: query USDC.balanceOf(SPVManager.address)
        return 500000;
    },

    async getPendingAssets(): Promise<PendingAsset[]> {
        // In production: query SPVManager events for pending approvals
        return mockPendingAssets;
    },

    async getActivityLog(): Promise<ActivityLogEntry[]> {
        // In production: query SPVManager events
        return mockActivityLog;
    },

    async fundSPVWallet(amount: number) {
        // In production: mint test USDC to SPV
        console.log('Funding SPV wallet:', amount);
        return { success: true, txHash: '0x...' };
    },

    async resetAllData() {
        // In production: reset contract state (demo only!)
        console.log('⚠️ Resetting all data...');
        return { success: true };
    },

    async generateSampleActivity() {
        // In production: create fake events for demo
        console.log('Generating sample activity...');
        return { success: true };
    },

    downloadDemoScript() {
        const script = `
ORBIT FINANCE RWA DEMO SCRIPT
==============================

1. ASSET ORIGINATION
   - Click "Tokenize New Asset"
   - Fill: Rental Income, $2500/mo, 48 months
   - Submit → Watch SPV verification
   - Approve in Admin Panel
   - Mint NFT

2. BORROWING
   - Manage Asset → Borrow $60,000
   - Enable Auto-Repay
   - Confirm transaction

3. CAPITAL MARKETS
   - Deposit $10,000 to Senior Tranche
   - Deposit $5,000 to Junior Tranche
   - View APY calculations

4. YIELD DISTRIBUTION (Admin)
   - Trigger $25,000 yield distribution
   - Watch waterfall: Auto-repay → Senior → Junior
   - Check Portfolio for updated balances

5. PORTFOLIO
   - View net worth, debt, earnings
   - Check auto-repay history
   - Export data to CSV

Demo completed! 🎉
    `.trim();

        const blob = new Blob([script], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orbit-rwa-demo-script.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    },
};
