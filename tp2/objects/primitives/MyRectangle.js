import * as THREE from 'three';
import { MyPrimitive } from './MyPrimitive.js';

class MyRectangle extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    this.xy1 = new THREE.Vector2(node.xy1.x, node.xy1.y);
    this.xy2 = new THREE.Vector2(node.xy2.x, node.xy2.y);
    this.parts_x = node.parts_x;
    this.parts_y = node.parts_y;
  }
}

export { MyRectangle };