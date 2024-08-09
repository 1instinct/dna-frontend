import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { GroupProps } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { generatePoints } from './utils';
import { Tube } from './Tube';
import * as THREE from 'three';

interface SpiderGraphProps {
  data: {
    axes: { name: string; value: number }[];
  };
}

type Point = [number, number, number];

export const SpiderGraph: React.FC<SpiderGraphProps> = ({ data }: any) => {
  const groupRef = useRef<THREE.Group>(null!);
  const points: Point[] = useMemo(() => generatePoints(data), [data]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 25, 25]} />
        <meshPhysicalMaterial
          color="black"
          transmission={0.5}
          roughness={0.1}
          metalness={0.9}
          reflectivity={0.9}
        />
      </mesh>
      {points.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <meshPhongMaterial
            emissive={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
            emissiveIntensity={4}
            color={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
            roughness={0.2}
          />
          <pointLight
            intensity={1}
            color={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
            distance={5}
          />
        </mesh>
      ))}
      {points.map(([x, y, z], i) => (
        <>
          <Tube
            start={[0, 0, 0]}
            end={[x, y, z]}
            radius={0.02}
          />
          <Tube
            start={[0, 0, 0]}
            end={[x * data.axes[i].value, y * data.axes[i].value, z * data.axes[i].value]}
            color={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
            radius={0.01}
          />
        </>
      ))}
    </group>
  );
};