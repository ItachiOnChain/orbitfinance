import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Droplet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { CONTRACTS } from '../contracts/addresses';
import rwaAddresses from '../../../deployments/anvil-rwa.json';

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
                const addresses = CONTRACTS.anvil;
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
                });
            } else {
                // Crypto tokens use mint(address, amount)
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-6 border border-blue-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 mb-3">
                    <Droplet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Test Token Faucet</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your wallet to claim test tokens
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-6 border border-blue-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 mb-4">
                <Droplet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Test Token Faucet</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Claim free test tokens for {mode === 'crypto' ? 'Crypto' : 'RWA'} mode
                    </p>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-800 dark:text-green-300">{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-800 dark:text-red-300">
                        Claim failed. Please try again.
                    </span>
                </div>
            )}

            {/* Token Claim Buttons */}
            <div className="space-y-3">
                {mode === 'crypto' ? (
                    <>
                        {/* WETH Faucet */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">WETH</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Claim {FAUCET_AMOUNTS.WETH} WETH</p>
                            </div>
                            <button
                                onClick={() => handleClaim('WETH', 18, false)}
                                disabled={claimingToken === 'WETH' || isConfirming}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {claimingToken === 'WETH' && isConfirming ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Claiming...
                                    </>
                                ) : (
                                    'Claim'
                                )}
                            </button>
                        </div>

                        {/* USDC Faucet */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">USDC</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Claim {FAUCET_AMOUNTS.USDC} USDC</p>
                            </div>
                            <button
                                onClick={() => handleClaim('USDC', 6, false)}
                                disabled={claimingToken === 'USDC' || isConfirming}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {claimingToken === 'USDC' && isConfirming ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Claiming...
                                    </>
                                ) : (
                                    'Claim'
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* MockUSDC Faucet for RWA */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">USDC</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Claim {FAUCET_AMOUNTS.MockUSDC} USDC</p>
                            </div>
                            <button
                                onClick={() => handleClaim('MockUSDC', 6, true)}
                                disabled={claimingToken === 'MockUSDC' || isConfirming}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {claimingToken === 'MockUSDC' && isConfirming ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Claiming...
                                    </>
                                ) : (
                                    'Claim'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Info Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 These are test tokens for Anvil testnet only. You can claim multiple times for testing.
                </p>
            </div>
        </div>
    );
}
