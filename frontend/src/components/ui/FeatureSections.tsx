import React from 'react';

export const FeatureSections: React.FC = () => {
  return (
    <div className="w-full bg-dark-bg flex flex-col">
      {/* Completely Flexible Section - Dark Background */}
      <section className="py-32 px-6 md:px-12 lg:px-20 relative bg-dark-bg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center lg:pl-28">
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
            <a 
              href="/docs" 
              className="group relative z-10 inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border-0 px-10 py-4 font-outfit text-[12px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70"
              style={{ transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <span className="relative z-10">Learn More</span>
            </a>
          </div>
        </div>
      </section>



      {/* Zero Liquidations Section - Higher Contrast Background */}
      <section className="py-32 px-6 md:px-12 lg:px-20 relative bg-zinc-900/40 border-y border-zinc-800/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center lg:pl-28">
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



      {/* Security First Section - Dark Background */}
            {/* ================= Security First ================= */}
      <section className="py-32 px-6 md:px-12 lg:px-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center lg:pl-[clamp(4rem,8vw,10rem)]">
          
          {/* Content */}
          <div className="text-left lg:pr-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-outfit">
              Security First
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-xl">
              Battle-tested DeFi with audited smart contracts and runtime verification.
            </p>
          </div>

          {/* Diagram */}
          <div className="relative flex justify-center items-center h-[420px] perspective-[1200px]">

            {/* Linking Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
              <line x1="200" y1="200" x2="340" y2="80" stroke="rgba(212,175,55,0.25)" />
              <line x1="200" y1="200" x2="340" y2="320" stroke="rgba(212,175,55,0.25)" />
              <line x1="200" y1="200" x2="60" y2="200" stroke="rgba(113,113,122,0.4)" />
            </svg>

            {/* Core */}
            <div className="relative z-10 transform-gpu transition-transform duration-700 hover:rotate-x-6 hover:-rotate-y-6">
              <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center bg-dark-bg">
                <div className="w-16 h-16 border border-gold/50 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-gold/60 rotate-45 flex items-center justify-center">
                    <div className="w-6 h-6 border border-gold/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Nodes */}
            <div className="absolute top-10 right-4 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 shadow-xl">
              <span className="text-[10px] font-bold text-white tracking-wider">Runtime Verification</span>
            </div>
            <div className="absolute bottom-10 right-4 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 shadow-xl">
              <span className="text-[10px] font-bold text-white tracking-wider">code4rena</span>
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded bg-zinc-900 border border-zinc-800 shadow-xl">
              <span className="text-[10px] font-bold text-white tracking-wider">Immunefi</span>
            </div>
          </div>
        </div>
      </section>

   



      {/* Your Favorite Tokens Section - Higher Contrast Background */}
      <section className="py-32 px-6 md:px-12 lg:px-20 relative bg-zinc-900/40 border-y border-zinc-800/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center lg:pl-28">
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
      <br/>
      <br/>
      <br/>

      {/* Dividing Line with LOTS of Extra Space */}
      <div className="py-48 bg-dark-bg">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      {/* Get Started Section - Premium Redesign & Alignment */}
      <section className="py-40 px-6 md:px-12 lg:px-20 relative bg-dark-bg overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 lg:pl-28">
          {/* Hero Block */}
          <div className="flex flex-col items-center text-center mb-32">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gold mb-10 font-outfit">
              Get started with Orbit
            </h2>
            <br/>
            <br/>
            <p className="max-w-2xl text-center text-lg md:text-xl font-light leading-relaxed text-zinc-400 mb-16 mx-auto">
              Orbit's self-repaying loans automatically pay themselves off using the interest earned 
              on your initial deposit. Borrow against your assets and earn yield simultaneously.
            </p>
            <br/>
            
            <a 
              href="/vaults" 
              className="group relative z-10 inline-flex h-16 cursor-pointer items-center justify-center rounded-xl border-0 px-14 py-6 font-outfit text-[13px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70"
              style={{ transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <span className="relative z-10">Get your Self-Repaying Loan</span>
            </a>
          </div>
          <br/>

          {/* Three Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                num: '01',
                title: 'Deposit',
                desc: 'Deposit any supported asset from our list of collateral into a secure vault.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-10">
                    <div className="absolute inset-0 rounded-full border border-gold/10" />
                    <div className="absolute inset-4 rounded-full border border-gold/20" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                  </div>
                )
              },
              {
                num: '02',
                title: 'Automatically',
                desc: 'Earn yield on your full deposit, while your loan automatically pays itself off.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-10">
                    <div className="absolute inset-0 rounded-full border border-gold/10" />
                    <div className="absolute inset-4 rounded-full border border-gold/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-gold/40" />
                  </div>
                )
              },
              {
                num: '03',
                title: 'Access',
                desc: 'Access your future yield today. Borrow up to 50% of your collateral instantly.',
                graphic: (
                  <div className="relative w-24 h-24 mx-auto mb-10">
                    <div className="absolute inset-0 rounded-full border border-gold/10" />
                    <div className="absolute inset-4 rounded-full border border-gold/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gold shadow-[0_0_25px_rgba(212,175,55,0.6)]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-gold/40" />
                  </div>
                )
              }
            ].map((step, i) => (
              <div key={i} className="relative py-16 px-10 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800/50 hover:border-gold/30 transition-all duration-700 group text-center overflow-hidden flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.3)] hover:shadow-[0_0_80px_rgba(212,175,55,0.1)]">
                <div className="relative z-10 flex flex-col items-center">
                  {step.graphic}
                  <h3 className="text-2xl font-bold text-white mb-4 font-outfit tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 font-light leading-relaxed text-base max-w-[240px] mx-auto">
                    {step.desc}
                  </p>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Space After Get Started */}
      <div className="h-48 bg-dark-bg" />

      {/* Dividing Line */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Stats Section */}
      

      {/* Dividing Line */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Partners / As Seen In Section */}
     

      {/* Dividing Line */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Community Section */}
      

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(1.5); opacity: 0.6; }
        }
      `}} />
    </div>
  );
};