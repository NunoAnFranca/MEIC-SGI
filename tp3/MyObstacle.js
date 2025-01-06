import * as THREE from "three";

class MyObstacle {
    constructor(app, name, pos, {radius, slices, stacks}, value) {
        this.app = app;
        this.name = name;
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.value = value;

        this.mesh = null;

        this.init();
    }

    init() {
        const geometry = new THREE.SphereGeometry(this.radius, this.slices, this.stacks);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, this.z);

        this.app.scene.add(this.mesh);
    }

    animate() {
        let animation = this.value % 2;

        if(animation == 1){
            if(this.mesh.position.y < 14)
            {
                this.mesh.position.y += 0.05;
            } else {
                this.value = 0;
            }
        } else{
            if(this.mesh.position.y > 2)
            {
                this.mesh.position.y -= 0.05;
            } else {
                this.value = 1;
            }
        }
    }
}

export { MyObstacle };