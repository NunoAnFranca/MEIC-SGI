import * as THREE from 'three';
import { MyPrimitive } from './MyPrimitive.js';

//Assign box
class MyTreeBillboard extends MyPrimitive {
  constructor(node, properties) {
    super(properties);

    this.number = node.number;

  }
}

export { MyTreeBillboard };