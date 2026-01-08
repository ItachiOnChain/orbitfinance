import { OrbitHero } from "../../components/ui/OrbitHero";
import { FeatureSections } from "../../components/ui/FeatureSections";
import { ProductExplanation } from "../../components/landing/ProductExplanation";

export default function CryptoHome() {
    return (
        <div className="flex flex-col">
            <OrbitHero />
            <FeatureSections />
            <ProductExplanation />
        </div>
    );
}
