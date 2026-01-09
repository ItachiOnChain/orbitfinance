import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Stars, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function OrbitRing({ radius, speed, color, opacity = 0.2 }: { radius: number, speed: number, color: string, opacity?: number }) {
    const ringRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.getElapsedTime() * speed;
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    return (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.02, 16, 100]} />
            <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={opacity} 
                emissive={color}
                emissiveIntensity={2}
            />
        </mesh>
    );
}

function Particles({ count = 100 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 3 + Math.random() * 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            p[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            p[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            p[i * 3 + 2] = r * Math.cos(theta);
        }
        return p;
    }, [count]);

    const pointsRef = useRef<THREE.Points>(null);
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#d4af37" transparent opacity={0.6} />
        </points>
    );
}

export function Scene() {
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (coreRef.current) {
            coreRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
            coreRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />
            <color attach="background" args={['#050505']} />
            
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#d4af37" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Central Core */}
                <mesh ref={coreRef}>
                    <octahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial 
                        color="#d4af37" 
                        wireframe 
                        transparent 
                        opacity={0.8}
                        emissive="#d4af37"
                        emissiveIntensity={1}
                    />
                </mesh>
                
                {/* Inner Glow */}
                <mesh>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshStandardMaterial 
                        color="#d4af37" 
                        transparent 
                        opacity={0.3} 
                        emissive="#d4af37"
                        emissiveIntensity={2}
                    />
                </mesh>

                {/* Orbiting Rings */}
                <OrbitRing radius={3} speed={0.2} color="#d4af37" />
                <OrbitRing radius={4.5} speed={-0.15} color="#d4af37" opacity={0.1} />
                <OrbitRing radius={6} speed={0.1} color="#ffffff" opacity={0.05} />
                
                <Particles count={200} />
            </Float>

            {/* Grid Floor */}
            <Grid 
                infiniteGrid 
                fadeDistance={50} 
                fadeStrength={5} 
                cellSize={1} 
                sectionSize={5} 
                sectionColor="#d4af37" 
                sectionThickness={1.5}
                cellColor="#111111"
                position={[0, -5, 0]}
            />
        </>
    );
}
