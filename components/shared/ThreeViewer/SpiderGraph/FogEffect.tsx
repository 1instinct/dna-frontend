import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FogEffect = () => {
  const fogRef = useRef<THREE.InstancedMesh>(null!);
  const bufferRef = useRef<THREE.BufferGeometry>(null!);
  const count = 2000; // Increase number of particles
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const fogParticles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  useFrame(() => {
    fogRef.current.rotation.y += 0.001;
  });

  return (
    <instancedMesh ref={fogRef} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 32, 32]} attach="geometry"> {/* Increase size of particles */}
        <bufferAttribute ref={bufferRef} attachObject={['attributes', 'position']} array={fogParticles} itemSize={3} />
      </sphereGeometry>
      <meshStandardMaterial attach="material" color="pink" opacity={0.5} transparent /> {/* Increase opacity */}
    </instancedMesh>
  );
};