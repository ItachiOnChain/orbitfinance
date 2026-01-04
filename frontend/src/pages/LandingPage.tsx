import { OrbitHero } from "../components/ui/OrbitHero";
import { FeatureSections } from "../components/ui/FeatureSections";
import { Footer } from "../components/ui/Footer";

export default function LandingPage() {
    return (
        <div className="bg-dark-bg">
            <OrbitHero />
            <FeatureSections />
            <Footer />
        </div>
    );
}

