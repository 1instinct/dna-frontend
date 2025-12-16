import { useRef, useEffect } from "react";
import { Group } from "three";
import { extend, Object3DNode } from "@react-three/fiber";

// Create our custom element
class GroupElement extends Group {}

// Extend so the reconciler will learn about it
extend({ GroupElement });

// Add types to ThreeElements elements so primitives pick up on it
declare module "@react-three/fiber" {
  interface ThreeElements {
    groupElement: Object3DNode<GroupElement, typeof GroupElement>;
  }
}
