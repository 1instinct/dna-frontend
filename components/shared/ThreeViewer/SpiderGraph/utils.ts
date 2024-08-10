import React from "react";

export const generatePoints = (data: any) => {
  const points = [];
  const count = data.axes.length;
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y); // radius at y

    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    points.push([x, y, z]);
  }

  console.log("Generated Points:", points); // Debugging log

  return points;
};

// export const generateSpiderGraph = (data: any) => {
//   const points = generatePoints(data);

//   return (
//     <group>
//       {points.map(([x, y], i) => (
//         <mesh key={i} position={[x, y, 0]}>
//           <sphereGeometry args={[0.05, 32, 32]} />
//           <meshStandardMaterial color="red" />
//         </mesh>
//       ))}
//       <Line
//         points={points.map(([x, y]) => [x, y, 0])}
//         color="blue"
//         lineWidth={2}
//       />
//     </group>
//   );
// };
