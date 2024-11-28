class MyPrimitive {
  constructor([transforms, material, castshadows, receiveshadows]) {
    this.transforms = transforms;
    this.material = material;
    this.castShadow = castshadows;
    this.receiveShadow = receiveshadows;
  }
}

export { MyPrimitive };