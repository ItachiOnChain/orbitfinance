import React, { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { Footer } from "../components/ui/Footer";
import { Scene, BackgroundStars } from "../components/3d/Scene";
import {
  ArrowRight, ChevronRight, ShieldCheck,
  Activity, Terminal, Palette, Gamepad2, Lightbulb
} from 'lucide-react';

/* ================= UTIL ================= */
const Spacer = () => <div className="h-32 md:h-44" />;

/* ================= SCROLL REVEAL ================= */
const Reveal = ({ children, delay = 0 }: any) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ================= FLOW ================= */
const Flow = () => {
  const steps = ["COLLATERAL", "YIELD", "REPAY"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(v => (v + 1) % steps.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-4 justify-center lg:justify-start">
      {steps.map((s, i) => (
        <span
          key={s}
          className={`text-[11px] font-mono tracking-[0.25em] transition-all
            ${i === active ? "text-gold" : "text-white/30"}`}
        >
          {s}
        </span>
      ))}
    </div>
  );
};

/* ================= SECTIONS ================= */
const Section = ({ label, title, subtitle, children }: any) => (
  <section className="relative z-10">
    <div className="max-w-7xl mx-auto px-6">
      <Reveal>
        <div className="text-center mb-20">
          <p className="text-[11px] tracking-[0.35em] text-gold mb-6 font-bold uppercase">
            {label}
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15] uppercase">
            {title}
            {subtitle && <span className="block text-white/40 mt-3">{subtitle}</span>}
          </h2>
        </div>
      </Reveal>
      {children}
    </div>
  </section>
);

/* ================= MAIN ================= */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

      {/* GLOBAL STARS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Canvas>
          <Suspense fallback={null}>
            <BackgroundStars />
          </Suspense>
        </Canvas>
      </div>

      <LandingNavbar />

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center translate-x-7 translate-y-7">
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Scene />
              <EffectComposer>
                <Bloom intensity={1.2} />
                <Noise opacity={0.025} />
                <Vignette darkness={1.1} />
              </EffectComposer>
            </Suspense>
          </Canvas>
        </div>

        {/* softer overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 text-center lg:text-left">
            <Reveal><Flow /></Reveal>

            <Reveal delay={0.1}>
              <h1 className="mt-10 text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] uppercase">
                Borrow Against<br />
                Your Future<br />
                <span className="text-gold">Yield</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg text-white/80 translate-x-5 translate-y-7">
                A self-repaying lending protocol powered by institutional-grade RWA infrastructure.
              </p>
            </Reveal>
            <br />
            <br />

            <Reveal delay={0.3}>
              <div className="mt-10 flex gap-6 justify-center lg:justify-start translate-x-3 translate-y-3">
                <button
                  onClick={() => navigate(isConnected ? "/app/crypto" : "/")}
                  className="px-8 py-4 bg-gold text-black font-bold rounded-xl uppercase tracking-widest text-xs flex items-center gap-2"
                >
                  {isConnected ? "Launch Protocol" : "Connect Wallet"}
                  <ArrowRight size={16} />
                </button>
                <button className="px-8 py-4 border border-white/20 rounded-xl text-xs uppercase tracking-widest">
                  Docs <ChevronRight size={14} />
                </button>
              </div>
            </Reveal>
          </div>

          <div className="hidden lg:block lg:col-span-7" />
        </div>
      </section>

      <Spacer />

      {/* ================= EXPLANATION ================= */}
      <Section
        label="WHAT IS ORBIT"
        title="A new primitive for"
        subtitle="decentralized credit"
        
      >
        <Reveal>
          <p className="max-w-3xl mx-auto text-lg text-white/70 leading-relaxed text-center translate-x-85 translate-y-7">
            Deposit assets, borrow against them, and let your yields repay your debt automatically.
            No liquidations. No manual repayments.
          </p>
        </Reveal>
      </Section>

      <Spacer />

      {/* ================= HOW IT WORKS ================= */}
      <Section
        label="HOW IT WORKS"
        title="Self-Repaying Credit"
        subtitle="In Three Steps"
      >
        <div className="grid md:grid-cols-3 gap-10 translate-x-20 translate-y-7">
          {["Deposit Collateral", "Generate Yield", "Automatic Repayment"].map((t, i) => (
            <Reveal key={t} delay={i * 0.15}>
              <div className="p-10 rounded-3xl border border-white/10 bg-white/5">
                <div className="text-gold/30 text-6xl font-bold mb-6">{`0${i + 1}`}</div>
                <h3 className="font-bold uppercase mb-4">{t}</h3>
                <p className="text-white/60">
                  Institutional-grade automation from start to finish.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Spacer />

      {/* ================= ECOSYSTEM ================= */}
      <Section
        label="ECOSYSTEM"
        title="Built for everyone"
        subtitle="who values their assets"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 translate-x-10">
          {[ShieldCheck, Palette, Activity, Terminal, Lightbulb, Gamepad2].map((Icon, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <Icon className="text-gold/40 mb-6" />
                <h4 className="font-bold uppercase mb-2">Use Case</h4>
                <p className="text-white/50">Capital efficiency unlocked.</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Spacer />

      {/* ================= CTA ================= */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="p-20 rounded-[2.5rem] bg-white/5 border border-white/10 text-center translate-x-50">
              <h2 className="text-4xl font-black mb-6">
                Ready to unlock <span className="text-gold">capital efficiency?</span>
              </h2>
              <button
                onClick={() => navigate(isConnected ? "/app/crypto" : "/")}
                className="mt-10 px-10 py-5 bg-gold text-black font-bold rounded-xl uppercase tracking-widest"
              >
                Launch Protocol
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Spacer />
      <Footer />
    </div>
  );
}
