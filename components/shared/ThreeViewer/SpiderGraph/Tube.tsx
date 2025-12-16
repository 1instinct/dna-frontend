import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Tube = ({ start, end, color, radius = 0.01 }: any) => {
  const bulbRef = useRef<THREE.Mesh>(null!);
  const bulbCapRef = useRef<THREE.Mesh>(null!);
  const tubeRef = useRef<THREE.Mesh>(null!);
  const tubeCapRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const bulbMaterialRef = useRef<THREE.MeshPhongMaterial>(null!);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ]),
    [start, end]
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (bulbRef.current && lightRef.current) {
      // Create a flickering effect
      const flickerIntensity = Math.random() * 0.33;
      (bulbRef.current.material as THREE.MeshPhongMaterial).emissiveIntensity = flickerIntensity;
      lightRef.current.intensity = flickerIntensity * 2; // Adjust as needed
    }
    if (bulbCapRef.current) {
      const tubeEnd = new THREE.Vector3(
        end[0] * 0.95,
        end[1] * 0.95,
        end[2] * 0.95
      );
      const direction = tubeEnd.clone().normalize();
      const amplitude = 0.003; // Maximum distance the cap moves
      const frequency = 10; // Speed of the movement
      const offset = Math.sin(time * frequency) * amplitude;

      bulbCapRef.current.position.set(
        tubeEnd.x - direction.x * offset,
        tubeEnd.y - direction.y * offset,
        tubeEnd.z - direction.z * offset
      );
    }
  });

  return color ? (
    <>
      <mesh ref={bulbRef}>
        <tubeGeometry args={[curve, 20, radius, 22, true]} />
        <meshPhongMaterial
          ref={bulbMaterialRef}
          emissive={color}
          emissiveIntensity={22}
          color={color}
          side={THREE.DoubleSide}
          shininess={10}
        />
        <pointLight ref={lightRef} color={color} intensity={1} distance={2} />
      </mesh>
      <mesh ref={bulbCapRef} position={end}>
        <sphereGeometry
          args={[0.01, 32, 32, Math.PI, Math.PI * 2, 0, Math.PI]}
        />
        <meshPhysicalMaterial
          emissive={color}
          emissiveIntensity={1}
          color={color}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
        <pointLight ref={lightRef} color={color} intensity={1} distance={2} />
      </mesh>
    </>
  ) : (
    <>
      <mesh ref={tubeRef}>
        <tubeGeometry args={[curve, 20, radius, 22, false]} />
        <meshPhysicalMaterial
          color="white"
          transmission={0.99}
          roughness={0.1}
          metalness={0.01}
          reflectivity={0.05}
        />
      </mesh>
      <mesh ref={tubeCapRef} position={end}>
        <sphereGeometry
          args={[0.02, 32, 32, Math.PI, Math.PI * 2, 0, Math.PI]}
        />
        <meshPhysicalMaterial
          color="white"
          transmission={0.99}
          roughness={0.1}
          metalness={0.01}
          reflectivity={0.05}
        />
      </mesh>
    </>
  );
};
