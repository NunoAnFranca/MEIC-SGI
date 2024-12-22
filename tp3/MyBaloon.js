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

    setPosition(xPos, yPos, zPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.zPos = zPos;

        this.app.scene.getObjectByName(this.name).position.x = this.xPos;
        this.app.scene.getObjectByName(this.name).position.y = this.yPos;
        this.app.scene.getObjectByName(this.name).position.z = this.zPos;
    }
    
    moveWind() {
        if (this.yPos < 5) {
            this.moveForward();
        } else if (this.yPos < 8) {
            this.moveLeft();
        } else if (this.yPos < 11) {
            this.moveBackward();
        } else if (this.yPos < 14) {
            this.moveRight();
        }
    }

    moveUp() {
        this.yPos += 0.1;
        this.app.scene.getObjectByName(this.name).position.y = this.yPos;
    }

    moveDown() {
        this.yPos -= 0.1;
        this.app.scene.getObjectByName(this.name).position.y = this.yPos;
    }

    moveLeft() {
        this.xPos -= 0.1;
        this.app.scene.getObjectByName(this.name).position.x = this.xPos;
    }

    moveRight() {
        this.xPos += 0.1;
        this.app.scene.getObjectByName(this.name).position.x = this.xPos;
    }

    moveForward() {
        this.zPos -= 0.1;
        this.app.scene.getObjectByName(this.name).position.z = this.zPos;
    }

    moveBackward() {
        this.zPos += 0.1;
        this.app.scene.getObjectByName(this.name).position.z = this.zPos;
    }
}

export { MyBaloon };