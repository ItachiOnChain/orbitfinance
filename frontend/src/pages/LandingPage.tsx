import { OrbitHero } from "../components/ui/OrbitHero";
import { FeatureSections } from "../components/ui/FeatureSections";

export default function LandingPage() {
    return (
        <div className="bg-dark-bg">
            <OrbitHero />
            <FeatureSections />
        </div>
    );
}

