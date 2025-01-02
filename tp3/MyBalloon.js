import * as THREE from "three";
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyBalloon {
    constructor(app, type, index, xPos, yPos, zPos, textureN) {
        this.app = app;
        this.type = type;
        this.index = index;
        this.xPos = xPos;
        this.yPos = yPos;
        this.zPos = zPos;
        this.textureN = textureN;

        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetZ = 0;

        this.maxHeight = 18;
        this.minHeight = 4;

        this.radius = 0.5;
        this.slices = 64;
        this.stacks = 64;
        this.nMeshes = 6;

        this.samplesU = 64;
        this.samplesV = 64;

        this.builder = new MyNurbsBuilder();

        this.balloonGroup = new THREE.Group();
        this.balloonGroup.type = this.type;
        this.balloonGroup.index = this.index;
        
        this.trackPoints = null;
        this.distanceTreshold = 5.0;

        this.DIRECTIONS = {
            NORTH: 0,
            EAST: 1,
            SOUTH: 2,
            WEST: 3
        };

        this.direction = this.DIRECTIONS.NORTH;

        this.checkpoints = null;
        this.currentCheckpointIndex = null;
        this.distanceCheckpoint = 6.0;
        this.checkpointsNum = 25;
        this.currentLap = 1;

        this.boundingBoxHelper = null;

        this.marker = null;

        this.init();
    }

    init() {
        const orderU = 2;
        const orderV = 2;
        const texture = new THREE.TextureLoader().load("./images/textures/balloon" + this.textureN + ".jpg");

        const balloonMaterial = new THREE.MeshPhongMaterial({
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

        const surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, balloonMaterial);
                
        for (let i = 0; i < this.nMeshes; i++) {
            const balloonMesh = new THREE.Mesh(surfaceData, balloonMaterial);
            balloonMesh.name = "surface";
            balloonMesh.receiveShadow = true;
            balloonMesh.castShadow = true;
            balloonMesh.rotation.x = Math.PI / 2;
            balloonMesh.rotation.z = i / 6 * 2 * Math.PI;
            balloonMesh.position.x = this.xPos;
            balloonMesh.position.y = this.yPos;
            balloonMesh.position.z = this.zPos;
            this.balloonGroup.add(balloonMesh);
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
                this.balloonGroup.add(boxMesh);
            }
        }

        const basketGeometry = new THREE.BoxGeometry(1.2, 1, 1.2);
        const basketMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" });
        const basketMesh = new THREE.Mesh(basketGeometry, basketMaterial);
        basketMesh.name = "basket";
        basketMesh.position.x = this.xPos;
        basketMesh.position.y = this.yPos - 4;
        basketMesh.position.z = this.zPos;
        this.balloonGroup.add(basketMesh);
        const boundingBox = new THREE.Box3().setFromObject(this.balloonGroup);
        this.boundingBoxHelper = new THREE.Box3Helper(boundingBox, 0xffff00);
        this.boundingBoxHelper.name = "boundingBoxHelper";
        this.balloonGroup.add(this.boundingBoxHelper);

        const markerGeometry = new THREE.SphereGeometry(0.5,64,64);
        const markerMaterial = new THREE.MeshPhongMaterial({color: "#0000ff"});
        this.marker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.marker.scale.set(1,0.25,1);
        this.marker.name = "marker";
        this.marker.position.x = this.xPos;
        this.marker.position.y = -4;
        this.marker.position.z = this.zPos;
        this.marker.visible = false;
        
        this.app.scene.add(this.marker);
        this.app.scene.add(this.balloonGroup);
    }

    setPosition([xPos, yPos, zPos]) {
        this.xPos = xPos;
        this.yPos = yPos + 5;
        this.zPos = zPos;

        const positionOffsets = {
            basket: { x: 0, y: -4, z: 0 },
            cable00: { x: -0.5, y: -3, z: -0.5 },
            cable01: { x: 0.5, y: -3, z: 0.5 },
            cable10: { x: 0.5, y: -3, z: -0.5 },
            cable11: { x: -0.5, y: -3, z: 0.5 },
            marker: { x: 0, y: -6, z: 0},
            default: { x: 0, y: 0, z: 0 }
        };
        
        let typeBalloon = this.balloonGroup.type;

        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            const child = this.balloonGroup.children[i];
            const offset = positionOffsets[child.name] || positionOffsets.default;
            child.position.set(this.xPos + offset.x, this.yPos + offset.y, this.zPos + offset.z);
        }

        const markerOffset = positionOffsets[this.marker.name] || positionOffsets.default;
        this.marker.visible = true;      
        this.marker.position.set(this.xPos + markerOffset.x, this.yPos + markerOffset.y, this.zPos + markerOffset.z);

        if (typeBalloon === "HUMAN") {
            this.marker.material = new THREE.MeshPhongMaterial({ color: "#ff0000" });
            this.marker.material.needsUpdate = true;
        }

        this.moveBoundingBox();
        this.initCheckpoints();
    }

    setCamera(camera) {
        switch (this.app.activeCameraName) {
            case 'BalloonFirstPerson':
                this.offsetY = 5;
                break;
            case 'BalloonThirdPerson':
                this.offsetY = 1;
                break;
            default:
                break;
        }

        this.camera = camera;
    }

    updateFirstPersonCamera() {
        this.offsetY = 1;
        let positionOffsetX = 0;
        let positionOffsetZ = 0;
        let offset = 3;

        switch (this.direction) {
            case this.DIRECTIONS.NORTH:
                this.offsetX = 0;
                this.offsetZ = -4;
                positionOffsetX = 0;
                positionOffsetZ = - offset;
                break;
            case this.DIRECTIONS.EAST:
                this.offsetX = 4;
                this.offsetZ = 0;
                positionOffsetX = offset;
                positionOffsetZ = 0;
                break;
            case this.DIRECTIONS.SOUTH:
                this.offsetX = 0;
                this.offsetZ = 4;
                positionOffsetX = 0;
                positionOffsetZ = offset;
                break;
            case this.DIRECTIONS.WEST:
                this.offsetX = -4;
                this.offsetZ = 0;
                positionOffsetX = - offset;
                positionOffsetZ = 0;
                break;
            }
            
        this.camera.position.set(this.xPos + positionOffsetX, this.yPos + this.offsetY, this.zPos + positionOffsetZ);
        this.camera.target = new THREE.Vector3(this.xPos + this.offsetX, this.yPos, this.zPos + this.offsetZ);
        this.app.updateCameraTarget();
    }

    updateThirdPersonCamera() {
        switch (this.direction) {
            case this.DIRECTIONS.NORTH:
                this.offsetX = 0;
                this.offsetZ = 8;
                break;
            case this.DIRECTIONS.EAST:
                this.offsetX = -8;
                this.offsetZ = 0;
                break;
            case this.DIRECTIONS.SOUTH:
                this.offsetX = 0;
                this.offsetZ = -8;
                break;
            case this.DIRECTIONS.WEST:
                this.offsetX = 8;
                this.offsetZ = 0;
                break;
        }

        this.camera.position.set(this.xPos + this.offsetX, this.yPos + this.offsetY, this.zPos + this.offsetZ);
        this.camera.target = new THREE.Vector3(this.xPos, this.yPos, this.zPos);
        this.app.updateCameraTarget();
    }

    nearestPoint(check) {
        let finalPoint = this.trackPoints[0];
        let distance = Number.MAX_SAFE_INTEGER;
        let index = 0;

        for (let i = 0; i < this.transformedPoints.length; i++) {
            const point = this.transformedPoints[i];
            let distancePoints = Math.sqrt(Math.pow(point.x - this.xPos, 2) + Math.pow(point.z - this.zPos, 2));
            if (distancePoints < distance) {
                distance = distancePoints;
                finalPoint = point;
                index = i;
            }
        }

        if (check) {
            finalPoint = this.transformedPoints[index - 10];
        }
        
        this.xPos = finalPoint.x;
        this.zPos = finalPoint.z;

        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            this.balloonGroup.children[i].position.x = this.xPos;
            this.balloonGroup.children[i].position.z = this.zPos;
        }

        this.marker.position.x = this.xPos;
        this.marker.position.z = this.zPos;
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

        this.nearestPoint(false);

        return false;
    }

    initCheckpoints() {
        this.checkpoints = this.app.contents.track.path.getPoints(this.checkpointsNum).map(point => {
            let vector = new THREE.Vector3(point.x, point.y, point.z);
            this.app.contents.track.curve.localToWorld(vector);
            return vector;
        });

        this.currentCheckpointIndex = 0;
    }

    checkcurrentCheckpoint() {
        let nextCheckpoint = this.checkpoints[this.currentCheckpointIndex];
        let distance = Math.sqrt(Math.pow(nextCheckpoint.x - this.xPos, 2) + Math.pow(nextCheckpoint.z - this.zPos, 2));

        if (distance < this.distanceCheckpoint) {
            this.currentCheckpointIndex++;
            return true;
        }

        if (this.currentCheckpointIndex >= this.checkpointsNum) {
            this.currentCheckpointIndex = 0;
            this.currentLap++;
        }

        return false;
    }

    moveBoundingBox() {
        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            const child = this.balloonGroup.children[i];
            if (child.name === 'boundingBoxHelper') {
                this.balloonGroup.remove(child);
                const boundingBox = new THREE.Box3().setFromObject(this.balloonGroup);
                this.boundingBoxHelper = new THREE.Box3Helper(boundingBox, 0xffff00);
                this.boundingBoxHelper.name = "boundingBoxHelper";
                this.balloonGroup.add(this.boundingBoxHelper);
            }
        }
    }
    
    moveWind() {
        this.checkcurrentCheckpoint();

        if (this.checkPosition()) {
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
        if (this.yPos + 0.5 < this.maxHeight) {
            this.yPos += 0.5;
            this.offsetY += 0.2;
            for (let i = 0; i < this.balloonGroup.children.length; i++) {
                if (this.balloonGroup.children[i].name !== 'marker') {
                    this.balloonGroup.children[i].position.y += 0.5;
                }
            }
            this.moveBoundingBox();
        }
    }

    moveDown() {
        if (this.yPos - 0.5 > this.minHeight) {
            this.yPos -= 0.5;
            this.offsetY -= 0.2;
            for (let i = 0; i < this.balloonGroup.children.length; i++) {
                if (this.balloonGroup.children[i].name !== 'marker') {
                    this.balloonGroup.children[i].position.y -= 0.5;
                }    
            }
            this.moveBoundingBox();
        }
    }

    moveLeft() {
        this.xPos -= 0.1;
        this.direction = this.DIRECTIONS.WEST;
        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            this.balloonGroup.children[i].position.x -= 0.1;
        }
        this.marker.position.x -= 0.1;
        this.moveBoundingBox();
    }

    moveRight() {
        this.xPos += 0.1;
        this.direction = this.DIRECTIONS.EAST;
        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            this.balloonGroup.children[i].position.x += 0.1;
        }
        this.marker.position.x += 0.1;
        this.moveBoundingBox();
    }

    moveForward() {
        this.zPos -= 0.1;
        this.direction = this.DIRECTIONS.NORTH;
        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            this.balloonGroup.children[i].position.z -= 0.1;
        }
        this.marker.position.z -= 0.1;
        this.moveBoundingBox();
    }

    moveBackward() {
        this.zPos += 0.1;
        this.direction = this.DIRECTIONS.SOUTH;
        for (let i = 0; i < this.balloonGroup.children.length; i++) {
            this.balloonGroup.children[i].position.z += 0.1;
        }
        this.marker.position.z += 0.1;
        this.moveBoundingBox();
    }

    checkCollision(obstacles) {
        for (let i = 0; i < obstacles.length; i++) {
            let obstacle = obstacles[i];
            let boundingBox = new THREE.Box3().setFromObject(obstacle.mesh);
            let collision = boundingBox.intersectsBox(this.boundingBoxHelper.box);

            if (collision) {
                this.nearestPoint(true);
            }
        }
    }

    update(obstacles) {
        if (this.camera) {
            switch (this.app.activeCameraName) {
                case 'BalloonFirstPerson':
                    this.updateFirstPersonCamera();
                    break;
                case 'BalloonThirdPerson':
                    this.updateThirdPersonCamera();
                    break;
                default:
                    break;
            }
        }

        this.checkCollision(obstacles);
    }
}

export { MyBalloon };