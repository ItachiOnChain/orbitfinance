import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { RWA_CONTRACTS, setKYCVerified } from '../utils/rwa/contracts';
import IdentityRegistryABI from '../contracts/rwa-abis/IdentityRegistry.json';

interface KYCModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function KYCModal({ isOpen, onClose }: KYCModalProps) {
    const { address } = useAccount();
    const [step, setStep] = useState<'initial' | 'verifying' | 'success'>('initial');
    const [progress, setProgress] = useState(0);

    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess && address) {
            setKYCVerified(address);
            setStep('success');
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 2000);
        }
    }, [isSuccess, address, onClose]);

    const handleVerify = async () => {
        if (!address) return;

        setStep('verifying');

        // Animate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        // Call contract after animation
        setTimeout(async () => {
            try {
                await writeContract({
                    address: RWA_CONTRACTS.anvil.IdentityRegistry,
                    abi: IdentityRegistryABI.abi,
                    functionName: 'mockVerifyUser',
                    args: [address],
                });
            } catch (error) {
                console.error('KYC verification failed:', error);
                setStep('initial');
                setProgress(0);
            }
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#0A2342] border border-[#00D4FF]/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                {step === 'initial' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFB800]/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Identity Verification Required
                            </h2>
                            <p className="text-gray-400 text-sm">
                                To access RWA features, you must complete KYC verification in compliance with regulatory requirements.
                            </p>
                        </div>

                        <div className="bg-[#1A1D29] rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-semibold text-white mb-2">What we'll verify:</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00F5A0]">✓</span>
                                    Identity document
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00F5A0]">✓</span>
                                    Wallet ownership
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00F5A0]">✓</span>
                                    Accredited investor status
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={isPending}
                            className="w-full py-3 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A2342] font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Initiating...' : 'Start Verification'}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Powered by Persona • Secure & Encrypted
                        </p>
                    </>
                )}

                {step === 'verifying' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Verifying Identity...
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">
                                {progress < 30 && 'Connecting to Persona...'}
                                {progress >= 30 && progress < 70 && 'Scanning ID document...'}
                                {progress >= 70 && progress < 100 && 'Validating information...'}
                                {progress === 100 && 'Finalizing verification...'}
                            </p>
                        </div>

                        <div className="bg-[#1A1D29] rounded-lg p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-[#00D4FF] font-mono">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#00D4FF] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00F5A0]/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            ✅ Verified!
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Welcome to Orbit RWA. Redirecting...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
