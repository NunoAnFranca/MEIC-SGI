import { MyPrimitive } from './MyPrimitive.js';

//Sphere Class
class MySphere extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    // assign radius
    this.radius = node.radius;
    // assign slices
    this.slices = node.slices;
    // assign stacks
    this.stacks = node.stacks;
    // assign thetastart
    this.thetastart = node.thetastart;
    // assign thetalength
    this.thetalength = node.thetalength;
    // assign phistart
    this.phistart = node.phistart;
    // assign philength
    this.philength = node.philength;
  }
}

export { MySphere };