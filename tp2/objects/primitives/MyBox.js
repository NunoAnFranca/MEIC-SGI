import * as THREE from 'three';
import { MyPrimitive } from './MyPrimitive.js';

//Assign box
class MyBox extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    // Assign coords 1
    this.xyz1 = new THREE.Vector3(node.xyz1.x, node.xyz1.y, node.xyz1.z);
    // Assign coords 2
    this.xyz2 = new THREE.Vector3(node.xyz2.x, node.xyz2.y, node.xyz2.z);
    // Assign parts_x
    this.parts_x = node.parts_x;
    // Assign parts_y
    this.parts_y = node.parts_y;
    // Assign parts_z
    this.parts_z = node.parts_z;
  }
}

export { MyBox };