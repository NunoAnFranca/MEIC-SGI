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

        this.maxHeight = 18;
        this.minHeight = 4;

        this.radius = 0.5;
        this.slices = 64;
        this.stacks = 64;
        this.nMeshes = 6;

        this.samplesU = 64;
        this.samplesV = 64;

        this.builder = new MyNurbsBuilder();

        this.baloonGroup = new THREE.Group();
        
        this.trackPoints = null;
        this.distanceTreshold = 4.0;

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
            const baloonMesh = new THREE.Mesh(surfaceData, baloonMaterial);
            baloonMesh.name = this.name;
            baloonMesh.receiveShadow = true;
            baloonMesh.castShadow = true;
            baloonMesh.rotation.x = Math.PI / 2;
            baloonMesh.rotation.z = i / 6 * 2 * Math.PI;
            baloonMesh.position.x = this.xPos;
            baloonMesh.position.y = this.yPos;
            baloonMesh.position.z = this.zPos;
            this.baloonGroup.add(baloonMesh);
        }

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const boxGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
                const boxMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" });
                const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                boxMesh.name = "cable" + i + j;
                boxMesh.position.x = this.xPos + (i === 0 ? -0.5 : 0.5);
                boxMesh.position.y = this.yPos - 3;
                boxMesh.position.z = this.zPos + (j === 0 ? -0.5 : 0.5);
                this.baloonGroup.add(boxMesh);
            }
        }

        const basketGeometry = new THREE.BoxGeometry(1.2, 1, 1.2);
        const basketMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" });
        const basketMesh = new THREE.Mesh(basketGeometry, basketMaterial);
        basketMesh.name = "basket";
        basketMesh.position.x = this.xPos;
        basketMesh.position.y = this.yPos - 4;
        basketMesh.position.z = this.zPos;
        this.baloonGroup.add(basketMesh);

        this.app.scene.add(this.baloonGroup);
    }

    setPosition(xPos, yPos, zPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.zPos = zPos;

        const positionOffsets = {
            basket: { x: 0, y: -4, z: 0 },
            cable00: { x: -0.5, y: -3, z: -0.5 },
            cable01: { x: 0.5, y: -3, z: 0.5 },
            cable10: { x: 0.5, y: -3, z: -0.5 },
            cable11: { x: -0.5, y: -3, z: 0.5 },
            default: { x: 0, y: 0, z: 0 }
        };

        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            const child = this.baloonGroup.children[i];
            const offset = positionOffsets[child.name] || positionOffsets.default;
            child.position.x = this.xPos + offset.x;
            child.position.y = this.yPos + offset.y;
            child.position.z = this.zPos + offset.z;
        }
    }

    nearestPoint() {
        let x = this.trackPoints[0].x;
        let z = this.trackPoints[0].z;
        let distance = Number.MAX_SAFE_INTEGER;

        for (let point of this.transformedPoints) {
            let distancePoints = Math.sqrt(Math.pow(point.x - this.xPos, 2) + Math.pow(point.z - this.zPos, 2));
            if (distancePoints < distance) {
                distance = distancePoints;
                x = point.x;
                z = point.z;
            }
        }
        
        this.xPos = x;
        this.zPos = z;

        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.x = x;
            this.baloonGroup.children[i].position.z = z;
        }
    }
    
    checkPosition() {
        this.trackPoints = this.app.contents.track.path.getPoints(10000);
        
        this.transformedPoints = this.trackPoints.map(point => {
            let vector = new THREE.Vector3(point.x, point.y, point.z);
            this.app.contents.track.curve.localToWorld(vector);
            return vector;
        });

        for (let point of this.transformedPoints) {
            let distance = Math.sqrt(Math.pow(point.x - this.xPos, 2) + Math.pow(point.z - this.zPos, 2));
            if (distance < this.distanceTreshold) {
                return true;
            } 
        }

        this.nearestPoint();

        return false;
    }
    
    moveWind() {
        let log = this.checkPosition();
        if (log) {
            if (this.yPos <= 8 && this.yPos > 5) {
                this.moveForward();
            } else if (this.yPos <= 11 && this.yPos > 8) {
                this.moveBackward();
            } else if (this.yPos <= 14 && this.yPos > 11) {
                this.moveRight();
            } else if (this.yPos <= 17 && this.yPos > 14) {
                this.moveLeft();
            }
        }
    }

    moveUp() {
        if (this.yPos + 0.1 < this.maxHeight) {
            this.yPos += 0.1;
            for (let i = 0; i < this.baloonGroup.children.length; i++) {
                this.baloonGroup.children[i].position.y += 0.1;
            }
        }
    }

    moveDown() {
        if (this.yPos - 0.1 > this.minHeight) {
            this.yPos -= 0.1;
            for (let i = 0; i < this.baloonGroup.children.length; i++) {
                this.baloonGroup.children[i].position.y -= 0.1;
            }
        }
    }

    moveLeft() {
        this.xPos -= 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.x -= 0.1;
        }
    }

    moveRight() {
        this.xPos += 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.x += 0.1;
        }
    }

    moveForward() {
        this.zPos -= 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.z -= 0.1;
        }
    }

    moveBackward() {
        this.zPos += 0.1;
        for (let i = 0; i < this.baloonGroup.children.length; i++) {
            this.baloonGroup.children[i].position.z += 0.1;
        }
    }
}

export { MyBaloon };