import { MyPrimitive } from './MyPrimitive.js';

class MyNurbs extends MyPrimitive{
  constructor(node, properties) {
    super(properties);
    this.degree_u = node.degree_u;
    this.degree_v = node.degree_v;
    this.parts_u = node.parts_u;
    this.parts_v = node.parts_v;
    this.controlpoints = node.controlpoints;
  }
}

export { MyNurbs };