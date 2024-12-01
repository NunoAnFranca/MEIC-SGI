import { MyPrimitive } from './MyPrimitive.js';

// Nurbs Class
class MyNurbs extends MyPrimitive{
  constructor(node, properties) {
    super(properties);
    //assign degree_u
    this.degree_u = node.degree_u;
    //assign degree_v
    this.degree_v = node.degree_v;
    //assign parts_u
    this.parts_u = node.parts_u;
    //assign parts_v
    this.parts_v = node.parts_v;
    //assign controlpoints
    this.controlpoints = node.controlpoints;
  }
}

export { MyNurbs };