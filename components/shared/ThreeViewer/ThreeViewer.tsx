import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color } from "three";
import type { Mesh } from "three";

const isDarkMode =
  (process.env.NEXT_PUBLIC_DARK_MODE || "false") === "true";

// Simple rotating DNA helix
const DNAHelix = () => {
  const group = useRef<any>();

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.002;
    }
  });

  const helixColor = isDarkMode ? "#ff1493" : "#4169e1";

  return (
    <group ref={group}>
      {[...Array(12)].map((_, i) => {
        const t = (i / 12) * Math.PI * 4;
        const radius = 0.8;
        const height = i * 0.3 - 1.8;

        return (
          <group key={i}>
            {/* First strand */}
            <mesh
              position={[Math.cos(t) * radius, height, Math.sin(t) * radius]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color={helixColor}
                emissive={helixColor}
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Second strand (opposite) */}
            <mesh
              position={[-Math.cos(t) * radius, height, -Math.sin(t) * radius]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color={helixColor}
                emissive={helixColor}
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Connecting rung (every other one) */}
            {i % 2 === 0 && (
              <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, radius * 2, 6]} />
                <meshStandardMaterial
                  color={helixColor}
                  opacity={0.6}
                  transparent
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const ThreeViewer = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 50 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <color
        attach="background"
        args={[isDarkMode ? "#000000" : "#ffffff"]}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      <DNAHelix />
    </Canvas>
  );
};
