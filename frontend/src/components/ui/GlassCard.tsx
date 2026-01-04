import type { ReactNode } from 'react';

interface GlassCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export function GlassCard({ icon, title, description }: GlassCardProps) {
    return (
        <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-black/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="mb-6 inline-flex p-3 rounded-xl bg-gold/10 text-gold group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>

                <h3 className="text-xl font-light tracking-wide text-white mb-3 group-hover:text-gold transition-colors duration-300">
                    {title}
                </h3>

                <p className="text-zinc-400 font-light tracking-wide leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                    {description}
                </p>
            </div>
        </div>
    );
}
