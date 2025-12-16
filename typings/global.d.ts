import { ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
    }
  }
}
