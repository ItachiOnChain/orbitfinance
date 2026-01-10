import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Droplet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { CONTRACTS } from '../contracts';

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

    // Get contract address from CONTRACTS
    const getTokenAddress = (token: string): `0x${string}` => {
        if (mode === 'crypto') {
            if (token === 'WETH') return CONTRACTS.WETH;
            if (token === 'USDC') return CONTRACTS.USDC;
        } else {
            if (token === 'MockUSDC') return CONTRACTS.MockUSDC;
        }
        return '0x0000000000000000000000000000000000000000' as `0x${string}`;
    };

    // ERC20 mint ABI (for Crypto tokens - MockERC20)
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
        }
    ] as const;

    // MockUSDC mintToSelf ABI (for RWA token)
    const MINT_TO_SELF_ABI = [
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

    const handleClaim = async (token: string, decimals: number) => {
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

            if (tokenAddress === '0x0000000000000000000000000000000000000000') {
                console.error('Invalid token address');
                setClaimingToken(null);
                return;
            }

            // RWA mode uses mintToSelf, Crypto mode uses mint(to, amount)
            if (mode === 'rwa') {
                writeContract({
                    address: tokenAddress,
                    abi: MINT_TO_SELF_ABI,
                    functionName: 'mintToSelf',
                    args: [amount],
                });
            } else {
                writeContract({
                    address: tokenAddress,
                    abi: ERC20_MINT_ABI,
                    functionName: 'mint',
                    args: [address, amount],
                });
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
            <div className="bg-black border-2 border-yellow-500/40 rounded-2xl p-10 shadow-[0_0_40px_rgba(234,179,8,0.15)] backdrop-blur-xl min-h-[400px] flex flex-col items-center justify-center text-center">
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
        <div className="bg-black border-2 border-yellow-500/40 rounded-2xl p-8 shadow-[0_0_40px_rgba(234,179,8,0.15)] backdrop-blur-xl flex flex-col">
            <div className="flex flex-col items-center text-center gap-4 mb-6">
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

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-500/10 border-2 border-green-500/30 rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-300 font-medium">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300 font-medium">Failed to claim tokens. Please try again.</p>
                </div>
            )}

            {/* Token Claim Buttons */}
            <div className="flex flex-col gap-4">
                {mode === 'crypto' ? (
                    <>
                        {/* WETH */}
                        <button
                            onClick={() => handleClaim('WETH', 18)}
                            disabled={claimingToken === 'WETH' || isConfirming}
                            className="group relative overflow-hidden bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 hover:from-yellow-600/30 hover:to-yellow-900/30 border-2 border-yellow-500/40 hover:border-yellow-400/60 rounded-xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center">
                                        <span className="text-2xl font-black text-yellow-300">W</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold text-white font-outfit">WETH</p>
                                        <p className="text-xs text-yellow-300/70 font-medium">Wrapped Ether • {FAUCET_AMOUNTS.WETH} tokens</p>
                                    </div>
                                </div>
                                {claimingToken === 'WETH' && isConfirming ? (
                                    <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                                ) : (
                                    <Droplet className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                                )}
                            </div>
                        </button>

                        {/* USDC */}
                        <button
                            onClick={() => handleClaim('USDC', 6)}
                            disabled={claimingToken === 'USDC' || isConfirming}
                            className="group relative overflow-hidden bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 hover:from-yellow-600/30 hover:to-yellow-900/30 border-2 border-yellow-500/40 hover:border-yellow-400/60 rounded-xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center">
                                        <span className="text-2xl font-black text-yellow-300">$</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold text-white font-outfit">USDC</p>
                                        <p className="text-xs text-yellow-300/70 font-medium">USD Coin • {FAUCET_AMOUNTS.USDC} tokens</p>
                                    </div>
                                </div>
                                {claimingToken === 'USDC' && isConfirming ? (
                                    <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                                ) : (
                                    <Droplet className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                                )}
                            </div>
                        </button>
                    </>
                ) : (
                    <>
                        {/* USDC (RWA Mode) */}
                        <button
                            onClick={() => handleClaim('MockUSDC', 6)}
                            disabled={claimingToken === 'MockUSDC' || isConfirming}
                            className="group relative overflow-hidden bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 hover:from-yellow-600/30 hover:to-yellow-900/30 border-2 border-yellow-500/40 hover:border-yellow-400/60 rounded-xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center">
                                        <span className="text-2xl font-black text-yellow-300">$</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold text-white font-outfit">USDC</p>
                                        <p className="text-xs text-green-300/70 font-medium">USD Coin • {FAUCET_AMOUNTS.MockUSDC} tokens</p>
                                    </div>
                                </div>
                                {claimingToken === 'MockUSDC' && isConfirming ? (
                                    <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                                ) : (
                                    <Droplet className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                                )}
                            </div>
                        </button>
                    </>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-yellow-500/20">
                <p className="text-[10px] text-zinc-500 text-center uppercase tracking-[0.2em] font-semibold">
                    Mantle Sepolia Testnet
                </p>
            </div>
        </div>
    );
}
