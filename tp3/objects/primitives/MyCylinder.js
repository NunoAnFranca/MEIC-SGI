import { MyPrimitive } from './MyPrimitive.js';

//Cylinder class
class MyCylinder extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    // assign base
    this.base = node.base;
    // assign top
    this.top = node.top;
    // assign height
    this.height = node.height;
    // assign slices
    this.slices = node.slices;
    // assign stacks
    this.stacks = node.stacks;
    // assign capsclose
    this.capsclose = node.capsclose;
    // assign thetastart
    this.thetastart = node.thetastart;
    // assign thetalength
    this.thetalength = node.thetalength;
  }
}

export { MyCylinder };