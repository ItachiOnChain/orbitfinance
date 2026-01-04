import React from 'react';
import { ChevronRight, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';

export const FeatureSections: React.FC = () => {
  return (
    <div className="w-full bg-dark-bg">
      {/* Completely Flexible Section */}
      <section className="py-64 px-6 relative overflow-hidden border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Left: Graphic */}
          <div className="relative flex justify-center items-center h-[400px]">
            <div className="flex flex-col gap-6 w-64 relative z-10">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 text-center text-sm font-bold tracking-widest opacity-50">
                LIQUIDATE
              </div>
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 text-center text-sm font-bold tracking-widest opacity-50">
                REPAY
              </div>
              <div className="p-6 rounded-xl border-2 border-gold bg-gold/10 text-gold text-center text-lg font-black tracking-[0.2em] shadow-[0_0_40px_rgba(212,175,55,0.2)] relative">
                BORROW
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-[2px] bg-gold/30" />
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute w-80 h-80 bg-gold/5 rounded-full blur-[100px]" />
          </div>

          {/* Right: Content */}
          <div className="text-left lg:pl-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 font-outfit">
              Completely Flexible
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              Orbit gives you the freedom to manage your loans on your terms. 
              No fixed schedules, no forced liquidations. Just pure DeFi 
              flexibility at your fingertips.
            </p>
            <button className="px-10 py-4 bg-gold/10 text-gold border border-gold/40 rounded-lg text-[12px] font-bold tracking-[0.3em] uppercase hover:bg-gold/20 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Zero Liquidations Section */}
      <section className="py-64 px-6 relative overflow-hidden border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Left: Content */}
          <div className="text-left lg:pr-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 font-outfit">
              Zero Liquidations
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              Sleep easy knowing your collateral is safe. Our unique 
              self-repaying mechanism ensures that your debt decreases 
              over time, eliminating the risk of liquidation.
            </p>
          </div>

          {/* Right: Graphic */}
          <div className="relative flex justify-center items-center h-[400px]">
            <div className="relative w-full max-w-md">
              {/* Visualizer Bars */}
              <div className="flex items-end justify-center gap-2 h-48 mb-8">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-3 bg-gold/40 rounded-t-sm animate-pulse"
                    style={{ 
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              {/* Asset Cards */}
              <div className="flex justify-center gap-4">
                <div className="w-24 h-32 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-col items-center justify-center gap-2 shadow-2xl">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gold/60 rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 tracking-widest">ETH</span>
                </div>
                <div className="w-24 h-32 rounded-xl border border-gold/30 bg-zinc-900/80 flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.1)] -translate-y-4">
                  <div className="w-10 h-10 rounded-full bg-gold/30 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gold rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-gold tracking-widest">WETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security First Section */}
      <section className="py-64 px-6 relative overflow-hidden border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
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
            <button className="px-10 py-4 bg-gold/10 text-gold border border-gold/40 rounded-lg text-[12px] font-bold tracking-[0.3em] uppercase hover:bg-gold/20 transition-all">
              Explore our audits
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
              <div className="w-4 h-4 rounded-full bg-gold/60" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">Runtime Verification</span>
            </div>
            <div className="absolute bottom-10 right-0 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-2 shadow-2xl">
              <div className="w-4 h-4 rounded-full bg-gold/40" />
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
      <section className="py-64 px-6 relative overflow-hidden bg-zinc-900/10 border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Left: Token Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'WETH', color: 'bg-gold/10' },
              { name: 'DAI', color: 'bg-gold/15' },
              { name: 'USDC', color: 'bg-gold/10' },
              { name: 'USDT', color: 'bg-gold/20' },
              { name: 'rETH', color: 'bg-gold/10' },
              { name: 'stETH', color: 'bg-gold/15' },
              { name: 'ETH', color: 'bg-gold/20' },
            ].map((token, i) => (
              <div 
                key={i} 
                className={`aspect-square rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center gap-3 group hover:border-gold/30 transition-all hover:scale-105 ${i >= 4 ? 'translate-x-1/2' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full ${token.color} flex items-center justify-center shadow-inner`}>
                  <div className="w-6 h-6 border-2 border-gold/20 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase group-hover:text-gold transition-colors">
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
      <section className="py-80 px-6 relative overflow-hidden border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 font-outfit">
            Get started with Orbit
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            Orbit's self-repaying loans automatically pay themselves off using the interest earned 
            on your initial deposit. Borrow against your assets, earn yield on the full deposit amount, 
            and enjoy the ability to spend and save at the same time.
          </p>
          
          <button className="px-12 py-5 border border-gold/40 rounded-xl text-gold text-[14px] font-bold tracking-[0.3em] uppercase hover:bg-gold/5 transition-all mb-24 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            Get your Self-Repaying Loan
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                num: '1',
                title: 'Deposit',
                desc: 'Deposit any asset from our list of collateral into a vault.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border border-gold/20" />
                    <div className="absolute inset-4 rounded-full border border-gold/30" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                  </div>
                )
              },
              {
                num: '2',
                title: 'Automatically',
                desc: 'Earn interest on your full deposit, while your loan pays itself off.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border border-gold/20" />
                    <div className="absolute inset-4 rounded-full border border-gold/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.6)]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-gold/60" />
                  </div>
                )
              },
              {
                num: '3',
                title: 'Access',
                desc: 'Your future yield, now. Borrow up to 50% on your collateral.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border border-gold/20" />
                    <div className="absolute inset-4 rounded-full border border-gold/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gold shadow-[0_0_25px_rgba(212,175,55,0.8)]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-gold/60" />
                  </div>
                )
              }
            ].map((step, i) => (
              <div key={i} className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-gold/20 transition-all group">
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

      {/* Stats Section */}
      <section className="py-64 px-6 relative overflow-hidden bg-zinc-900/10 border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center">
            <div>
              <p className="text-zinc-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-4">Total Value Locked</p>
              <h3 className="text-5xl md:text-6xl font-bold text-white font-outfit">$1,248,392,105</h3>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-4">Total Loans</p>
              <h3 className="text-5xl md:text-6xl font-bold text-white font-outfit">$482,105,932</h3>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold tracking-[0.4em] uppercase mb-4">Yield Generated</p>
              <h3 className="text-5xl md:text-6xl font-bold text-gold font-outfit">$125,392,105</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Partners / As Seen In Section */}
      <section className="py-48 px-6 border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-zinc-600 text-[10px] font-bold tracking-[0.5em] uppercase mb-16">As seen in</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="text-2xl font-black tracking-tighter text-white">Bloomberg</div>
            <div className="text-2xl font-black tracking-tighter text-white">Forbes</div>
            <div className="text-2xl font-black tracking-tighter text-white">CoinDesk</div>
            <div className="text-2xl font-black tracking-tighter text-white">The Block</div>
            <div className="text-2xl font-black tracking-tighter text-white">TechCrunch</div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-80 px-6 relative overflow-hidden bg-gradient-to-b from-dark-bg to-zinc-900/20">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-12 font-outfit">
            Join the Community
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button className="px-16 py-6 bg-gold text-black rounded-2xl text-[15px] font-bold tracking-[0.2em] uppercase hover:bg-gold/90 transition-all shadow-[0_0_50px_rgba(212,175,55,0.2)]">
              Discord
            </button>
            <button className="px-16 py-6 border border-zinc-700 text-white rounded-2xl text-[15px] font-bold tracking-[0.2em] uppercase hover:bg-white/5 transition-all">
              Twitter
            </button>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
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
