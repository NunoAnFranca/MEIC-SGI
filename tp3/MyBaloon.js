import * as THREE from "three";

class MyBaloon {
    constructor(app, name, color, xPos, yPos, zPos) {
        this.app = app;
        this.name = name;
        this.color = color;
        this.xPos = xPos;
        this.yPos = yPos;
        this.zPos = zPos;

        this.radius = 0.5;
        this.slices = 64;
        this.stacks = 64;

        this.init();
    }

    init() {
        const baloonMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: "#000000",
            emissive: "#000000",
            shininess: 90,
        });

        const baloon = new THREE.SphereGeometry(
            this.radius,
            this.slices,
            this.stacks
        );

        const baloonMesh = new THREE.Mesh(baloon, baloonMaterial);
        baloonMesh.name = this.name
        baloonMesh.position.x = this.xPos;
        baloonMesh.position.y = this.yPos;
        baloonMesh.position.z = this.zPos;

        this.app.scene.add(baloonMesh)
    }
}

export { MyBaloon };