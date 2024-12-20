import { MyPrimitive } from './MyPrimitive.js';

// Triangle class
class MyTriangle extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    // Assign coords point 1
    this.xy1 = node.xy1;
    // Assign coords point 2
    this.xy2 = node.xy2;
    // Assign coords point 3
    this.xy3 = node.xy3;
  }
}

export { MyTriangle };