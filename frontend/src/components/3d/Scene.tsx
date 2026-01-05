import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Scene() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
                color="#f4d19b"
                wireframe
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}
