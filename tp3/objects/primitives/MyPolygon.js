import { MyPrimitive } from './MyPrimitive.js';

// Polygon class
class MyPolygon extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    //assign radius
    this.radius = node.radius;
    //assign slices
    this.slices = node.slices;
    //assign stacks
    this.stacks = node.stacks;
    //assign color_c
    this.color_c = node.color_c;
    //assign color_p
    this.color_p = node.color_p;
  }
}

export { MyPolygon };