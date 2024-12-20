class MyPrimitive {
  constructor([transforms, material, castshadows, receiveshadows]) {
    // transforms property for primitive
    this.transforms = transforms;
    // material property for primitive
    this.material = material;
    // castShadow property for primitive
    this.castShadow = castshadows;
    // receiveShadow property for primitive
    this.receiveShadow = receiveshadows;
  }
}

export { MyPrimitive };