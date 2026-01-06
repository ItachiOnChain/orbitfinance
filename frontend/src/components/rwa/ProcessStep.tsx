interface ProcessStepProps {
    stepNumber: number;
    title: string;
    description: string;
    icon: string;
    isLast?: boolean;
}

export function ProcessStep({ stepNumber, title, description, icon, isLast = false }: ProcessStepProps) {
    return (
        <div className="flex-1 relative">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 hover:border-gold/30 transition-all duration-300">
                {/* Step Number Badge */}
                <div className="w-12 h-12 rounded-full bg-[#00D4FF]/10 border-2 border-[#00D4FF] flex items-center justify-center mb-4">
                    <span className="text-[#00D4FF] font-bold text-lg">{stepNumber}</span>
                </div>

                {/* Icon */}
                <div className="text-5xl mb-4">{icon}</div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>

                {/* Description */}
                <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
            </div>

            {/* Connecting Arrow */}
            {!isLast && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path
                            d="M8 16H24M24 16L18 10M24 16L18 22"
                            stroke="#FFB800"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}
