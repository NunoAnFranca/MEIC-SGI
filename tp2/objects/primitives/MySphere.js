import { MyPrimitive } from './MyPrimitive.js';

class MySphere extends MyPrimitive {
  constructor(node, transforms, material) {
    super(transforms, material);
    this.radius = node.radius;
    this.slices = node.slices;
    this.stacks = node.stacks;
    this.thetastart = node.thetastart;
    this.thetalength = node.thetalength;
    this.phistart = node.phistart;
    this.philength = node.philength;
  }
}

export { MySphere };