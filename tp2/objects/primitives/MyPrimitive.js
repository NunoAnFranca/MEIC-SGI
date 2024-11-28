class MyPrimitive {
  constructor([transforms, material, castshadows, receiveshadows]) {
    this.transforms = transforms;
    this.material = material;
    this.castshadows = castshadows;
    this.receiveshadows = receiveshadows;
  }
}

export { MyPrimitive };