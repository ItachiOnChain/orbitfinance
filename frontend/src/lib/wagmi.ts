import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

const mantleSepolia = {
    id: 5003,
    name: 'Mantle Sepolia Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'MNT',
        symbol: 'MNT',
    },
    rpcUrls: {
        default: { http: ['https://rpc.sepolia.mantle.xyz'] },
        public: { http: ['https://rpc.sepolia.mantle.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Mantlescan', url: 'https://sepolia.mantlescan.xyz' },
    },
} as const;

export const wagmiConfig = createConfig({
    chains: [mantleSepolia],
    connectors: [injected()],
    transports: {
        [mantleSepolia.id]: http('https://rpc.sepolia.mantle.xyz'),
    },
});
