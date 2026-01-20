import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function EnergyFlow({ radius, speed, color, offset = 0 }: { radius: number, speed: number, color: string, offset?: number }) {
    const flowRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (flowRef.current) {
            const t = state.clock.getElapsedTime() * speed + offset;
            flowRef.current.rotation.z = t;
            // Smoother orbital wobble
            flowRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
        }
    });

    return (
        <mesh ref={flowRef}>
            <torusGeometry args={[radius, 0.02, 32, 100, Math.PI / 3]} />
            <meshPhysicalMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={5}
                transparent
                opacity={0.9}
                roughness={0}
                metalness={1}
            />
        </mesh>
    );
}

function OrbitRing({ radius, speed, color, opacity = 0.2 }: { radius: number, speed: number, color: string, opacity?: number }) {
    const ringRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (ringRef.current) {
            const t = state.clock.getElapsedTime();
            ringRef.current.rotation.z = t * speed;
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.05;
        }
    });

    return (
        <group>
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.008, 16, 128]} />
                <meshPhysicalMaterial 
                    color={color} 
                    transparent 
                    opacity={opacity} 
                    emissive={color}
                    emissiveIntensity={2}
                    roughness={0}
                    metalness={1}
                />
            </mesh>
            <EnergyFlow radius={radius} speed={speed * 1.5} color={color} offset={0} />
            <EnergyFlow radius={radius} speed={speed * 1.5} color={color} offset={Math.PI} />
        </group>
    );
}

function Particles({ count = 200 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = 5 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            p[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            p[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            p[i * 3 + 2] = r * Math.cos(theta);
            s[i] = Math.random();
        }
        return { p, s };
    }, [count]);

    const pointsRef = useRef<THREE.Points>(null);
    useFrame((state) => {
        if (pointsRef.current) {
            const t = state.clock.getElapsedTime();
            pointsRef.current.rotation.y = t * 0.02;
            pointsRef.current.rotation.z = t * 0.01;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points.p, 3]}
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.06} 
                color="#d4af37" 
                transparent 
                opacity={0.6} 
                blending={THREE.AdditiveBlending}
                sizeAttenuation={true}
            />
        </points>
    );
}

function NestedCore() {
    const coreRef = useRef<THREE.Group>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    const middleRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (coreRef.current) {
            coreRef.current.rotation.y = t * 0.2;
        }
        if (innerRef.current) {
            innerRef.current.rotation.x = t * 0.5;
            const pulse = 1 + Math.sin(t * 3) * 0.08;
            innerRef.current.scale.setScalar(pulse);
        }
        if (middleRef.current) {
            middleRef.current.rotation.z = t * 0.3;
        }
        if (outerRef.current) {
            outerRef.current.rotation.y = -t * 0.1;
        }
    });

    return (
        <group ref={coreRef}>
            {/* Inner Core - Sun-like pulse */}
            <mesh ref={innerRef}>
                <sphereGeometry args={[0.7, 64, 64]} />
                <meshStandardMaterial 
                    color="#d4af37" 
                    emissive="#d4af37" 
                    emissiveIntensity={4}
                    toneMapped={false}
                />
            </mesh>

            {/* Middle Structure - Geometric cage */}
            <mesh ref={middleRef}>
                <icosahedronGeometry args={[1.3, 0]} />
                <meshPhysicalMaterial 
                    color="#d4af37" 
                    wireframe 
                    transparent 
                    opacity={0.3}
                    emissive="#d4af37"
                    emissiveIntensity={1.5}
                    metalness={1}
                    roughness={0}
                />
            </mesh>

            {/* Outer Shell - Refractive appearance */}
            <mesh ref={outerRef}>
                <octahedronGeometry args={[1.8, 2]} />
                <meshPhysicalMaterial 
                    color="#ffffff"
                    transparent
                    opacity={0.05}
                    wireframe
                    metalness={1}
                    roughness={0}
                    transmission={0.9}
                    thickness={1}
                />
            </mesh>

            {/* Core Lights */}
            <pointLight intensity={10} color="#d4af37" distance={8} decay={2} />
            <pointLight position={[2, 2, 2]} intensity={2} color="#ffffff" distance={5} />
        </group>
    );
}

export function BackgroundStars() {
    return (
        <>
            <color attach="background" args={['#020202']} />
            <Stars radius={100} depth={60} count={2500} factor={7} saturation={0} fade speed={0.4} />
        </>
    );
}

export function Scene() {
    const { mouse } = useThree();
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            // Smooth lerped parallax
            const targetX = mouse.x * 0.4;
            const targetY = mouse.y * 0.4;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX * 0.15, 0.05);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY * 0.1, 0.05);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={40} />
            
            <ambientLight intensity={0.4} />
            <spotLight 
                position={[15, 15, 15]} 
                angle={0.2} 
                penumbra={1} 
                intensity={5} 
                color="#d4af37" 
                castShadow 
            />
            <pointLight position={[-15, -15, -10]} intensity={1.5} color="#ffffff" />

            <group ref={groupRef}>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
                    <NestedCore />

                    {/* Highly aesthetic rings */}
                    <OrbitRing radius={4} speed={0.2} color="#d4af37" opacity={0.15} />
                    <OrbitRing radius={6} speed={-0.12} color="#d4af37" opacity={0.08} />
                    <OrbitRing radius={8.5} speed={0.06} color="#ffffff" opacity={0.03} />
                    
                    <Particles count={250} />
                </Float>
            </group>

            {/* Grid Floor - Clean institutional look */}
            <Grid 
                infiniteGrid 
                fadeDistance={50} 
                fadeStrength={8} 
                cellSize={1} 
                sectionSize={5} 
                sectionColor="#d4af37" 
                sectionThickness={0.8}
                cellColor="#080808"
                position={[0, -7, 0]}
            />
        </>
    );
}
