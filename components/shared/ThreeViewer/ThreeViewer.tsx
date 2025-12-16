import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { SpiderGraph } from "./SpiderGraph";

export const ThreeViewer = () => {
  const data = {
    axes: [
      { name: 'axis1', value: 0.8 },
      { name: 'axis2', value: 0.6 },
      { name: 'axis3', value: 0.9 },
      { name: 'axis4', value: 0.4 },
      { name: 'axis5', value: 0.7 },
      { name: 'axis6', value: 0.5 },
      { name: 'axis7', value: 0.8 },
      { name: 'axis8', value: 0.6 },
      { name: 'axis9', value: 0.9 },
      { name: 'axis10', value: 0.4 },
      { name: 'axis11', value: 0.7 },
      { name: 'axis12', value: 0.5 },
    ],
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 4] }}
      scene={{ background: { r: 0, g: 0, b: 0 } }}
      fog={{ color: 'pink', near: 10, far: 100 }}
    >
      {/* <ambientLight /> */}
      <spotLight position={[0, 0, 5]} angle={0.3} penumbra={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="pink" />

      <SpiderGraph data={data} />
      <FogEffect />

      <OrbitControls
        // limit pan to x and y axis
        enablePan={false}
        // maxPolarAngle={Math.PI / 4}
        // minPolarAngle={Math.PI / 4}
        // enableZoom={false}
        // limit zoom out
        maxDistance={4}
        // prevent zooming into the object
        minDistance={1.5}
        enableDamping
        dampingFactor={0.2}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}