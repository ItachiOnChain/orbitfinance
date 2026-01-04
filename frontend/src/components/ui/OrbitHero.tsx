import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { Stars } from '@react-three/drei';
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from '@react-three/postprocessing';
import { useRef } from "react";
import { Mesh } from "three";
import { useAccount, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

function Shape() {
    const meshRef = useRef<Mesh>(null);
    const innerSphereRef = useRef<Mesh>(null);
    const ringRef = useRef<Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
            meshRef.current.rotation.y = time * 0.2;
        }
        if (innerSphereRef.current) {
            innerSphereRef.current.rotation.x = -time * 0.1;
            innerSphereRef.current.rotation.y = -time * 0.3;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z = time * 0.5;
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.2) * 0.1;
        }
    });

    return (
        <>
            <mesh ref={meshRef}>
                <meshPhysicalMaterial
                    roughness={0.05}
                    metalness={1}
                    clearcoat={1}
                    color="#111111"
                    reflectivity={1}
                />
                <Geometry>
                    <Base>
                        <primitive object={new RoundedBoxGeometry(2.8, 2.8, 2.8, 10, 0.3)} />
                    </Base>
                    <Subtraction>
                        <sphereGeometry args={[1.8, 64, 64]} />
                    </Subtraction>
                </Geometry>
            </mesh>

            <mesh ref={innerSphereRef}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshPhysicalMaterial
                    color="#d4af37"
                    emissive="#d4af37"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.5, 0.02, 16, 100]} />
                <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={2} />
            </mesh>
        </>
    );
}

function Environment() {
    return (
        <>
            <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#d4af37" />
            <directionalLight position={[0, -5, 10]} intensity={0.5} color="#ffffff" />
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={1} color="#d4af37" distance={10} />
        </>
    );
}

function Scene() {
    return (
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 8], fov: 40 }}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment />
            <Shape />
            <EffectComposer multisampling={0}>
                <N8AO halfRes color="black" aoRadius={2} intensity={1} aoSamples={6} denoiseSamples={4} />
                <Bloom kernelSize={3} luminanceThreshold={0.2} luminanceSmoothing={0.4} intensity={0.4} />
                <SMAA />
            </EffectComposer>
        </Canvas>
    );
}

interface OrbitHeroProps {
    onConnectWallet?: () => void;
}

export const OrbitHero: React.FC<OrbitHeroProps> = () => {
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const navigate = useNavigate();

    const handleConnect = () => {
        if (connectors[0]) {
            connect({ connector: connectors[0] });
        }
    };

    const handleLaunchApp = () => {
        navigate('/app');
    };

    return (
        <div className="min-h-[calc(100vh-128px)] w-full relative bg-dark-bg overflow-hidden">
            {/* Background Scene */}
            <div className="absolute inset-0 w-full h-full opacity-40">
                <Scene />
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-center px-6 max-w-5xl mx-auto">
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-normal mb-8 leading-tight text-bronze-gradient bronze-drop-shadow font-outfit">
                    Self-Repaying Loans, <br />
                    Without Liquidations
                </h1>
                
                <p className="font-sans font-light text-lg xl:text-xl leading-snug text-zinc-400 dark:text-white mt-2 mb-4 2xl:mt-8 2xl:mb-12 max-w-3xl transition-all [transition-duration:1.1s] opacity-100">
                    Orbit loans automatically pay themselves off with the yield generated from your deposit. <br />
                    Unlock the potential of your assets with secure and stress-free borrowing.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    <button
                        onClick={isConnected ? handleLaunchApp : handleConnect}
                        className="px-12 py-4 btn-emerald-outline text-emerald-400 rounded-xl text-sm font-bold tracking-[0.2em] bg-emerald-400/5 hover:bg-emerald-400/10 transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                    >
                        GET A SELF-REPAYING LOAN
                    </button>
                    <button className="p-4 btn-emerald-outline text-emerald-400 rounded-xl hover:bg-emerald-400/10 transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <Play size={24} fill="currentColor" />
                    </button>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-dark-bg to-transparent pointer-events-none" />
        </div>
    );
};

