import * as THREE from "three";

class MyObstacle {
  constructor(app, pos, {width, height, depth}, color) {
    this.app = app;
    this.x = pos.x;
    this.y = pos.y;
    this.z = pos.z;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;

    this.init();
  }

  init() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(this.x, this.y, this.z);

    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const helper = new THREE.Box3Helper(boundingBox, 0xffff00);
    
    const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
    const sphereGeometry = new THREE.SphereGeometry(boundingSphere.radius, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
    const sphereHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphereHelper.position.copy(boundingSphere.center);
    
    this.app.scene.add(sphereHelper);
    this.app.scene.add(helper);
    this.app.scene.add(mesh);
  }
}

export { MyObstacle };