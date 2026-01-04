import { OrbitHero } from "../components/ui/OrbitHero";
import { GlassCard } from "../components/ui/GlassCard";
import { AssetCard } from "../components/ui/AssetCard";
import { Footer } from "../components/ui/Footer";
import { Vault, Coins, TrendingUp, Wallet, Bitcoin, DollarSign, Banknote } from "lucide-react";

export default function LandingPage() {
    const handleConnectWallet = () => {
        console.log("Connect wallet clicked");
    };

    return (
        <div className="bg-[#0A0A0A]">
            <OrbitHero onConnectWallet={handleConnectWallet} />

            <section className="py-32 px-6 relative z-10 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white text-center mb-16">
                        How It Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <GlassCard
                            icon={<Vault className="w-6 h-6" />}
                            title="Deposit Collateral"
                            description="Lock your crypto assets into yield-generating vaults. Your assets work for you while serving as collateral."
                        />
                        <GlassCard
                            icon={<Coins className="w-6 h-6" />}
                            title="Borrow Synthetic Tokens"
                            description="Mint orUSD or orETH up to 50% of your collateral value. Access liquidity without selling your assets."
                        />
                        <GlassCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            title="Debt Auto-Repays"
                            description="Yield from your deposits automatically reduces your debt over time. Watch your loan pay itself off."
                        />
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 relative z-10 bg-[#141825]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white text-center mb-16">
                        Supported Assets
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AssetCard
                            icon={<Wallet className="w-6 h-6" />}
                            name="WETH"
                            apy="5.2% APY"
                            ltv="50% LTV"
                        />
                        <AssetCard
                            icon={<Bitcoin className="w-6 h-6" />}
                            name="WBTC"
                            apy="4.8% APY"
                            ltv="50% LTV"
                        />
                        <AssetCard
                            icon={<DollarSign className="w-6 h-6" />}
                            name="USDC"
                            apy="8.5% APY"
                            ltv="75% LTV"
                        />
                        <AssetCard
                            icon={<Banknote className="w-6 h-6" />}
                            name="DAI"
                            apy="7.2% APY"
                            ltv="75% LTV"
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
