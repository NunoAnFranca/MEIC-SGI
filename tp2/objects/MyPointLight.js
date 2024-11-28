import * as THREE from 'three';

class MyPointLight {
  constructor(name, value) {
      this.name = name;
      this.enabled = value.enabled;
      this.color = new THREE.Color(value.color.r, value.color.g, value.color.b);
      this.intensity = value.intensity;
      this.distance = value.distance;
      this.decay = value.decay;
      this.castShadow = value.castshadow;
      this.position = new THREE.Vector3(value.position.x, value.position.y, value.position.z);
  }
}

export { MyPointLight };