import * as THREE from 'three';

class MyPointLight {
  constructor(name, value) {
      this.name = name;
      this.enabled = value.enabled === false ? false : true;
      this.color = new THREE.Color(value.color.r, value.color.g, value.color.b);
      this.intensity = value.intensity ? value.intensity : 1;
      this.distance = value.distance ? value.distance : 1000;
      this.decay = value.decay ? value.decay : 2;
      this.position = new THREE.Vector3(value.position.x, value.position.y, value.position.z);
      this.castShadow = value.castshadow ? value.castshadow : false;
      this.shadowFar = value.shadowfar ? value.shadowfar : 500;
      this.shadowMapSize = value.shadowmapsize ? value.shadowmapsize : 512;
  }
}

export { MyPointLight };