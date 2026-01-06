// Admin access control for SPV Simulator
// Hardcoded admin addresses for demo purposes

const ADMIN_ADDRESSES = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Anvil default account 0
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Anvil default account 1
    // Add judge wallet addresses here if needed
];

export function isAdmin(address: string | undefined): boolean {
    if (!address) return false;
    return ADMIN_ADDRESSES.some(
        (admin) => admin.toLowerCase() === address.toLowerCase()
    );
}

export function getAdminAddresses(): string[] {
    return ADMIN_ADDRESSES;
}
