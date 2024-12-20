import * as THREE from 'three';
import { MyPrimitive } from './MyPrimitive.js';

// Rectangle class
class MyRectangle extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    // Assign coord 1
    this.xy1 = new THREE.Vector2(node.xy1.x, node.xy1.y);
    // Assign coord 2
    this.xy2 = new THREE.Vector2(node.xy2.x, node.xy2.y);
    // Assign parts_x
    this.parts_x = node.parts_x;
    // Assign parts_y
    this.parts_y = node.parts_y;
  }
}

export { MyRectangle };