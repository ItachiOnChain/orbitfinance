import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useLiquidate } from '../hooks/useLiquidate';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';
import { formatEther, parseEther } from 'viem';

interface LiquidateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LiquidateModal({ isOpen, onClose }: LiquidateModalProps) {
    const { address } = useAccount();
    const [debtAmount, setDebtAmount] = useState('');
    const [asset, setAsset] = useState<'WETH' | 'USDC'>('WETH');

    const { data: accountAddress } = useReadContract({
        address: CONTRACTS.anvil.AccountFactory as `0x${string}`,
        abi: AccountFactoryABI.abi,
        functionName: 'getAccount',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const { data: currentDebt } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'totalDebt',
        query: {
            enabled: !!accountAddress,
        },
    });

    const { liquidate, isPending, isSuccess } = useLiquidate();

    useEffect(() => {
        if (isSuccess) {
            setDebtAmount('');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess]);

    const handleLiquidate = async () => {
        if (!debtAmount || !accountAddress) {
            alert('Please enter debt amount');
            return;
        }

        try {
            const assetAddress = asset === 'WETH' ? CONTRACTS.anvil.WETH : CONTRACTS.anvil.USDC;

            // Parse debt amount
            const debtAmountBigInt = parseEther(debtAmount);

            // Calculate max collateral: debt / price * 1.2 (20% safety margin)
            // Assuming WETH = $3000, USDC = $1
            const priceInUSD = asset === 'WETH' ? 3000 : 1;
            const collateralNeeded = parseFloat(debtAmount) / priceInUSD;
            const maxCollateralWithMargin = collateralNeeded * 1.1; // 10% safety margin

            const decimals = asset === 'USDC' ? 6 : 18;

            await liquidate(
                accountAddress as `0x${string}`,
                debtAmount,
                assetAddress as `0x${string}`,
                maxCollateralWithMargin.toString(),
                decimals
            );
        } catch (error) {
            console.error('Liquidate failed:', error);
            alert(`Liquidate failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const setDebtMax = () => {
        if (currentDebt) {
            setDebtAmount(formatEther(currentDebt as bigint));
        }
    };

    // Calculate estimated collateral needed
    const estimatedCollateral = debtAmount
        ? asset === 'WETH'
            ? (parseFloat(debtAmount) / 3000 * 1.1).toFixed(6) // 10% margin
            : (parseFloat(debtAmount) * 1.1).toFixed(2)
        : '0';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light text-white">Self-Liquidate</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-sm text-zinc-400">Current Debt</p>
                        <p className="text-2xl font-light text-red-400">
                            {currentDebt ? formatEther(currentDebt as bigint) : '0'} orUSD
                        </p>
                    </div>

                    <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                        <p className="text-xs text-amber-400">
                            ⚠️ This will use your deposited {asset} collateral to repay debt
                        </p>
                    </div>

                    <div>
                        <label className="text-sm text-zinc-400 block mb-2">Collateral Asset to Use</label>
                        <select
                            value={asset}
                            onChange={(e) => setAsset(e.target.value as 'WETH' | 'USDC')}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold"
                        >
                            <option value="WETH">WETH</option>
                            <option value="USDC">USDC</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-zinc-400">Debt Amount to Repay (orUSD)</label>
                            <button
                                onClick={setDebtMax}
                                className="text-xs text-gold hover:text-gold/80"
                            >
                                MAX
                            </button>
                        </div>
                        <input
                            type="number"
                            value={debtAmount}
                            onChange={(e) => setDebtAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold"
                        />
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-sm text-zinc-400">Max Collateral to Use</p>
                        <p className="text-lg font-light text-white">
                            ~{estimatedCollateral} {asset}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Includes 10% safety margin
                        </p>
                    </div>

                    <button
                        onClick={handleLiquidate}
                        disabled={!debtAmount || isPending}
                        className="w-full px-6 py-3 bg-gold text-black rounded-lg font-light hover:bg-gold/90 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Liquidating...' : `Liquidate using ${asset}`}
                    </button>

                    {isSuccess && (
                        <p className="text-sm text-emerald-400">✓ Liquidation confirmed! Refreshing...</p>
                    )}
                </div>
            </div>
        </div>
    );
}
