import { useState } from 'react';
import { X } from 'lucide-react';

interface TokenizeAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AssetFormData) => void;
}

export interface AssetFormData {
    assetType: 'RENTAL' | 'INVOICE' | 'BOND' | 'OTHER';
    assetName: string;
    monthlyIncome: number;
    duration: number;
}

export function TokenizeAssetModal({ isOpen, onClose, onSubmit }: TokenizeAssetModalProps) {
    const [formData, setFormData] = useState<AssetFormData>({
        assetType: 'RENTAL',
        assetName: '',
        monthlyIncome: 0,
        duration: 12,
    });

    const estimatedValue = formData.monthlyIncome * formData.duration;
    const maxBorrowable = estimatedValue * 0.5;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop overlay */}
            <div 
                className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" 
                onClick={onClose} 
            />

            {/* Modal Container */}
            <div 
                className="relative max-w-[520px] w-full mx-4 rounded-[12px] border border-[rgba(255,200,80,0.45)] shadow-[0_0_32px_rgba(255,200,80,0.18)] overflow-hidden transition-all duration-300 bg-[#050505]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <h2 className="text-[20px] font-semibold text-white">Tokenize New Asset</h2>
                    <button 
                        onClick={onClose} 
                        className="text-white/60 hover:text-white transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Asset Type */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[1px]">
                            Asset Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['RENTAL', 'INVOICE', 'BOND', 'OTHER'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assetType: type })}
                                    className={`h-[36px] rounded-[8px] text-[13px] font-medium border transition-all duration-200 ${
                                        formData.assetType === type
                                            ? 'bg-[rgba(255,200,80,0.15)] border-[#FFD36A] text-[#FFD36A]'
                                            : 'bg-white/5 border-white/15 text-white/70 hover:border-white/30'
                                    }`}
                                >
                                    {type.charAt(0) + type.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields Stack */}
                    <div className="space-y-5">
                        {/* Asset Name */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[1px]">
                                Asset Name
                            </label>
                            <input
                                type="text"
                                value={formData.assetName}
                                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                                placeholder="e.g., Downtown Apartment 4B"
                                className="w-full h-[40px] px-4 bg-white/5 border border-white/15 rounded-[8px] text-white text-[14px] placeholder-white/40 focus:border-[#FFD36A] focus:ring-1 focus:ring-[#FFD36A]/30 focus:outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Monthly Income */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[1px]">
                                Monthly Income (USD)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-[14px]"></span>
                                <input
                                    type="number"
                                    value={formData.monthlyIncome || ''}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                                    placeholder="2,500"
                                    className="w-full h-[40px] pl-8 pr-4 bg-white/5 border border-white/15 rounded-[8px] text-white text-[14px] placeholder-white/40 focus:border-[#FFD36A] focus:ring-1 focus:ring-[#FFD36A]/30 focus:outline-none transition-all"
                                    required
                                    min="0"
                                />
                            </div>
                            <p className="text-[11px] text-white/40 italic">Verified monthly income from this asset</p>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-[1px]">
                                Duration (months)
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                placeholder="12"
                                className="w-full h-[40px] px-4 bg-white/5 border border-white/15 rounded-[8px] text-white text-[14px] placeholder-white/40 focus:border-[#FFD36A] focus:ring-1 focus:ring-[#FFD36A]/30 focus:outline-none transition-all"
                                required
                                min="1"
                                max="360"
                            />
                            <p className="text-[11px] text-white/40 italic">Expected income stream duration</p>
                        </div>
                    </div>

                    {/* Calculated Fields */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-[13px]">
                            <span className="text-white/60">Estimated Asset Value</span>
                            <span className="text-white font-medium">
                                ${estimatedValue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                            <span className="text-white/60">Maximum Borrowable (50% LTV)</span>
                            <span className="text-[#00F5A0] font-semibold">
                                ${maxBorrowable.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!formData.assetName || !formData.monthlyIncome}
                        className="w-full h-[44px] rounded-[10px] text-black font-bold text-[14px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,211,106,0.3)] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(90deg, #FFD36A, #E6B84F)'
                        }}
                    >
                        Submit for Review
                    </button>
                </form>
            </div>
        </div>
    );
}
