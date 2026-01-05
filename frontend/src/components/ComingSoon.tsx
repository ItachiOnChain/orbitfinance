import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { Stars } from '@react-three/drei';
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from '@react-three/postprocessing';
import { useRef } from "react";
import { Mesh } from "three";

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

export const ComingSoon = () => {
    return (
        <div className="relative w-full h-[calc(100vh-128px)] bg-dark-bg overflow-hidden flex flex-col items-center justify-center">
            {/* Background Scene */}
            <div className="absolute inset-0 w-full h-full opacity-40">
                <Scene />
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-widest leading-tight text-bronze-gradient bronze-drop-shadow font-outfit uppercase mb-4">
                    Coming Soon
                </h1>
                <p className="font-sans font-light text-lg text-zinc-400 tracking-widest uppercase">
                    
                </p>
            </div>
        </div>
    );
};
