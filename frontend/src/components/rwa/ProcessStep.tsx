interface ProcessStepProps {
    stepNumber: number;
    title: string;
    description: string;
    isLast?: boolean;
    index: number;
}

export function ProcessStep({ stepNumber, title, description, index }: ProcessStepProps) {
    const isEven = index % 2 === 0;

    return (
        <div className={`flex items-center w-full mb-24 lg:mb-32 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
            {/* Content Card */}
            <div className={`w-full lg:w-[45%] group`}>
                <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:from-gold/50 group-hover:to-zinc-800 transition-all duration-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(212,175,55,0.25)] group-hover:-translate-y-4">
                    <div className="relative rounded-[23px] bg-zinc-950/90 backdrop-blur-xl p-12 min-h-[320px] flex flex-col justify-center">
                        {/* Step Number Badge */}
                        <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-500">
                            <span className="text-gold font-bold text-xl font-outfit">{stepNumber}</span>
                        </div>
                        <br />

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-white mb-6 font-outfit group-hover:text-gold transition-colors duration-300 tracking-tight">{title}</h3>
                         <br />
                        {/* Description */}
                        <p className="text-zinc-400 text-base leading-relaxed font-light flex-1">{description}</p>
                        
                        {/* Subtle Glow Effect */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/5 blur-[60px] rounded-full group-hover:bg-gold/10 transition-all duration-700" />
                    </div>
                </div>
                
                {/* Step Depicting Animation Below Card */}
                <div className="mt-6 flex justify-center lg:justify-start px-4">
                    <div className="flex gap-1.5 items-center">
                        {[...Array(3)].map((_, i) => (
                            <div 
                                key={i}
                                className="w-2 h-2 rounded-full bg-gold/20 animate-pulse"
                                style={{ animationDelay: `${i * 200}ms` }}
                            />
                        ))}
                        <div className="h-[1px] w-12 bg-gradient-to-r from-gold/40 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Central Point */}
            <div className="hidden lg:flex w-[10%] justify-center relative z-20">
                <div className="w-5 h-5 rounded-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.8)] border-4 border-zinc-950 group-hover:scale-125 transition-transform duration-500" />
            </div>

            {/* Spacer for alternating layout */}
            <div className="hidden lg:block w-[45%]" />
        </div>
    );
}
