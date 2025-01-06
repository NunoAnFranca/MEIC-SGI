import * as THREE from "three";
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyRoute } from "./MyRoute.js";

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

        this.upPartGroup = new THREE.Group();
        this.downPartGroup = new THREE.Group();

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
        this.extraLives = 0;
        this.lastPowerUpObject = null;
        this.penaltySeconds = null;
        this.sizeModifiedUp = false;
        this.sizeModifiedDown = false;
        this.currentScale = 1;
        this.targetScale = 1;
        this.restoreTimer = null;

        this.startTimeAi = null;
        this.initialPosition = null;
        this.multiplierFactor = 1;
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
            this.upPartGroup.add(balloonMesh);
        }

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const boxGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
                const boxMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" });
                const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                boxMesh.name = "cable" + i + j;
                boxMesh.position.x = i === 0 ? - 0.5 : 0.5;
                boxMesh.position.y = - 3;
                boxMesh.position.z = j === 0 ? - 0.5 : 0.5;
                boxMesh.receiveShadow = true;
                boxMesh.castShadow = true;
                this.downPartGroup.add(boxMesh);
            }
        }

        const basketGeometry = new THREE.BoxGeometry(1.2, 1, 1.2);
        const basketMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" });
        const basketMesh = new THREE.Mesh(basketGeometry, basketMaterial);
        basketMesh.name = "basket";
        basketMesh.position.y = - 4;
        basketMesh.receiveShadow = true;
        basketMesh.castShadow = true;
        this.downPartGroup.add(basketMesh);

        this.balloonGroup.add(this.upPartGroup);
        this.balloonGroup.add(this.downPartGroup);
        this.balloonGroup.position.set(this.xPos, this.yPos, this.zPos);

        this.app.scene.add(this.balloonGroup);
    }

    setPosition([xPos, yPos, zPos], position) {
        const color = position === "RED" ? "#ff0000" : "#0000ff";
        const markerGeometry = new THREE.SphereGeometry(0.5, 64, 64);
        const markerMaterial = new THREE.MeshPhongMaterial({ color: color });
        this.marker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.marker.scale.set(1, 0.25, 1);
        this.marker.name = "marker";
        this.marker.position.x = this.xPos;
        this.marker.position.y = -4;
        this.marker.position.z = this.zPos;
        this.marker.visible = false;
        this.marker.visible = true;

        this.xPos = xPos;
        this.yPos = yPos + 5;
        this.zPos = zPos;
        this.balloonGroup.scale.set(1, 1, 1);
        this.balloonGroup.position.set(this.xPos, this.yPos, this.zPos);
        this.marker.position.set(this.xPos, this.yPos - 6, this.zPos);
        this.app.scene.add(this.marker);

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

    nearestPoint() {
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

        finalPoint = this.transformedPoints[(index - 30 + 10000) % 10000];

        this.xPos = finalPoint.x;
        this.zPos = finalPoint.z;

        this.balloonGroup.position.set(this.xPos, this.yPos, this.zPos);

        this.marker.position.x = this.xPos;
        this.marker.position.z = this.zPos;

        if(this.extraLives > 0){
            this.extraLives--;
        }
        else if(this.extraLives <= 0){
            this.penaltySeconds = this.app.contents.penaltySeconds * 1000;
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

    initCheckpoints() {
        this.checkpoints = this.app.contents.track.path.getPoints(16).map(point => {
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
            this.lastPowerUpObject = null;
        }

        return false;
    }

    createRoute() {
        this.route = new MyRoute(this.app, this.initialPosition);
        
        let value  = Math.floor((this.index) %10);
        if(value == 2) {
            this.multiplierFactor = 1.5;
        } else if(value == 0) {
            this.multiplierFactor = 0.5;
        }
    }

    moveAiBalloon() {
        const elapsedTime = Date.now() - this.startTimeAi - this.app.contents.pausedTime;
        const time = (elapsedTime % (400000*this.multiplierFactor)) / (400000*this.multiplierFactor);
        const point = this.route.spline.getPointAt(time);

        this.xPos = point.x;
        this.yPos = point.y;
        this.zPos = point.z;
        
        this.marker.position.set(point.x, 0, point.z);
        this.balloonGroup.position.set(point.x, point.y, point.z);
    }

    moveWind() {
        this.checkcurrentCheckpoint();

        if (this.penaltySeconds > 0) {
            this.penaltySeconds -= 30;
        } else if (this.checkPosition()) {
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
            clearTimeout(this.restoreTimer);
            this.sizeModifiedUp = true;
            this.sizeModifiedDown = false;
            this.targetScale = 1.15;
            this.yPos += 0.5;
            this.offsetY += 0.2;
            this.balloonGroup.position.y += 0.5;
            this.updateScale();
        }
    }
    
    moveDown() {
        if (this.yPos - 0.5 > this.minHeight) {
            clearTimeout(this.restoreTimer);
            this.sizeModifiedDown = true;
            this.sizeModifiedUp = false;
            this.targetScale = 1/1.15;
            this.yPos -= 0.5;
            this.offsetY -= 0.2;
            this.balloonGroup.position.y -= 0.5;
            this.updateScale();
        }
    }
    
    restoreSize() {
        if (this.sizeModifiedUp || this.sizeModifiedDown) {
            this.targetScale = 1;
            this.updateScale(0.001);

            if (Math.abs(this.currentScale - 1) < 0.0002) {
                this.currentScale = 1;
                this.sizeModifiedUp = false;
                this.sizeModifiedDown = false;
            }
        }
    }
    
    updateScale(stepSize = 0.1) {
        if (this.currentScale !== this.targetScale) {
            if (this.currentScale < this.targetScale) {
                this.currentScale = Math.min(
                    this.currentScale + stepSize,
                    this.targetScale
                );
            } else {
                this.currentScale = Math.max(
                    this.currentScale - stepSize,
                    this.targetScale
                );
            }
            this.upPartGroup.scale.set(
                this.currentScale,
                1,
                this.currentScale
            );
        }
    } 

    moveLeft() {
        this.xPos -= 0.1;
        this.direction = this.DIRECTIONS.WEST;
        this.marker.position.x -= 0.1;
        this.balloonGroup.position.x -= 0.1;
    }

    moveRight() {
        this.xPos += 0.1;
        this.direction = this.DIRECTIONS.EAST;
        this.marker.position.x += 0.1;
        this.balloonGroup.position.x += 0.1;
    }

    moveForward() {
        this.zPos -= 0.1;
        this.direction = this.DIRECTIONS.NORTH;
        this.marker.position.z -= 0.1;
        this.balloonGroup.position.z -= 0.1;
    }

    moveBackward() {
        this.zPos += 0.1;
        this.direction = this.DIRECTIONS.SOUTH;
        this.marker.position.z += 0.1;
        this.balloonGroup.position.z += 0.1;
    }

    checkCollisionPowerUps(powerUps) {
        for (let i = 0; i < powerUps.length; i++) {
            let powerUp = powerUps[i];
            let boundingBox = new THREE.Box3().setFromObject(powerUp.mesh);
            let collision = boundingBox.intersectsBox(new THREE.Box3().setFromObject(this.balloonGroup));

            if (collision) {
                let upCollision = boundingBox.intersectsBox(new THREE.Box3().setFromObject(this.upPartGroup));
                let downCollision = boundingBox.intersectsBox(new THREE.Box3().setFromObject(this.downPartGroup));
                if (upCollision || downCollision) {
                    if(powerUp !== this.lastPowerUpObject)
                        this.extraLives++;
                    this.lastPowerUpObject = powerUp;
                }
            }
        }
    }

    update(powerUps) {

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
        this.checkCollisionPowerUps(powerUps);
    }
}

export { MyBalloon };