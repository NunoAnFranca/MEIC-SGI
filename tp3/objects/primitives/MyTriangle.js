import { MyPrimitive } from './MyPrimitive.js';

// Triangle class
class MyTriangle extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    // Assign coords point 1
    this.xyz1 = node.xyz1;
    // Assign coords point 2
    this.xyz2 = node.xyz2;
    // Assign coords point 3
    this.xyz3 = node.xyz3;
  }
}

export { MyTriangle };