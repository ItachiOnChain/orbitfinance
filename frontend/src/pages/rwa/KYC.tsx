import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useKYCStatus } from '../../hooks/rwa/useKYC';
import { kycService, type KYCSubmission } from '../../services/rwa/kycService';
import { TokenFaucet } from '../../components/TokenFaucet';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'Switzerland',
  'Netherlands',
  'India',
  'Brazil',
  'Mexico',
  'South Korea',
  'Spain',
  'Italy',
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

  // CONNECT WALLET STATE
  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Shield className="mx-auto mb-4 text-zinc-500" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-zinc-400">
            Please connect your wallet to access KYC verification
          </p>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // VERIFIED STATE
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col md:flex-row items-center gap-10 px-4">
          <div className="max-w-xl w-full">
            <div className="bg-yellow-500/5 border-2 border-yellow-400/40 rounded-xl p-10 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(234,179,8,0.3)]">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-yellow-400/25 blur-3xl rounded-full scale-150" />
                <CheckCircle className="mx-auto text-yellow-300 relative z-10" size={72} />
              </div>
              <h2 className="text-3xl font-bold text-yellow-100 mb-4 font-outfit tracking-tight">
                KYC Verified
              </h2>
              <p className="text-zinc-300 mb-8 font-light leading-relaxed text-sm md:text-base">
                Your identity has been successfully verified. You now have full
                institutional access to all RWA features.
              </p>
              <button
                onClick={() => navigate('/rwa/asset-origination')}
                className="px-8 py-4 bg-yellow-300 hover:bg-yellow-200 text-zinc-950 font-bold rounded-xl transition-all shadow-[0_0_35px_rgba(234,179,8,0.6)] active:scale-95 uppercase tracking-[0.22em] text-[11px]"
              >
                Start Tokenizing Assets
              </button>
            </div>
          </div>

          <TokenFaucet mode="rwa" />
        </div>
      </div>
    );
  }

  // PENDING STATE
  if (submission?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-xl w-full px-4">
          <div className="bg-yellow-500/5 border-2 border-yellow-400/30 rounded-xl p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(234,179,8,0.25)]">
            <div className="flex items-center gap-6 mb-10">
              <div className="p-4 rounded-xl bg-yellow-500/15 border border-yellow-400/40">
                <AlertTriangle className="text-yellow-300" size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 font-outfit tracking-tight">
                  KYC Pending Approval
                </h2>
                <p className="text-zinc-300 text-sm font-light leading-relaxed">
                  Your KYC submission is being reviewed by our compliance team. You will
                  be notified once your verification is complete.
                </p>
              </div>
            </div>

            <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-8 space-y-6">
              <h3 className="font-bold text-zinc-500 text-[10px] font-outfit tracking-[0.3em] uppercase">
                Submission Details
              </h3>
              <br />
              <div className="grid grid-cols-2 gap-8 text-sm">
                
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-[0.25em] text-[9px] font-bold">
                    Full Name
                  </p>
                  <br />
                  <br />
                  <p className="text-white font-medium text-lg font-outfit">
                    {submission?.fullName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-[0.25em] text-[9px] font-bold">
                    Country
                  </p>
                  <br />
                  <br />
                  <p className="text-white font-medium text-lg font-outfit">
                    {submission?.country}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-zinc-500 uppercase tracking-[0.25em] text-[9px] font-bold">
                    Submitted At
                  </p>
                  <br />
                  <br />
                  <p className="text-white font-medium text-lg font-outfit">
                    {submission?.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-zinc-500 text-[10px] mt-8 text-center font-bold tracking-[0.35em] uppercase">
              Verification typically takes 1–2 business days
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED STATE
  if (submission?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-xl w-full px-4 space-y-8">
          <div className="bg-red-500/10 border-2 border-red-500/40 rounded-xl p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(248,113,113,0.35)]">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40">
                <AlertTriangle className="text-red-300" size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 font-outfit tracking-tight">
                  KYC Rejected
                </h2>
                <p className="text-zinc-300 text-sm font-light leading-relaxed">
                  Your KYC submission was rejected. Please review the reason below and
                  resubmit.
                </p>
              </div>
            </div>
            {submission?.rejectionReason && (
              <div className="mt-7 bg-zinc-950/70 border border-zinc-800/70 rounded-xl p-6">
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-[0.3em] font-bold">
                  Rejection Reason
                </p>
                <p className="text-white text-sm font-light leading-relaxed">
                  {submission.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Resubmit container, you can add full form later if needed */}
          <div className="bg-zinc-950/70 border-2 border-yellow-400/25 rounded-xl p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <h3 className="text-xl font-bold text-white mb-4 font-outfit tracking-tight">
              Resubmit KYC Application
            </h3>
            {/* Reuse the form here if you want the full resubmission flow */}
            <p className="text-sm text-zinc-400">
              Please correct your details and resubmit using the KYC form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // KYC FORM (DEFAULT)
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative bg-zinc-950/60 border border-yellow-500/40 rounded-2xl p-8 sm:p-10 md:p-12 shadow-[0_0_80px_rgba(234,179,8,0.25)] backdrop-blur-3xl overflow-hidden">
          {/* golden glow */}
          <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 bg-yellow-500/10 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 bg-yellow-500/5 blur-3xl rounded-full" />

          <div className="relative z-10">
            {/* header */}
            <div className="flex flex-col items-center text-center gap-4 mb-10">
              <div className="p-4 rounded-xl bg-yellow-500/15 border border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.35)]">
                
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gold/100 font-outfit tracking-tight">
                  KYC Verification
                </h1>
                <p className="text-[11px] md:text-xs text-yellow-100/70 tracking-[0.35em] uppercase mt-2 font-semibold">
                  Institutional Identity Standards
                </p>
              </div>
            </div>
            <br />
            <br />

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name */}
              <div className="space-y-3 w-full">
                <label className="block text-[10px] font-semibold text-yellow-300 uppercase tracking-[0.4em] text-center drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your legal full name"
                  className="w-full px-6 py-4 bg-zinc-900/40 border border-yellow-500/30 rounded-lg text-white text-sm md:text-base text-center font-outfit shadow-[0_0_30px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-yellow-400/70 focus:border-yellow-400/80 placeholder:text-zinc-600 transition-all duration-300"
                />
              </div>
              <br />
              <br />

              {/* Country */}
              <div className="space-y-3 w-full">
                <label className="block text-[10px] font-semibold text-yellow-300 uppercase tracking-[0.4em] text-center drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
                  Country of Residence *
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-zinc-900/40 border border-yellow-500/30 rounded-lg text-white text-sm md:text-base text-center font-outfit shadow-[0_0_30px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-yellow-400/70 focus:border-yellow-400/80 appearance-none cursor-pointer transition-all duration-300"
                  >
                    <option value="" className="bg-zinc-950">
                      Select your country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-950">
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-yellow-400/70">
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L6 6L11 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <br />
              <br />

              {/* Address */}
              <div className="space-y-3 w-full">
                <label className="block text-[10px] font-semibold text-yellow-300 uppercase tracking-[0.4em] text-center drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
                  Residential Address *
                </label>
                <textarea
                  value={addressField}
                  onChange={(e) => setAddressField(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter your full residential address"
                  className="w-full px-6 py-4 bg-zinc-900/40 border border-yellow-500/30 rounded-lg text-white text-sm md:text-base leading-relaxed text-center font-outfit shadow-[0_0_30px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-yellow-400/70 focus:border-yellow-400/80 placeholder:text-zinc-600 resize-none transition-all duration-300"
                />
              </div>
              <br />
              <br />

              {/* ID Document Upload */}
              <div className="space-y-4 w-full">
                <label className="block text-[10px] font-semibold text-yellow-300 uppercase tracking-[0.4em] text-center drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
                  Government‑Issued ID *
                </label>
                <div className="group relative">
                  <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-yellow-200/20 via-yellow-500/5 to-zinc-900 group-hover:from-yellow-300/40 group-hover:via-yellow-500/10 transition-all duration-700" />
                  <div className="relative border-2 border-dashed border-yellow-500/30 rounded-xl p-7 text-center bg-zinc-950/60 backdrop-blur-md group-hover:border-yellow-300/80 transition-all duration-500">
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
                        <div className="flex flex-col items-center gap-3 text-yellow-200">
                          <div className="p-4 rounded-xl bg-yellow-500/15 shadow-[0_0_25px_rgba(234,179,8,0.45)]">
                            <FileText size={34} />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-sm md:text-base tracking-tight">
                              {idDocument.name}
                            </p>
                            <p className="text-[9px] text-yellow-100/70 uppercase tracking-[0.3em] mt-1 font-bold">
                              {(idDocument.size / 1024).toFixed(0)} KB • READY
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-zinc-900/70 w-fit mx-auto group-hover:bg-yellow-500/10 group-hover:scale-110 transition-all duration-500 shadow-inner">
                            <Upload
                              className="text-yellow-200/60 group-hover:text-yellow-300"
                              size={30}
                            />
                          </div>
                          <div>
                            <p className="text-yellow-50 font-semibold text-sm md:text-base tracking-tight">
                              Upload Identity Document
                            </p>
                            <p className="text-[9px] text-yellow-100/60 uppercase tracking-[0.3em] mt-2 font-bold">
                              JPG, PNG, or PDF • MAX 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <br />
                <br />

                <div className="flex justify-center flex-wrap gap-2 mt-2">
                  {["Passport", "Driver's License", 'National ID'].map((doc) => (
                    <span
                      key={doc}
                      className="text-[9px] text-yellow-100/70 uppercase tracking-[0.25em] font-semibold border border-yellow-500/40 px-3 py-1 rounded-lg bg-zinc-950/60"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="w-full">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900/40 border border-yellow-500/25">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    id="terms"
                    className="mt-1 w-5 h-5 rounded-md border-yellow-500/40 bg-zinc-950 text-yellow-400 focus:ring-yellow-400/50 focus:ring-offset-0"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[11px] text-zinc-300 leading-relaxed font-light text-left"
                  >
                    I hereby declare that the information provided is true and accurate. I agree
                    to the{' '}
                    <span className="text-yellow-300 hover:text-yellow-200 cursor-pointer font-medium">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-yellow-300 hover:text-yellow-200 cursor-pointer font-medium">
                      Privacy Policy
                    </span>
                    .
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="w-full">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !fullName ||
                    !country ||
                    !addressField ||
                    !idDocument ||
                    !agreedToTerms
                  }
                  className="relative w-full py-4 md:py-5 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-zinc-950 font-bold tracking-[0.35em] text-[11px] md:text-xs uppercase shadow-[0_0_45px_rgba(234,179,8,0.55)] hover:shadow-[0_0_65px_rgba(234,179,8,0.8)] active:scale-[0.98] disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-18deg]" />
                  {submitting ? (
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-zinc-900/40 border-t-zinc-900 rounded-full animate-spin" />
                      <span>PROCESSING</span>
                    </div>
                  ) : (
                    <span className="relative z-10">SUBMIT APPLICATION</span>
                  )}
                </button>
              </div>
            </form>

            {/* security note */}
            <div className="mt-10 w-full p-5 bg-zinc-900/40 border border-yellow-500/20 rounded-xl flex items-start gap-4">
              <div className="p-2 rounded-xl bg-yellow-500/15 border border-yellow-500/40 flex-shrink-0">
                <Shield size={18} className="text-yellow-300" />
              </div>
              <div className="space-y-1 text-left">
                <p className="text-[10px] text-yellow-200/80 uppercase tracking-[0.3em] font-semibold">
                  Security & Compliance
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-light">
                  Your personal data is encrypted using AES‑256 standards and stored in secure
                  vaults. Orbit Finance follows global AML/KYC regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
