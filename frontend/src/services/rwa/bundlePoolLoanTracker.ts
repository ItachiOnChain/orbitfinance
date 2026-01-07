/**
 * Service to track loan disbursements and repayments for Bundle Pool NAV calculation
 * This updates localStorage when loans are taken or repaid in Asset Origination
 */

export const bundlePoolLoanTracker = {
    /**
     * Record a loan disbursement (reduces NAV)
     */
    recordLoanDisbursement: (amount: number) => {
        try {
            const current = bundlePoolLoanTracker.getDeployedCapital();
            const newAmount = current + amount;
            localStorage.setItem('bundle_pool_deployed_capital', newAmount.toString());
            console.log(`[Bundle Pool] Loan disbursed: $${amount.toFixed(2)}, Total deployed: $${newAmount.toFixed(2)}`);
        } catch (error) {
            console.error('[Bundle Pool] Failed to record loan disbursement:', error);
        }
    },

    /**
     * Record a loan repayment (increases NAV)
     */
    recordLoanRepayment: (amount: number) => {
        try {
            const current = bundlePoolLoanTracker.getDeployedCapital();
            const newAmount = Math.max(0, current - amount);
            localStorage.setItem('bundle_pool_deployed_capital', newAmount.toString());
            console.log(`[Bundle Pool] Loan repaid: $${amount.toFixed(2)}, Total deployed: $${newAmount.toFixed(2)}`);
        } catch (error) {
            console.error('[Bundle Pool] Failed to record loan repayment:', error);
        }
    },

    /**
     * Get current deployed capital
     */
    getDeployedCapital: (): number => {
        try {
            const stored = localStorage.getItem('bundle_pool_deployed_capital');
            return stored ? parseFloat(stored) : 0;
        } catch {
            return 0;
        }
    },

    /**
     * Reset deployed capital (for testing)
     */
    reset: () => {
        try {
            localStorage.removeItem('bundle_pool_deployed_capital');
            console.log('[Bundle Pool] Deployed capital reset');
        } catch (error) {
            console.error('[Bundle Pool] Failed to reset deployed capital:', error);
        }
    },
};

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
    (window as any).bundlePoolLoanTracker = bundlePoolLoanTracker;
}
