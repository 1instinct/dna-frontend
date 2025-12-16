import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { GroupProps, Vector3 } from "@react-three/fiber";
import { generatePoints } from "./utils";
import { Tube } from "./Tube";
import * as THREE from "three";

interface SpiderGraphProps {
  data: {
    axes: { name: string; value: number }[];
  };
}

type Point = [number, number, number];

export const SpiderGraph: React.FC<SpiderGraphProps> = ({ data }) => {
  const groupRef = useRef<THREE.Group>(null);
  const points: Point[] = useMemo(
    () => generatePoints(data) as Point[],
    [data]
  );

  // useFrame(() => {
  //   if (groupRef.current) {
  //     groupRef.current.rotation.x = groupRef.current.rotation.y += 0.001;
  //   }
  // });

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001;
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={[1, 1, 1] as [number, number, number] as Vector3}
    >
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
        <React.Fragment key={i}>
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshPhongMaterial
              emissive={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
              emissiveIntensity={4}
              color={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
              roughness={0.2}
            />
          </mesh>
          <pointLight
            intensity={1}
            color={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
            distance={5}
            position={[x, y, z]}
          />
        </React.Fragment>
      ))}
      {points.map(([x, y, z], i) => (
        <React.Fragment key={`tube-${i}`}>
          <Tube start={[0, 0, 0]} end={[x, y, z]} radius={0.02} />
          <Tube
            start={[0, 0, 0]}
            end={[
              x * data.axes[i].value,
              y * data.axes[i].value,
              z * data.axes[i].value
            ]}
            color={`hsl(${i * (360 / points.length)}, 100%, 50%)`}
            radius={0.01}
          />
        </React.Fragment>
      ))}
    </group>
  );
};
