import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useDeposit } from '../hooks/useDeposit';
import { CONTRACTS } from '../contracts/addresses';
import AccountFactoryABI from '../contracts/abis/AccountFactory.json';
import { CreateAccountButton } from './CreateAccountButton';
import type { Vault } from '../hooks/useVaults';

interface DepositFormProps {
    vault: Vault;
}

export function DepositForm({ vault }: DepositFormProps) {
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

    const { deposit, isPending, isSuccess, step } = useDeposit();

    // Reset form and refresh after successful deposit
    useEffect(() => {
        if (isSuccess) {
            setAmount('');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess]);

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0 || !address || !accountAddress) {
            alert('Invalid amount, no wallet connected, or no account found');
            return;
        }

        try {
            // Determine decimals based on asset
            const decimals = vault.name.includes('USDC') ? 6 : 18;

            // Deposit through OrbitAccount (not vault!)
            await deposit(
                accountAddress as `0x${string}`,
                amount,
                vault.asset as `0x${string}`,
                decimals
            );
        } catch (error) {
            console.error('Deposit failed:', error);
            alert(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (!accountAddress || accountAddress === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="bg-zinc-900/30 rounded-lg p-6 space-y-4">
                <p className="text-zinc-400 font-light text-sm mb-4">
                    No OrbitAccount found. You need to create an account first.
                </p>
                <CreateAccountButton />
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/30 rounded-lg p-6 space-y-4">
            <div>
                <label className="text-base text-zinc-400 block mb-2">Amount ({vault.name.split(' ')[0]})</label>
                <br />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step={vault.name.includes('USDC') ? '0.01' : '0.0001'}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-base text-white focus:outline-none focus:border-gold"
                />
                <br />
                <p className="text-sm text-zinc-500 mt-1">
                    Depositing through OrbitAccount
                </p>
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
                onClick={handleDeposit}
                disabled={!amount || isPending}
                className="w-full px-6 py-3 bg-gold text-black rounded-lg font-light hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending
                    ? step === 'approving'
                        ? 'Approving Token...'
                        : 'Depositing...'
                    : 'Deposit'}
            </button>

            {isSuccess && (
                <p className="text-sm text-emerald-400">✓ Deposit confirmed! Refreshing...</p>
            )}

            {step === 'approving' && (
                <p className="text-xs text-zinc-400">Step 1/2: Approve token to OrbitAccount</p>
            )}
            {step === 'depositing' && (
                <p className="text-xs text-zinc-400">Step 2/2: Depositing through OrbitAccount</p>
            )}
        </div>
    );
}
