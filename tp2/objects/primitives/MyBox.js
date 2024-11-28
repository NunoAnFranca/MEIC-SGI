import * as THREE from 'three';
import { MyPrimitive } from './MyPrimitive.js';

class MyBox extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    this.xyz1 = new THREE.Vector3(node.xyz1.x, node.xyz1.y, node.xyz1.z);
    this.xyz2 = new THREE.Vector3(node.xyz2.x, node.xyz2.y, node.xyz2.z);
    this.parts_x = node.parts_x;
    this.parts_y = node.parts_y;
    this.parts_z = node.parts_z;
  }
}

export { MyBox };