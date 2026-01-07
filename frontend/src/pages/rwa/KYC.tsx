import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { kycService, type KYCSubmission } from '../../services/rwa/kycService';
import { TokenFaucet } from '../../components/TokenFaucet';

const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Japan', 'Singapore', 'Switzerland', 'Netherlands',
    'India', 'Brazil', 'Mexico', 'South Korea', 'Spain', 'Italy',
].sort();

export default function KYC() {
    const { address } = useAccount();
    const navigate = useNavigate();
    const { data: isVerified, refetch: refetchKYCStatus } = useKYCStatus();

    const [submission, setSubmission] = useState<KYCSubmission | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [fullName, setFullName] = useState('');
    const [country, setCountry] = useState('');
    const [addressField, setAddressField] = useState('');
    const [idDocument, setIdDocument] = useState<File | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Load existing submission
    useEffect(() => {
        const loadSubmission = async () => {
            if (!address) return;

            setLoading(true);
            const existing = await kycService.getUserSubmission(address);
            setSubmission(existing);
            setLoading(false);
        };

        loadSubmission();

        // Poll for updates every 5 seconds
        const interval = setInterval(loadSubmission, 5000);
        return () => clearInterval(interval);
    }, [address]);

    // Refetch KYC status when submission changes
    useEffect(() => {
        if (submission?.status === 'approved') {
            refetchKYCStatus();
        }
    }, [submission?.status, refetchKYCStatus]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('File must be JPG, PNG, or PDF');
            return;
        }

        setIdDocument(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!address || !idDocument) return;

        setSubmitting(true);
        try {
            const newSubmission = await kycService.submitKYC({
                userAddress: address,
                fullName,
                country,
                address: addressField,
                idDocument,
            });

            setSubmission(newSubmission);

            // Reset form
            setFullName('');
            setCountry('');
            setAddressField('');
            setIdDocument(null);
            setAgreedToTerms(false);
        } catch (error) {
            console.error('KYC submission failed:', error);
            alert('Failed to submit KYC. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!address) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Shield className="mx-auto mb-4 text-zinc-500" size={64} />
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                    <p className="text-zinc-400">Please connect your wallet to access KYC verification</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (isVerified) {
        return (
            <div className="flex justify-end pr-8">
                <div className="max-w-2xl w-full">
                    <div className="bg-gold/5 border-2 border-gold/30 rounded-3xl p-12 text-center backdrop-blur-xl shadow-[0_0_50px_rgba(212,175,55,0.15)] group hover:border-gold/50 transition-all duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <CheckCircle className="mx-auto text-gold relative z-10" size={80} />
                        </div>
                        <h2 className="text-4xl font-bold text-gold mb-6 font-outfit tracking-tight">KYC Verified!</h2>
                        <p className="text-zinc-400 mb-10 font-light leading-relaxed text-lg max-w-md mx-auto">
                            Your identity has been successfully verified. You now have full institutional access to all RWA features.
                        </p>
                        <button
                            onClick={() => navigate('/rwa/asset-origination')}
                            className="px-10 py-5 bg-gold hover:bg-gold/90 text-zinc-950 font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] active:scale-95 uppercase tracking-[0.2em] text-sm"
                        >
                            Start Tokenizing Assets
                        </button>
                    </div>
                </div>

                {/* Token Faucet */}
                <TokenFaucet mode="rwa" />
            </div>
        );
    }

    // Pending approval
    if (submission?.status === 'pending') {
        return (
            <div className="flex justify-end pr-8">
                <div className="max-w-2xl w-full">
                    <div className="bg-gold/5 border-2 border-gold/20 rounded-3xl p-12 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.1)]">
                        <div className="flex items-center gap-8 mb-12">
                            <div className="p-5 rounded-2xl bg-gold/10 border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                <AlertTriangle className="text-gold" size={40} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 font-outfit tracking-tight">KYC Pending Approval</h2>
                                <p className="text-zinc-400 font-light leading-relaxed">
                                    Your KYC submission is being reviewed by our compliance team.
                                    You'll be notified once your verification is complete.
                                </p>
                            </div>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-10 space-y-8">
                            <h3 className="font-bold text-zinc-500 mb-2 font-outfit tracking-[0.3em] uppercase text-[10px]">Submission Details</h3>
                            <div className="grid grid-cols-2 gap-12 text-sm">
                                <div className="space-y-2">
                                    <p className="text-zinc-600 uppercase tracking-widest text-[9px] font-bold">Full Name</p>
                                    <p className="text-white font-medium text-lg font-outfit">{submission?.fullName}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-zinc-600 uppercase tracking-widest text-[9px] font-bold">Country</p>
                                    <p className="text-white font-medium text-lg font-outfit">{submission?.country}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <p className="text-zinc-600 uppercase tracking-widest text-[9px] font-bold">Submitted At</p>
                                    <p className="text-white font-medium text-lg font-outfit">
                                        {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-zinc-600 text-[10px] mt-10 text-center font-bold tracking-[0.4em] uppercase">
                            Verification typically takes 1-2 business days
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Rejected - allow resubmission
    if (submission?.status === 'rejected') {
        return (
            <div className="flex justify-end pr-8">
                <div className="max-w-2xl w-full">
                    <div className="bg-red-500/5 border-2 border-red-500/20 rounded-3xl p-12 mb-10 backdrop-blur-xl">
                        <div className="flex items-center gap-8">
                            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
                                <AlertTriangle className="text-red-400" size={40} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 font-outfit tracking-tight">KYC Rejected</h2>
                                <p className="text-zinc-400 font-light leading-relaxed">
                                    Your KYC submission was rejected. Please review the reason below and resubmit.
                                </p>
                            </div>
                        </div>
                        {submission?.rejectionReason && (
                            <div className="mt-8 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8">
                                <p className="text-[10px] text-zinc-500 mb-3 uppercase tracking-[0.3em] font-bold">Rejection Reason</p>
                                <p className="text-white font-light text-base leading-relaxed">{submission.rejectionReason}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-950/50 border-2 border-gold/10 rounded-3xl p-12 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                        <h3 className="text-2xl font-bold text-white mb-10 font-outfit tracking-tight">Resubmit KYC Application</h3>
                        {/* Form would go here */}
                    </div>
                </div>
            </div>
        );
    }

    // KYC Form
    return (
        <div className="flex justify-end pr-8">
            <div className="max-w-2xl w-full">
                <div className="bg-zinc-950/50 border-2 border-gold/20 rounded-[40px] p-12 backdrop-blur-3xl shadow-[0_0_80px_rgba(212,175,55,0.08)] relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full group-hover:bg-gold/10 transition-all duration-1000" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 rounded-2xl bg-gold/10 border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                                <Shield className="text-gold" size={36} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white font-outfit tracking-tight">KYC Verification</h1>
                                <p className="text-zinc-500 text-sm font-light tracking-widest uppercase mt-2">Institutional Identity Standards</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Full Name */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] ml-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Enter your legal full name"
                                    className="w-full px-6 py-5 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl text-white focus:border-gold/50 focus:bg-zinc-900/50 focus:outline-none transition-all duration-500 placeholder:text-zinc-700 font-outfit text-lg"
                                />
                            </div>

                            {/* Country */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] ml-1">
                                    Country of Residence *
                                </label>
                                <div className="relative">
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        required
                                        className="w-full px-6 py-5 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl text-white focus:border-gold/50 focus:bg-zinc-900/50 focus:outline-none transition-all duration-500 appearance-none cursor-pointer font-outfit text-lg"
                                    >
                                        <option value="" className="bg-zinc-950">Select your country</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c} value={c} className="bg-zinc-950">{c}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] ml-1">
                                    Residential Address *
                                </label>
                                <textarea
                                    value={addressField}
                                    onChange={(e) => setAddressField(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Enter your full residential address"
                                    className="w-full px-6 py-5 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl text-white focus:border-gold/50 focus:bg-zinc-900/50 focus:outline-none transition-all duration-500 resize-none placeholder:text-zinc-700 font-outfit text-lg leading-relaxed"
                                />
                            </div>

                            {/* ID Document Upload */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] ml-1">
                                    Government-Issued ID *
                                </label>
                                <div className="group/upload relative">
                                    <div className="absolute -inset-[1px] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl group-hover/upload:from-gold/40 group-hover/upload:to-zinc-800 transition-all duration-700" />
                                    <div className="relative border-2 border-dashed border-zinc-800/40 rounded-3xl p-12 text-center hover:border-gold/30 transition-all duration-700 bg-zinc-950/60 backdrop-blur-sm">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                            onChange={handleFileChange}
                                            required
                                            className="hidden"
                                            id="id-upload"
                                        />
                                        <label htmlFor="id-upload" className="cursor-pointer block">
                                            {idDocument ? (
                                                <div className="flex flex-col items-center gap-4 text-gold animate-in fade-in zoom-in duration-500">
                                                    <div className="p-5 rounded-full bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                                                        <FileText size={48} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-lg tracking-tight">{idDocument.name}</p>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-2 font-bold">
                                                            {(idDocument.size / 1024).toFixed(0)} KB • READY
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="p-6 rounded-full bg-zinc-900/80 w-fit mx-auto group-hover/upload:bg-gold/10 group-hover/upload:scale-110 transition-all duration-500 shadow-inner">
                                                        <Upload className="text-zinc-600 group-hover/upload:text-gold transition-colors" size={40} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-lg tracking-tight">Upload Identity Document</p>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-3 font-bold">
                                                            JPG, PNG, or PDF • MAX 5MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6 mt-6">
                                    {['Passport', 'Driver\'s License', 'National ID'].map(doc => (
                                        <span key={doc} className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold border border-zinc-800/50 px-3 py-1 rounded-full">{doc}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-5 p-6 rounded-3xl bg-zinc-900/20 border border-zinc-800/40 hover:border-gold/20 transition-colors duration-500">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        required
                                        className="w-6 h-6 rounded-lg border-zinc-800 bg-zinc-950 text-gold focus:ring-gold/40 focus:ring-offset-zinc-950 transition-all cursor-pointer"
                                        id="terms"
                                    />
                                </div>
                                <label htmlFor="terms" className="text-xs text-zinc-500 leading-relaxed font-light">
                                    I hereby declare that the information provided is true and accurate. I agree to the <span className="text-gold/60 hover:text-gold cursor-pointer transition-colors font-medium">Terms of Service</span> and <span className="text-gold/60 hover:text-gold cursor-pointer transition-colors font-medium">Privacy Policy</span>.
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting || !fullName || !country || !addressField || !idDocument || !agreedToTerms}
                                className="w-full py-6 bg-gold hover:bg-gold/90 text-zinc-950 font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:shadow-[0_0_60px_rgba(212,175,55,0.4)] disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] group/btn overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                                {submitting ? (
                                    <div className="flex items-center justify-center gap-4 relative z-10">
                                        <div className="w-6 h-6 border-3 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                                        <span className="tracking-[0.3em] text-sm">PROCESSING...</span>
                                    </div>
                                ) : (
                                    <span className="tracking-[0.4em] text-sm relative z-10">SUBMIT APPLICATION</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 p-8 bg-gold/5 border border-gold/10 rounded-3xl flex items-start gap-6 shadow-inner">
                            <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
                                <Shield size={20} className="text-gold" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] text-gold/80 uppercase tracking-[0.3em] font-bold">Security & Compliance</p>
                                <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                                    Your personal data is encrypted using AES-256 standards and stored in isolated secure vaults. 
                                    Orbit Finance maintains full compliance with global AML/KYC regulations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
