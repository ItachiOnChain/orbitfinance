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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0A2342] border border-zinc-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Tokenize New Asset</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Asset Type */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-3">Asset Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['RENTAL', 'INVOICE', 'BOND', 'OTHER'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assetType: type })}
                                    className={`px-4 py-3 rounded-lg border transition-all ${formData.assetType === type
                                            ? 'bg-gold/10 border-gold text-gold'
                                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                        }`}
                                >
                                    {type.charAt(0) + type.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Asset Name */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">Asset Name</label>
                        <input
                            type="text"
                            value={formData.assetName}
                            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                            placeholder="e.g., Downtown Apartment 4B"
                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-gold focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Monthly Income */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">Monthly Income (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                            <input
                                type="number"
                                value={formData.monthlyIncome || ''}
                                onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                                placeholder="2,500"
                                className="w-full pl-8 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-gold focus:outline-none transition-colors"
                                required
                                min="0"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Verified monthly income from this asset</p>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2">Duration (months)</label>
                        <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:border-gold focus:outline-none transition-colors"
                            required
                            min="1"
                            max="360"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Expected income stream duration</p>
                    </div>

                    {/* Calculations */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Estimated Asset Value</span>
                            <span className="text-white font-mono font-semibold">
                                ${estimatedValue.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Maximum Borrowable (50% LTV)</span>
                            <span className="text-[#00F5A0] font-mono font-semibold">
                                ${maxBorrowable.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!formData.assetName || !formData.monthlyIncome}
                        className="w-full py-4 bg-gold hover:bg-gold/90 text-[#0A2342] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit for Review
                    </button>
                </form>
            </div>
        </div>
    );
}
