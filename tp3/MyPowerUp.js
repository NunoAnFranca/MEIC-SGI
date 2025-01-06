import * as THREE from "three";

class MyPowerUp {
    constructor(app, name, pos, {radius, slices, stacks}) {
        this.app = app;
        this.name = name;
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

        this.mesh = null;

        this.init();
    }

    init() {
        const geometry = new THREE.SphereGeometry(this.radius, this.slices, this.stacks);
        const material = new THREE.MeshBasicMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, this.z);
        
        this.app.scene.add(this.mesh);
    }
}

export { MyPowerUp };