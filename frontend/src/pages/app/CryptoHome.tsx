import { OrbitHero } from "../../components/ui/OrbitHero";
import { FeatureSections } from "../../components/ui/FeatureSections";

export default function CryptoHome() {
    return (
        <div className="flex flex-col">
            <OrbitHero />
            <FeatureSections />
        </div>
    );
}
