import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from '@react-three/postprocessing';
import { useRef } from "react";
import { Mesh } from "three";
import { KernelSize } from "postprocessing";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';

function Shape() {
    const meshRef = useRef<Mesh>(null);
    const innerSphereRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.3;
            meshRef.current.rotation.z += delta * 0.2;
        }
        if (innerSphereRef.current) {
            innerSphereRef.current.rotation.x += delta * 0.3;
            innerSphereRef.current.rotation.y += delta * 0.5;
            innerSphereRef.current.rotation.z += delta * 0.1;
        }
    });

    return (
        <>
            <mesh ref={meshRef}>
                <meshPhysicalMaterial
                    roughness={0}
                    metalness={0.95}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    color="#000000"
                />
                <Geometry>
                    <Base>
                        <primitive object={new RoundedBoxGeometry(2, 2, 2, 7, 0.2)} />
                    </Base>
                    <Subtraction>
                        <sphereGeometry args={[1.25, 64, 64]} />
                    </Subtraction>
                </Geometry>
            </mesh>

            <mesh ref={innerSphereRef}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    emissive="white"
                    emissiveIntensity={1}
                />
            </mesh>
        </>
    );
}

function Environment() {
    return (
        <>
            <directionalLight position={[-5, 5, -5]} intensity={0.2} color="#e6f3ff" />
            <directionalLight position={[0, -5, 10]} intensity={0.4} color="#fff5e6" />
            <ambientLight intensity={0.8} color="#404040" />
            <pointLight position={[8, 3, 8]} intensity={0.2} color="#ffeecc" distance={20} />
            <pointLight position={[-8, 3, -8]} intensity={0.2} color="#ccf0ff" distance={20} />
            <directionalLight position={[0, -10, 0]} intensity={0.2} color="#f0f0f0" />
        </>
    );
}

function Scene() {
    return (
        <Canvas className="w-full h-full" camera={{ position: [5, 5, 5], fov: 50 }}>
            <Environment />
            <Shape />
            <EffectComposer multisampling={0}>
                <N8AO halfRes color="black" aoRadius={2} intensity={1} aoSamples={6} denoiseSamples={4} />
                <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
                <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0} luminanceSmoothing={0} intensity={0.5} />
                <SMAA />
            </EffectComposer>
        </Canvas>
    );
}

interface OrbitHeroProps {
    onConnectWallet?: () => void;
}

export const OrbitHero: React.FC<OrbitHeroProps> = () => {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
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
        <div className="min-h-screen w-full relative bg-[#0A0A0A]">
            <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-10">
                <div className="text-sm font-light tracking-[0.2em] text-white">
                    ORBIT FINANCE
                </div>

                {isConnected ? (
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-light tracking-wide text-zinc-400">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                        <button
                            onClick={handleLaunchApp}
                            className="px-6 py-2.5 bg-[#f4d19b] text-black text-xs font-light tracking-[0.2em] hover:bg-[#e5c28c] transition-colors duration-300 uppercase"
                        >
                            Launch App
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="px-6 py-2.5 bg-[#f4d19b] text-black text-xs font-light tracking-[0.2em] hover:bg-[#e5c28c] transition-colors duration-300 uppercase"
                    >
                        Connect Wallet
                    </button>
                )}
            </nav>

            <div className="absolute inset-0 w-full h-full">
                <Scene />
            </div>

            <div className="absolute bottom-10 left-10 z-20 max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4 text-white leading-tight">
                    Self-Repaying Loans<br />Without Liquidations
                </h1>
                <p className="text-lg leading-relaxed font-light tracking-tight text-white/60 mb-8 font-mono">
                    Borrow against crypto. Yield auto-repays your debt. No forced liquidations.
                </p>
                <button
                    onClick={isConnected ? handleLaunchApp : handleConnect}
                    className="px-8 py-3 bg-[#f4d19b] text-black text-sm font-light tracking-[0.2em] hover:bg-[#e5c28c] transition-colors duration-300 uppercase"
                >
                    {isConnected ? 'Launch App' : 'Get Started'}
                </button>
            </div>
        </div>
    );
};
