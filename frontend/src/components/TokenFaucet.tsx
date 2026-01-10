import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts';
import { parseUnits } from 'viem';
import { Droplet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
// Anvil deployment removed - using Mantle Sepolia only

interface TokenFaucetProps {
    mode: 'crypto' | 'rwa';
}

// Faucet amounts (in base units before decimals)
const FAUCET_AMOUNTS = {
    WETH: '10', // 10 WETH
    USDC: '50000', // 50,000 USDC
    MockUSDC: '50000', // 50,000 USDC for RWA
};

export function TokenFaucet({ mode }: TokenFaucetProps) {
    const { address, isConnected } = useAccount();
    const [claimingToken, setClaimingToken] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { writeContract, data: hash, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Get contract addresses from deployments
    const getTokenAddress = (token: string): `0x${string}` => {
        try {
            if (mode === 'crypto') {
                // Using Mantle Sepolia contracts from CONTRACTS
                return addresses[token as keyof typeof addresses] as `0x${string}`;
            } else {
                return rwaAddresses.MockUSDC as `0x${string}`;
            }
        } catch {
            return '0x0000000000000000000000000000000000000000';
        }
    };

    // Simple ERC20 ABI for mint function
    const ERC20_MINT_ABI = [
        {
            name: 'mint',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' }
            ],
            outputs: []
        },
        {
            name: 'mintToSelf',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'amount', type: 'uint256' }
            ],
            outputs: []
        }
    ] as const;

    const handleClaim = async (token: string, decimals: number, useMintToSelf: boolean = false) => {
        if (!address) return;

        setClaimingToken(token);
        setSuccessMessage(null);

        try {
            const amount = parseUnits(
                token === 'WETH' ? FAUCET_AMOUNTS.WETH :
                    token === 'USDC' ? FAUCET_AMOUNTS.USDC :
                        FAUCET_AMOUNTS.MockUSDC,
                decimals
            );

            const tokenAddress = getTokenAddress(token);

            if (useMintToSelf) {
                // RWA MockUSDC uses mintToSelf
                writeContract({
                    address: tokenAddress,
                    abi: ERC20_MINT_ABI,
                    functionName: 'mintToSelf',
                    args: [amount],
                    account: address,
                } as any);
            } else {
                // Crypto tokens use mint(address, amount)
                writeContract({
                    address: tokenAddress,
                    abi: ERC20_MINT_ABI,
                    functionName: 'mint',
                    args: [address, amount],
                    account: address,
                } as any);
            }
        } catch (err) {
            console.error('Claim failed:', err);
            setClaimingToken(null);
        }
    };

    // Handle success
    if (isSuccess && claimingToken) {
        const amount = claimingToken === 'WETH' ? FAUCET_AMOUNTS.WETH :
            claimingToken === 'USDC' ? FAUCET_AMOUNTS.USDC :
                FAUCET_AMOUNTS.MockUSDC;

        if (!successMessage) {
            setSuccessMessage(`Successfully claimed ${amount} ${claimingToken}!`);
            setTimeout(() => {
                setClaimingToken(null);
                setSuccessMessage(null);
            }, 3000);
        }
    }

    if (!isConnected) {
        return (
            <div className="bg-black border-2 border-yellow-500/40 rounded-2xl p-10 shadow-[0_0_40px_rgba(234,179,8,0.15)] backdrop-blur-xl flex flex-col items-center justify-center text-center">
                <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 mb-8 animate-pulse-gold">
                    <Droplet className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-outfit tracking-tight">Test Token Faucet</h3>
                <p className="text-zinc-400 max-w-[280px] leading-relaxed">
                    Connect your wallet to claim institutional-grade test tokens
                </p>
            </div>
        );
    }

    return (
        <div className="bg-black border-2 border-yellow-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(234,179,8,0.15)] backdrop-blur-xl flex flex-col">
            <div className="flex flex-col items-center text-center gap-4 mb-4">
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <Droplet className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white font-outfit tracking-tight">Test Token Faucet</h3>
                    <p className="text-[11px] text-yellow-400/70 uppercase tracking-[0.25em] mt-2 font-semibold">
                        {mode === 'crypto' ? 'Crypto' : 'RWA'} Assets Liquidity
                    </p>
                </div>
            </div>
            <br />

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-xl flex items-center gap-3 animate-slide-down">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-yellow-100 font-medium">{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-red-100 font-medium">
                        Claim failed. Please try again.
                    </span>
                </div>
            )}

            <br />
            {/* Token Claim Buttons */}
            <div className="space-y-4 flex-grow">
                {mode === 'crypto' ? (
                    <>
                        {/* WETH Faucet */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-yellow-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative flex items-center justify-between p-6 bg-zinc-900/40 border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all">
                                <div>
                                    <p className="font-bold text-white text-lg font-outfit">WETH</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Claim {FAUCET_AMOUNTS.WETH} WETH</p>
                                </div>
                                <button
                                    onClick={() => handleClaim('WETH', 18, false)}
                                    disabled={claimingToken === 'WETH' || isConfirming}
                                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-bold rounded-lg transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
                                >
                                    {claimingToken === 'WETH' && isConfirming ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Claim'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* USDC Faucet */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-yellow-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative flex items-center justify-between p-6 bg-zinc-900/40 border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all">
                                <div>
                                    <p className="font-bold text-white text-lg font-outfit">USDC</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Claim {FAUCET_AMOUNTS.USDC} USDC</p>
                                </div>
                                <button
                                    onClick={() => handleClaim('USDC', 6, false)}
                                    disabled={claimingToken === 'USDC' || isConfirming}
                                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-bold rounded-lg transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
                                >
                                    {claimingToken === 'USDC' && isConfirming ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Claim'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* MockUSDC Faucet for RWA */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-yellow-500/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative flex items-center justify-between p-6 bg-zinc-900/40 border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all">
                                <div>
                                    <p className="font-bold text-white text-lg font-outfit">USDC</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Claim {FAUCET_AMOUNTS.MockUSDC} USDC</p>
                                </div>
                                <button
                                    onClick={() => handleClaim('MockUSDC', 6, true)}
                                    disabled={claimingToken === 'MockUSDC' || isConfirming}
                                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-xs font-bold rounded-lg transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
                                >
                                    {claimingToken === 'MockUSDC' && isConfirming ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Claim'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <br />
            {/* Info Footer */}
            <div className="mt-4 pt-6 border-t border-yellow-500/20">
                <div className="flex gap-3">
                    <div className="mt-0.5">💡</div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-medium">
                        These are test tokens for Anvil testnet only. You can claim multiple times for testing purposes.
                    </p>
                </div>
            </div>
        </div>
    );
}
