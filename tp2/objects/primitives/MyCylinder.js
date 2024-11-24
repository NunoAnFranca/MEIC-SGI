import { MyPrimitive } from './MyPrimitive.js';

class MyCylinder extends MyPrimitive {
  constructor(node, transforms, material) {
    super(transforms, material);
    this.base = node.base;
    this.top = node.top;
    this.height = node.height;
    this.slices = node.slices;
    this.stacks = node.stacks;
    this.capsclose = node.capsclose;
    this.thetastart = node.thetastart;
    this.thetalength = node.thetalength;
  }
}

export { MyCylinder };