import { NavLink } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Home, FileText, TrendingUp, Briefcase, Settings, Shield, Lock } from 'lucide-react';
import { isAdmin } from '../../utils/rwa/adminCheck';
import { useKYCStatus } from '../../hooks/rwa/useKYC';

export function RWASidebar() {
    const { isConnected, address } = useAccount();
    const { data: isVerified } = useKYCStatus();
    const showAdminLink = isAdmin(address);

    return (
        <aside className="w-80 h-[calc(100vh-5rem)] bg-dark-sidebar border-r border-zinc-900/50 flex flex-col sticky top-20 overflow-y-auto">
            <div className="flex-1 p-8 space-y-2">
                <NavLink
                    to="/app"
                    end
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-gold/10 text-gold border border-gold/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                        }`
                    }
                >
                    <Home size={20} className="flex-shrink-0" />
                    <span className="font-medium text-sm tracking-wide">Home</span>
                </NavLink>

                <NavLink
                    to="/app/kyc"
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-gold/10 text-gold border border-gold/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                        }`
                    }
                >
                    <Shield size={20} className="flex-shrink-0" />
                    <span className="font-medium text-sm tracking-wide">KYC</span>
                    {isVerified && <span className="ml-auto text-xs text-green-400">✓</span>}
                </NavLink>

                <NavLink
                    to="/app/origination"
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-gold/10 text-gold border border-gold/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                        } ${!isVerified ? 'opacity-50' : ''}`
                    }
                    onClick={(e) => {
                        if (!isVerified) {
                            e.preventDefault();
                        }
                    }}
                >
                    <FileText size={20} className="flex-shrink-0" />
                    <span className="font-medium text-sm tracking-wide">Asset Origination</span>
                    {!isVerified && <Lock size={14} className="ml-auto text-zinc-600" />}
                </NavLink>

                <NavLink
                    to="/app/markets"
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-gold/10 text-gold border border-gold/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                        } ${!isVerified ? 'opacity-50' : ''}`
                    }
                    onClick={(e) => {
                        if (!isVerified) {
                            e.preventDefault();
                        }
                    }}
                >
                    <TrendingUp size={20} className="flex-shrink-0" />
                    <span className="font-medium text-sm tracking-wide">Capital Markets</span>
                    {!isVerified && <Lock size={14} className="ml-auto text-zinc-600" />}
                </NavLink>

                <NavLink
                    to="/app/portfolio"
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-gold/10 text-gold border border-gold/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                        } ${!isVerified ? 'opacity-50' : ''}`
                    }
                    onClick={(e) => {
                        if (!isVerified) {
                            e.preventDefault();
                        }
                    }}
                >
                    <Briefcase size={20} className="flex-shrink-0" />
                    <span className="font-medium text-sm tracking-wide">My Portfolio</span>
                    {!isVerified && <Lock size={14} className="ml-auto text-zinc-600" />}
                </NavLink>

                {/* Admin Only - SPV Simulator */}
                {showAdminLink && (
                    <NavLink
                        to="/app/admin/spv"
                        className={({ isActive }) =>
                            `group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                            }`
                        }
                    >
                        <Settings size={20} className="flex-shrink-0" />
                        <span className="font-medium text-sm tracking-wide">SPV Simulator</span>
                    </NavLink>
                )}
            </div>

            {/* Status Footer */}
            <div className="p-6 border-t border-zinc-900/50">
                <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Network</span>
                        <span className="text-zinc-400 font-mono">Anvil</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Mode</span>
                        <span className="text-gold font-semibold">RWA</span>
                    </div>
                    {isConnected && (
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Status</span>
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Connected
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
