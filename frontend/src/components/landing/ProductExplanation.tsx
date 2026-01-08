import React from 'react';
import { Zap, Globe } from 'lucide-react';

export const ProductExplanation: React.FC = () => {
  return (
    <section className="py-40 px-6 md:px-12 lg:px-20 bg-dark-bg relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10 lg:pl-28">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 font-outfit">
            Two Worlds, <span className="text-gold">One Orbit</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
            Orbit Finance bridges the gap between decentralized finance and real-world assets, 
            providing a comprehensive ecosystem for capital efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Crypto Module Card */}
          <div className="group p-12 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800/50 hover:border-gold/30 transition-all duration-700 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Zap className="text-gold" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 font-outfit tracking-tight">Crypto Module</h3>
              <p className="text-zinc-400 font-light leading-relaxed text-lg mb-10">
                The core of Orbit's DeFi engine. Deposit your crypto assets into high-yield vaults 
                and borrow against them with zero liquidation risk. Your debt is automatically 
                repaid by the yield your collateral generates.
              </p>
              <ul className="space-y-4">
                {[
                  'Self-Repaying Loans',
                  'Zero Liquidation Risk',
                  'High-Yield Strategy Vaults',
                  'Instant Liquidity Access'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/5 blur-[40px] group-hover:bg-gold/10 transition-colors duration-700" />
          </div>

          {/* RWA Module Card */}
          <div className="group p-12 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800/50 hover:border-gold/30 transition-all duration-700 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Globe className="text-gold" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 font-outfit tracking-tight">RWA Module</h3>
              <p className="text-zinc-400 font-light leading-relaxed text-lg mb-10">
                Bringing institutional-grade real-world assets on-chain. Orbit enables the 
                tokenization and financing of real-world credit, providing sustainable, 
                non-crypto correlated yield for investors and liquidity for asset originators.
              </p>
              <ul className="space-y-4">
                {[
                  'Institutional Asset Tokenization',
                  'Regulated Compliance Framework',
                  'Real-World Yield Generation',
                  'Transparent On-Chain Audits'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/5 blur-[40px] group-hover:bg-gold/10 transition-colors duration-700" />
          </div>
        </div>
      </div>
    </section>
  );
};
