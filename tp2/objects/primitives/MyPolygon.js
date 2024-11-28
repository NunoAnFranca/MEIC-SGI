import { MyPrimitive } from './MyPrimitive.js';

class MyPolygon extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    this.radius = node.radius;
    this.slices = node.slices;
    this.stacks = node.stacks;
    this.color_c = node.color_c;
    this.color_p = node.color_p;
  }
}

export { MyPolygon };