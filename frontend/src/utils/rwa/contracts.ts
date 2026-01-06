import rwaAddresses from '../../deployments/anvil-rwa.json';

export const RWA_CONTRACTS = {
    anvil: {
        MockUSDC: rwaAddresses.MockUSDC as `0x${string}`,
        IdentityRegistry: rwaAddresses.IdentityRegistry as `0x${string}`,
        RWAIncomeNFT: rwaAddresses.RWAIncomeNFT as `0x${string}`,
        OrbitRWAPool: rwaAddresses.OrbitRWAPool as `0x${string}`,
        SPVManager: rwaAddresses.SPVManager as `0x${string}`,
        SeniorTranche: rwaAddresses.SeniorTranche as `0x${string}`,
        JuniorTranche: rwaAddresses.JuniorTranche as `0x${string}`,
        WaterfallDistributor: rwaAddresses.WaterfallDistributor as `0x${string}`,
        TestUser: rwaAddresses.TestUser as `0x${string}`,
        SPVWallet: rwaAddresses.SPVWallet as `0x${string}`,
    }
};

export const getKYCStorageKey = (address: string) => `kyc_${address.toLowerCase()}`;

export const isKYCVerified = (address: string): boolean => {
    if (typeof window === 'undefined') return false;
    const key = getKYCStorageKey(address);
    return localStorage.getItem(key) === 'verified';
};

export const setKYCVerified = (address: string) => {
    if (typeof window === 'undefined') return;
    const key = getKYCStorageKey(address);
    localStorage.setItem(key, 'verified');
};

export const clearKYCStatus = (address: string) => {
    if (typeof window === 'undefined') return;
    const key = getKYCStorageKey(address);
    localStorage.removeItem(key);
};
