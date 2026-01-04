import React from 'react';
import { ArrowUp, ArrowDown, RefreshCcw, ChevronRight } from 'lucide-react';

export const FeatureSections: React.FC = () => {
  return (
    <div className="bg-dark-bg font-sans">
      {/* Completely Flexible Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Interactive Graphic */}
          <div className="relative flex justify-center items-center h-[500px]">
            {/* Background Lines */}
            <div className="absolute w-full h-px bg-zinc-800/50 top-1/2 left-0 -translate-y-1/2" />
            <div className="absolute w-px h-full bg-zinc-800/50 left-1/2 top-0 -translate-x-1/2" />
            
            {/* Vertical Stack */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* Top Liquidate (Faded) */}
              <div className="px-8 py-3 rounded-lg border border-zinc-800 bg-zinc-900/40 opacity-20 flex items-center gap-3 min-w-[180px]">
                <RefreshCcw size={16} className="text-zinc-500" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Liquidate</span>
              </div>

              {/* Repay */}
              <div className="px-8 py-3 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center gap-3 min-w-[180px] shadow-xl">
                <div className="flex flex-col -space-y-1">
                  <ArrowUp size={14} className="text-zinc-400" />
                  <ArrowDown size={14} className="text-zinc-400" />
                </div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Repay</span>
              </div>

              {/* Borrow (Highlighted) */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-emerald-500/20 blur-xl rounded-lg opacity-100" />
                <div className="relative px-10 py-4 rounded-lg border border-emerald-500/50 bg-zinc-900 flex items-center gap-4 min-w-[200px] shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="flex flex-col -space-y-1">
                    <ArrowUp size={16} className="text-emerald-400" />
                    <ArrowDown size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-[13px] font-bold tracking-[0.3em] text-white uppercase">Borrow</span>
                </div>
                {/* Horizontal Connection Lines */}
                <div className="absolute top-1/2 -left-20 w-20 h-px bg-emerald-500/30" />
                <div className="absolute top-1/2 -right-20 w-20 h-px bg-emerald-500/30" />
              </div>

              {/* Liquidate */}
              <div className="px-8 py-3 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center gap-3 min-w-[180px] shadow-xl">
                <RefreshCcw size={16} className="text-zinc-400" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Liquidate</span>
              </div>

              {/* Bottom Borrow (Faded) */}
              <div className="px-8 py-3 rounded-lg border border-zinc-800 bg-zinc-900/40 opacity-20 flex items-center gap-3 min-w-[180px]">
                <div className="flex flex-col -space-y-1">
                  <ArrowUp size={14} className="text-zinc-500" />
                  <ArrowDown size={14} className="text-zinc-500" />
                </div>
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Borrow</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="text-left lg:pl-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 font-outfit">
              Completely Flexible
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              Orbit gives you full control of your finances with no hidden fees. 
              Repay on your terms, keep your assets working for you, and borrow 
              against your collateral to secure future yield.
            </p>
            <button className="px-10 py-4 border border-gold/30 rounded-lg text-gold text-[12px] font-bold tracking-[0.3em] uppercase hover:bg-gold/5 transition-all flex items-center gap-2 group">
              Explore our vaults
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Zero Liquidations Section */}
      <section className="py-32 px-6 relative overflow-hidden bg-zinc-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <div className="order-2 lg:order-1 text-left lg:pr-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 font-outfit">
              Zero Liquidations
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              With Orbit, market volatility won't touch your vault. Your debt is 
              securely tied to your collateral, ensuring that price swings never 
              put you at risk.
            </p>
            <button className="px-10 py-4 border border-gold/30 rounded-lg text-gold text-[12px] font-bold tracking-[0.3em] uppercase hover:bg-gold/5 transition-all flex items-center gap-2 group">
              Orbit Benefits
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right: Graphic */}
          <div className="order-1 lg:order-2 relative flex justify-center items-center h-[400px]">
            {/* Visualizer Bars (Background) */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-30">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-emerald-500/50 rounded-full"
                  style={{ 
                    height: `${20 + Math.random() * 60}%`,
                    animation: `pulse ${2 + Math.random() * 2}s infinite ease-in-out`
                  }}
                />
              ))}
            </div>

            {/* Cards Container */}
            <div className="relative flex items-center gap-8 z-10">
              {/* ETH Card */}
              <div className="w-32 h-32 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all" />
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                    <div className="w-6 h-8 bg-white/90 clip-path-eth" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  </div>
                </div>
              </div>

              {/* Connection */}
              <div className="flex items-center -space-x-1">
                <div className="w-4 h-4 rounded-full border border-zinc-700" />
                <div className="w-8 h-px bg-zinc-700" />
                <div className="w-4 h-4 rounded-full border border-zinc-700" />
              </div>

              {/* Bronze ETH Card */}
              <div className="w-32 h-32 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl relative group">
                <div className="absolute inset-0 bg-gold/5 blur-xl group-hover:bg-gold/10 transition-all" />
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-gold/40 rounded-full flex items-center justify-center">
                    <div className="w-6 h-8 bg-gold/60 clip-path-eth" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security First Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <div className="text-left lg:pr-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 font-outfit">
              Security First
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              We are the original battle-tested DeFi platform with a priority of 
              asset protection. As a pioneer in DeFi, we ensure your assets 
              are preserved at every step.
            </p>
            <button className="px-10 py-4 border border-gold/30 rounded-lg text-gold text-[12px] font-bold tracking-[0.3em] uppercase hover:bg-gold/5 transition-all flex items-center gap-2 group">
              Explore our audits
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right: Graphic */}
          <div className="relative flex justify-center items-center h-[400px]">
            {/* Central Logo */}
            <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center relative z-10 bg-dark-bg">
              <div className="w-16 h-16 border border-gold/50 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold/60 rotate-45 flex items-center justify-center">
                  <div className="w-6 h-6 border border-gold/80" />
                </div>
              </div>
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ transform: 'scale(4)' }}>
                <line x1="50%" y1="50%" x2="100%" y2="0%" stroke="currentColor" strokeWidth="0.1" strokeDasharray="0.5" className="text-zinc-800" />
                <line x1="50%" y1="50%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="0.1" strokeDasharray="0.5" className="text-zinc-800" />
                <line x1="50%" y1="50%" x2="0%" y2="50%" stroke="currentColor" strokeWidth="0.1" strokeDasharray="0.5" className="text-zinc-800" />
              </svg>
            </div>

            {/* Audit Badges */}
            <div className="absolute top-10 right-0 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-2 shadow-2xl">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">Runtime Verification</span>
            </div>
            <div className="absolute bottom-10 right-0 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-2 shadow-2xl">
              <div className="w-4 h-4 rounded-full bg-purple-500" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">code4rena</span>
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-2 shadow-2xl">
              <div className="w-4 h-4 rounded-full bg-zinc-700" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">Immunefi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Your Favorite Tokens Section */}
      <section className="py-32 px-6 relative overflow-hidden bg-zinc-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Token Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'WETH', color: 'bg-blue-500/20' },
              { name: 'DAI', color: 'bg-yellow-500/20' },
              { name: 'USDC', color: 'bg-blue-600/20' },
              { name: 'USDT', color: 'bg-emerald-500/20' },
              { name: 'rETH', color: 'bg-red-500/20' },
              { name: 'stETH', color: 'bg-sky-400/20' },
              { name: 'ETH', color: 'bg-zinc-500/20' },
            ].map((token, i) => (
              <div 
                key={i} 
                className={`aspect-square rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center gap-3 group hover:border-gold/30 transition-all hover:scale-105 ${i >= 4 ? 'translate-x-1/2' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full ${token.color} flex items-center justify-center shadow-inner`}>
                  <div className="w-6 h-6 border-2 border-white/20 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase group-hover:text-white transition-colors">
                  {token.name}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Content */}
          <div className="text-left lg:pl-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 font-outfit">
              Your Favorite Tokens
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              Borrow up to 50% of your collateral, whilst earning yield on your full stack.
            </p>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 font-outfit">
            Get started with Orbit
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            Orbit's self-repaying loans automatically pay themselves off using the interest earned 
            on your initial deposit. Borrow against your assets, earn yield on the full deposit amount, 
            and enjoy the ability to spend and save at the same time.
          </p>
          
          <button className="px-12 py-5 border border-emerald-500/40 rounded-xl text-emerald-400 text-[14px] font-bold tracking-[0.3em] uppercase hover:bg-emerald-500/5 transition-all mb-24 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            Get your Self-Repaying Loan
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Deposit',
                desc: 'Deposit any asset from our list of collateral into a vault.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
                    <div className="absolute inset-4 rounded-full border border-gold/30" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  </div>
                )
              },
              {
                num: '2',
                title: 'Automatically',
                desc: 'Earn interest on your full deposit, while your loan pays itself off.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
                    <div className="absolute inset-4 rounded-full border border-emerald-500/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-emerald-500/60" />
                  </div>
                )
              },
              {
                num: '3',
                title: 'Access',
                desc: 'Your future yield, now. Borrow up to 50% on your collateral.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
                    <div className="absolute inset-4 rounded-full border border-emerald-500/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.8)]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-emerald-500/60" />
                  </div>
                )
              }
            ].map((step, i) => (
              <div key={i} className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-emerald-500/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-6xl font-bold text-white/10 group-hover:text-white/20 transition-colors font-outfit">
                    {step.num}
                  </span>
                </div>
                {step.graphic}
                <h3 className="text-2xl font-bold text-white mb-4 font-outfit">
                  {step.title}
                </h3>
                <p className="text-zinc-500 font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(1.5); opacity: 0.6; }
        }
      `}} />
    </div>
  );
};
