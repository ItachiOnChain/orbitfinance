import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { kycService, type KYCSubmission } from '../../services/rwa/kycService';

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
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00D4FF]"></div>
            </div>
        );
    }

    // Already verified
    if (isVerified) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-8 text-center">
                    <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
                    <h2 className="text-3xl font-bold text-white mb-2">KYC Verified!</h2>
                    <p className="text-zinc-300 mb-6">
                        Your identity has been verified. You now have full access to all RWA features.
                    </p>
                    <button
                        onClick={() => navigate('/rwa/asset-origination')}
                        className="px-6 py-3 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A2342] font-bold rounded-lg transition-colors"
                    >
                        Start Tokenizing Assets
                    </button>
                </div>
            </div>
        );
    }

    // Pending approval
    if (submission?.status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <AlertTriangle className="text-yellow-400 flex-shrink-0" size={32} />
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">KYC Pending Approval</h2>
                            <p className="text-zinc-300">
                                Your KYC submission is being reviewed by our compliance team.
                                You'll be notified once your verification is complete.
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-3">
                        <h3 className="font-bold text-white mb-4">Submission Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-zinc-500">Full Name</p>
                                <p className="text-white font-medium">{submission.fullName}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Country</p>
                                <p className="text-white font-medium">{submission.country}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-zinc-500">Submitted</p>
                                <p className="text-white font-medium">
                                    {new Date(submission.submittedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-zinc-400 text-sm mt-6 text-center">
                        Verification typically takes 1-2 business days
                    </p>
                </div>
            </div>
        );
    }

    // Rejected - allow resubmission
    if (submission?.status === 'rejected') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-8 mb-6">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-red-400 flex-shrink-0" size={32} />
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">KYC Rejected</h2>
                            <p className="text-zinc-300 mb-4">
                                Your KYC submission was rejected. Please review the reason below and resubmit with correct information.
                            </p>
                            {submission.rejectionReason && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                                    <p className="text-sm text-zinc-400 mb-1">Rejection Reason:</p>
                                    <p className="text-white">{submission.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Show form again for resubmission */}
                <div className="bg-[#0A2342] border border-zinc-800 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Resubmit KYC</h3>
                    {/* Render form below */}
                </div>
            </div>
        );
    }

    // KYC Form
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-[#0A2342] border-2 border-[#00D4FF] rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-[#00D4FF]" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
                        <p className="text-zinc-400 text-sm">Complete your identity verification to access RWA features</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-[#00D4FF] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-2">
                            Country of Residence *
                        </label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-[#00D4FF] focus:outline-none transition-colors"
                        >
                            <option value="">Select country...</option>
                            {COUNTRIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-2">
                            Residential Address *
                        </label>
                        <textarea
                            value={addressField}
                            onChange={(e) => setAddressField(e.target.value)}
                            required
                            rows={3}
                            placeholder="123 Main St, City, State, ZIP"
                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-[#00D4FF] focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* ID Document Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-2">
                            Government-Issued ID *
                        </label>
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-[#00D4FF] transition-colors">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                onChange={handleFileChange}
                                required
                                className="hidden"
                                id="id-upload"
                            />
                            <label htmlFor="id-upload" className="cursor-pointer">
                                {idDocument ? (
                                    <div className="flex items-center justify-center gap-2 text-[#00D4FF]">
                                        <FileText size={24} />
                                        <span className="font-medium">{idDocument.name}</span>
                                        <span className="text-xs text-zinc-500">
                                            ({(idDocument.size / 1024).toFixed(0)} KB)
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="mx-auto mb-2 text-zinc-500" size={32} />
                                        <p className="text-white font-medium mb-1">Click to upload</p>
                                        <p className="text-xs text-zinc-500">
                                            JPG, PNG, or PDF (max 5MB)
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                            Accepted documents: Passport, Driver's License, National ID Card
                        </p>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            required
                            className="mt-1"
                            id="terms"
                        />
                        <label htmlFor="terms" className="text-sm text-zinc-400">
                            I agree to the Terms & Conditions and Privacy Policy. I understand that my information
                            will be used for KYC verification purposes only.
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || !fullName || !country || !addressField || !idDocument || !agreedToTerms}
                        className="w-full py-4 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0A2342] font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit KYC Application'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-zinc-300">
                        <strong className="text-blue-400">Note:</strong> Your personal information is encrypted and stored securely.
                        We comply with all data protection regulations.
                    </p>
                </div>
            </div>
        </div>
    );
}
