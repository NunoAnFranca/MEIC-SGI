import * as THREE from "three";

class MyPowerUp {
    constructor(app, name, pos, {widthS, heightS, radius}, color) {
        this.app = app;
        this.name = name;
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
        this.widthS = widthS;
        this.heightS = heightS;
        this.radius = radius;
        this.color = color;

        this.helper = null;
        this.mesh = null;

        this.init();
    }

    init() {
        const geometry = new THREE.SphereGeometry(this.radius, this.widthS, this.heightS);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, this.z);
        
        this.app.scene.add(this.mesh);
    }
}

export { MyPowerUp };