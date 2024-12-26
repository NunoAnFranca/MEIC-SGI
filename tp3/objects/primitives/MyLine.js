import * as THREE from 'three';
import { MyPrimitive } from './MyPrimitive.js';

//Assign box
class MyLine extends MyPrimitive {
  constructor(node, properties) {
    super(properties);
    //assign points
    this.points = node.points;
    // assign parts
    this.parts = node.parts;
    //assign sides
    this.sides = node.sides;
    //assign width
    this.width = node.width;
    //assign closed
    this.closed = node.closed;

  }
}

export { MyLine };