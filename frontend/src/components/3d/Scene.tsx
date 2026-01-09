import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Grid, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function EnergyFlow({ radius, speed, color, offset = 0 }: { radius: number, speed: number, color: string, offset?: number }) {
    const flowRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (flowRef.current) {
            const t = state.clock.getElapsedTime() * speed + offset;
            flowRef.current.rotation.z = t;
            flowRef.current.position.y = Math.sin(t * 0.5) * 0.1;
        }
    });

    return (
        <mesh ref={flowRef}>
            <torusGeometry args={[radius, 0.015, 16, 100, Math.PI / 4]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={4}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
}

function OrbitRing({ radius, speed, color, opacity = 0.2 }: { radius: number, speed: number, color: string, opacity?: number }) {
    const ringRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.getElapsedTime() * speed;
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    return (
        <group>
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.01, 16, 100]} />
                <meshStandardMaterial 
                    color={color} 
                    transparent 
                    opacity={opacity} 
                    emissive={color}
                    emissiveIntensity={1.2}
                />
            </mesh>
            {/* Energy Flow Trails */}
            <EnergyFlow radius={radius} speed={speed * 1.2} color={color} offset={0} />
            <EnergyFlow radius={radius} speed={speed * 1.2} color={color} offset={Math.PI} />
        </group>
    );
}

function Particles({ count = 100 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = 4 + Math.random() * 8;
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
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
            pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.01;
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
                size={0.04} 
                color="#d4af37" 
                transparent 
                opacity={0.4} 
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function NestedCore() {
    const coreRef = useRef<THREE.Group>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (coreRef.current) {
            coreRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
        if (innerRef.current) {
            innerRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
            innerRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05);
        }
        if (outerRef.current) {
            outerRef.current.rotation.z = -state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <group ref={coreRef}>
            {/* Inner Glowing Sphere */}
            <mesh ref={innerRef}>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshStandardMaterial 
                    color="#d4af37" 
                    emissive="#d4af37" 
                    emissiveIntensity={2}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Middle Wireframe Octahedron */}
            <mesh>
                <octahedronGeometry args={[1.2, 0]} />
                <meshStandardMaterial 
                    color="#d4af37" 
                    wireframe 
                    transparent 
                    opacity={0.4}
                    emissive="#d4af37"
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Outer Glass-like Shell */}
            <mesh ref={outerRef}>
                <octahedronGeometry args={[1.6, 1]} />
                <MeshDistortMaterial 
                    color="#d4af37"
                    speed={2}
                    distort={0.2}
                    radius={1}
                    transparent
                    opacity={0.15}
                    wireframe
                />
            </mesh>

            {/* Point Light inside core */}
            <pointLight intensity={2} color="#d4af37" distance={5} />
        </group>
    );
}

export function BackgroundStars() {
    return (
        <>
            <color attach="background" args={['#050505']} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        </>
    );
}

export function Scene() {
    const { mouse } = useThree();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            // Subtle mouse parallax
            const targetX = mouse.x * 0.5;
            const targetY = mouse.y * 0.5;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX * 0.2, 0.05);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY * 0.1, 0.05);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 0, 12]} fov={45} />
            
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#d4af37" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />

            <group ref={groupRef}>
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <NestedCore />

                    {/* Orbiting Rings with Energy Flows */}
                    <OrbitRing radius={3.5} speed={0.15} color="#d4af37" opacity={0.1} />
                    <OrbitRing radius={5.5} speed={-0.1} color="#d4af37" opacity={0.05} />
                    <OrbitRing radius={7.5} speed={0.05} color="#ffffff" opacity={0.02} />
                    
                    <Particles count={200} />
                </Float>
            </group>

            {/* Grid Floor - Minimalist */}
            <Grid 
                infiniteGrid 
                fadeDistance={40} 
                fadeStrength={5} 
                cellSize={1} 
                sectionSize={5} 
                sectionColor="#d4af37" 
                sectionThickness={0.5}
                cellColor="#080808"
                position={[0, -6, 0]}
            />
        </>
    );
}
