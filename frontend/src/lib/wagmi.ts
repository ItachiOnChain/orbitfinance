import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

const anvilChain = {
    id: 31337,
    name: 'Anvil',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: { http: ['http://localhost:8545'] },
        public: { http: ['http://localhost:8545'] },
    },
} as const;

export const wagmiConfig = createConfig({
    chains: [anvilChain],
    connectors: [injected()],
    transports: {
        [anvilChain.id]: http('http://localhost:8545'),
    },
});
