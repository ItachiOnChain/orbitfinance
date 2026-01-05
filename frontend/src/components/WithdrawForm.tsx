import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useWithdraw } from '../hooks/useWithdraw';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';
import OrbitAccountABI from '../contracts/abis/OrbitAccount.json';
import type { Vault } from '../hooks/useVaults';
import { formatEther, formatUnits } from 'viem';

interface WithdrawFormProps {
    vault: Vault;
}

export function WithdrawForm({ vault }: WithdrawFormProps) {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [slippage, setSlippage] = useState(0.5);

    const { data: accountAddress } = useReadContract({
        address: CONTRACTS.anvil.AccountFactory as `0x${string}`,
        abi: AccountFactoryABI.abi,
        functionName: 'getAccount',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Get withdrawable collateral from OrbitAccount
    const { data: withdrawableAmount } = useReadContract({
        address: accountAddress as `0x${string}`,
        abi: OrbitAccountABI.abi,
        functionName: 'withdrawableCollateral',
        args: accountAddress ? [vault.asset] : undefined,
        query: {
            enabled: !!accountAddress,
            refetchInterval: 3000,
        },
    });

    const { withdraw, isPending, isSuccess } = useWithdraw();

    useEffect(() => {
        if (isSuccess) {
            setAmount('');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess]);

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0 || !address || !accountAddress) {
            alert('Invalid amount, no wallet connected, or no account found');
            return;
        }

        try {
            const decimals = vault.name.includes('USDC') ? 6 : 18;

            await withdraw(
                accountAddress as `0x${string}`,
                amount,
                vault.asset as `0x${string}`,
                decimals
            );
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const setMaxAmount = () => {
        if (withdrawableAmount) {
            const decimals = vault.name.includes('USDC') ? 6 : 18;
            const formatted = decimals === 6
                ? formatUnits(withdrawableAmount as bigint, 6)
                : formatEther(withdrawableAmount as bigint);
            setAmount(formatted);
        }
    };

    if (!accountAddress || accountAddress === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="bg-zinc-900/30 rounded-lg p-6">
                <p className="text-zinc-400 font-light text-sm">
                    No OrbitAccount found.
                </p>
            </div>
        );
    }

    const decimals = vault.name.includes('USDC') ? 6 : 18;
    const formattedAmount = withdrawableAmount
        ? (decimals === 6 ? formatUnits(withdrawableAmount as bigint, 6) : formatEther(withdrawableAmount as bigint))
        : '0';

    return (
        <div className="bg-zinc-900/30 rounded-lg p-6 space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-zinc-400">Withdrawable Amount</p>
                <p className="text-2xl font-light text-emerald-400">
                    {formattedAmount} {vault.name.split(' ')[0]}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                    {vault.name}
                </p>
                {withdrawableAmount && (withdrawableAmount as bigint) === 0n ? (
                    <p className="text-xs text-amber-400 mt-2">
                        ⚠️ You may have outstanding debt restricting withdrawal
                    </p>
                ) : null}
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-base text-zinc-400">Amount</label>
                    <button
                        onClick={setMaxAmount}
                        disabled={!withdrawableAmount || withdrawableAmount === 0n}
                        className="text-sm text-gold hover:text-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        MAX
                    </button>
                </div>
                <br />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step={decimals === 6 ? '0.01' : '0.0001'}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-base text-white focus:outline-none focus:border-gold"
                />
            </div>
            <br />

            <div>
                <label className="text-base text-zinc-400 block mb-2">
                    Maximum Slippage: {slippage}%
                </label>
                <br />
                <div className="flex gap-2">
                    {[0.5, 1, 2, 5].map((value) => (
                        <button
                            key={value}
                            onClick={() => setSlippage(value)}
                            className={`px-4 py-2 rounded-lg text-sm font-light transition-colors ${slippage === value
                                ? 'bg-gold text-black'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            {value}%
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleWithdraw}
                disabled={!amount || isPending || !withdrawableAmount || withdrawableAmount === 0n}
                className="w-full px-6 py-3 bg-gold text-black rounded-lg font-light hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Withdrawing...' : 'Withdraw'}
            </button>

            {isSuccess && (
                <p className="text-sm text-emerald-400">✓ Withdrawal confirmed! Refreshing...</p>
            )}
        </div>
    );
}
