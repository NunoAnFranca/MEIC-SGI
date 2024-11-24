import { MyPrimitive } from './MyPrimitive.js';

class MyTriangle extends MyPrimitive {
  constructor(node, transforms, material) {
    super(transforms, material);
    this.xy1 = node.xy1;
    this.xy2 = node.xy2;
    this.xy3 = node.xy3;
  }
}

export { MyTriangle };