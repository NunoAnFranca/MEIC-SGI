import * as THREE from "three";
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyBaloon {
    constructor(app, name, xPos, yPos, zPos, textureN) {
        this.app = app;
        this.name = name;
        this.xPos = xPos;
        this.yPos = yPos;
        this.zPos = zPos;
        this.textureN = textureN;

        this.maxHeight = 15;
        this.minHeight = 1;

        this.radius = 0.5;
        this.slices = 64;
        this.stacks = 64;
        this.nMeshes = 6;

        this.samplesU = 64;
        this.samplesV = 64;

        this.builder = new MyNurbsBuilder();

        this.baloonGroup = new THREE.Group();

        this.init();
    }

    init() {
        const orderU = 2;
        const orderV = 2;
        const texture = new THREE.TextureLoader().load("./images/textures/baloon" + this.textureN + ".jpg");

        const baloonMaterial = new THREE.MeshPhongMaterial({
            color: "#ffffff",
            specular: "#111111",
            emissive: "#000000",
            shininess: 90,
            map: texture,
            side: THREE.DoubleSide
        });
        
        const controlPoints = [
            [
                [0, 0, -2, 1],
                [-1.75, 3, -2, 1],
                [-0.3, 0.5, 3, 1]
            ],
            [
                [0, 0.5, -2, 1],
                [0, 5.5, -1, 1],
                [0, 0.7, 3, 1]
            ],
            [
                [0, 0, -2, 1],
                [1.75, 3, -2, 1],
                [0.3, 0.5, 3, 1]
            ]
        ];

        const surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, baloonMaterial);
                
        for (let i = 0; i < this.nMeshes; i++) {
            const baloonPart = new THREE.Object3D();
            const baloonMesh = new THREE.Mesh(surfaceData, baloonMaterial);

            baloonMesh.name = this.name
            baloonMesh.receiveShadow = true;
            baloonMesh.castShadow = true;
            baloonPart.add(baloonMesh);
            baloonPart.rotation.x = Math.PI / 2;
            baloonPart.rotation.z = i / 6 * 2 * Math.PI;
            baloonPart.position.x = this.xPos;
            baloonPart.position.y = this.yPos;
            baloonPart.position.z = this.zPos;
            this.baloonGroup.add(baloonPart);
        }

        this.app.scene.add(this.baloonGroup);
    }

    setPosition(xPos, yPos, zPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.zPos = zPos;

        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.x = this.xPos;
            this.baloonGroup.children[i].position.y = this.yPos;
            this.baloonGroup.children[i].position.z = this.zPos;
        }
    }
    
    moveWind() {
        if (this.yPos <= 5 && this.yPos > 2) {
            this.moveForward();
        } else if (this.yPos <= 8 && this.yPos > 5) {
            this.moveBackward();
        } else if (this.yPos <= 11 && this.yPos > 8) {
            this.moveLeft();
        } else if (this.yPos <= 14 && this.yPos > 11) {
            this.moveRight();
        }
    }

    moveUp() {
        if (this.yPos < this.maxHeight) {
            this.yPos += 0.1;
            for (let i = 0; i < this.baloonGroup.children.length; i++) {
                this.baloonGroup.children[i].position.y = this.yPos;
            }
        } else {
            console.log("Baloon reached maximum height");
        }
    }

    moveDown() {
        if (this.yPos < this.maxHeight) {
            this.yPos -= 0.1;
            for (let i = 0; i < this.baloonGroup.children.length; i++) {
                this.baloonGroup.children[i].position.y = this.yPos;
            }
        } else {
            console.log("Baloon reached maximum height");
        }
    }

    moveLeft() {
        this.xPos -= 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.x = this.xPos;
        }
    }

    moveRight() {
        this.xPos += 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.x = this.xPos;
        }
    }

    moveForward() {
        this.zPos -= 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.z = this.zPos;
        }
    }

    moveBackward() {
        this.zPos += 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.z = this.zPos;
        }
    }
}

export { MyBaloon };