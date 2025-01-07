import * as THREE from "three";
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyRoute } from "./MyRoute.js";

class MyBalloon {
    constructor(app, type, index, xPos, yPos, zPos, textureN) {
        //initializes the app
        this.app = app;
        //initializes the type
        this.type = type;
        //initializes the index
        this.index = index;
        // intializes the xpos
        this.xPos = xPos;
        // intializes the ypos
        this.yPos = yPos;
        // intializes the zpos
        this.zPos = zPos;
        // initilaizs the texture
        this.textureN = textureN;

        // offsets for x,y & z
        this.offsetX = 0;
        this.offsetY = 0;
        this.offsetZ = 0;

        // max height for the balloon
        this.maxHeight = 18;
        // min height for the balloon
        this.minHeight = 4;

        //balloon radius
        this.radius = 0.5;
        this.slices = 64;
        this.stacks = 64;
        this.nMeshes = 6;

        //texture values
        this.samplesU = 64;
        this.samplesV = 64;

        //initializes the nurbsbuilder for surfaces
        this.builder = new MyNurbsBuilder();

        //creates the balloonGroup
        this.balloonGroup = new THREE.Group();
        this.balloonGroup.type = this.type;
        this.balloonGroup.index = this.index;

        // Creates the up part of the balloon
        this.upPartGroup = new THREE.Group();
        // creates the down part of the balloon
        this.downPartGroup = new THREE.Group();

        // initializes trackpoints
        this.trackPoints = null;
        //distance treshold
        this.distanceTreshold = 5.0;

        //directions
        this.DIRECTIONS = {
            NORTH: 0,
            EAST: 1,
            SOUTH: 2,
            WEST: 3
        };


        // first direction is north
        this.direction = this.DIRECTIONS.NORTH;

        // attributes related to the menu 
        this.checkpoints = null;
        this.currentCheckpointIndex = 0;
        this.distanceCheckpoint = 8.0;
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

        // attributes related to the AI ballon
        this.startTimeAi = null;
        this.initialPosition = null;
        this.multiplierFactor = 1;
        this.marker = null;

        this.init();
    }

    // initializes the balloon
    init() {
        const orderU = 2;
        const orderV = 2;
        const texture = new THREE.TextureLoader().load("./images/textures/balloon" + this.textureN + ".jpg"); // Load the texture

        const balloonMaterial = new THREE.MeshPhongMaterial({ // Create the material
            color: "#ffffff",
            specular: "#111111",
            emissive: "#000000",
            shininess: 90,
            map: texture,
            side: THREE.DoubleSide
        });

        const controlPoints = [ // Define the control points
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

        const surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, balloonMaterial); // Build the surface

        for (let i = 0; i < this.nMeshes; i++) { // Create the surfaces
            const balloonMesh = new THREE.Mesh(surfaceData, balloonMaterial); // Create the mesh
            balloonMesh.name = "surface";
            balloonMesh.receiveShadow = true;
            balloonMesh.castShadow = true;
            balloonMesh.rotation.x = Math.PI / 2;
            balloonMesh.rotation.z = i / 6 * 2 * Math.PI;
            this.upPartGroup.add(balloonMesh);  // Add the mesh to the group
        }

        for (let i = 0; i < 2; i++) { // Create the cables
            for (let j = 0; j < 2; j++) {
                const boxGeometry = new THREE.BoxGeometry(0.1, 1, 0.1); // Create the geometry
                const boxMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" }); // Create the material
                const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial); // Create the mesh
                boxMesh.name = "cable" + i + j;
                boxMesh.position.x = i === 0 ? - 0.5 : 0.5;
                boxMesh.position.y = - 3;
                boxMesh.position.z = j === 0 ? - 0.5 : 0.5;
                boxMesh.receiveShadow = true;
                boxMesh.castShadow = true;
                this.downPartGroup.add(boxMesh); // Add the mesh to the group
            }
        }

        const basketGeometry = new THREE.BoxGeometry(1.2, 1, 1.2); // Create the basket
        const basketMaterial = new THREE.MeshPhongMaterial({ color: "#540e09" }); // Create the material
        const basketMesh = new THREE.Mesh(basketGeometry, basketMaterial); // Create the mesh
        basketMesh.name = "basket";
        basketMesh.position.y = - 4;
        basketMesh.receiveShadow = true;
        basketMesh.castShadow = true;
        this.downPartGroup.add(basketMesh);

        const spriteTexture = new THREE.TextureLoader().load("images/balloonLOD.png"); // Load the sprite texture
        const spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture }); // Create the sprite material
        this.lowDetailSprite = new THREE.Sprite(spriteMaterial); // Create the sprite
        this.lowDetailSprite.scale.set(4, 5, 4);
        this.lowDetailSprite.visible = false;

        this.balloonGroup.add(this.upPartGroup); // Add the up part group to the balloon group
        this.balloonGroup.add(this.downPartGroup); // Add the down part group to the balloon group
        this.balloonGroup.add(this.lowDetailSprite); // Add the sprite to the balloon group
        this.balloonGroup.position.set(this.xPos, this.yPos, this.zPos); // Set the position of the balloon group

        this.app.scene.add(this.balloonGroup); // Add the balloon group to the scene
    }

    // sets the position of the balloon
    setPosition([xPos, yPos, zPos], position) {
        const color = position === "RED" ? "#ff0000" : "#0000ff"; // Define the color of the marker
        const markerGeometry = new THREE.SphereGeometry(0.5, 64, 64); // Create the geometry of the marker
        const markerMaterial = new THREE.MeshPhongMaterial({ color: color }); // Create the material of the marker
        this.marker = new THREE.Mesh(markerGeometry, markerMaterial); // Create the marker
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
        this.balloonGroup.position.set(this.xPos, this.yPos, this.zPos); // Set the position of the balloon group
        this.marker.position.set(this.xPos, this.yPos - 6, this.zPos); // Set the position of the marker
        this.app.scene.add(this.marker); // Add the marker to the scene

        this.initCheckpoints(); // Initialize the checkpoints
    }

    // removes the marker
    removeMarker() {
        if (this.marker) {
            this.app.scene.remove(this.marker);
    
            if (this.marker.geometry) {
                this.marker.geometry.dispose(); // Dispose the geometry
            }
            if (this.marker.material) {
                this.marker.material.dispose(); // Dispose the material
            }
    
            this.marker = null;
        }
    }
    
    // sets the camera
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

    // updates the first person camera
    updateFirstPersonCamera() {
        this.offsetY = 1;
        let positionOffsetX = 0;
        let positionOffsetZ = 0;
        let offset = 3;

        switch (this.direction) { // Set the offset values
            case this.DIRECTIONS.NORTH: // North
                this.offsetX = 0;
                this.offsetZ = -4;
                positionOffsetX = 0;
                positionOffsetZ = - offset;
                break;
            case this.DIRECTIONS.EAST: // East
                this.offsetX = 4;
                this.offsetZ = 0;
                positionOffsetX = offset;
                positionOffsetZ = 0;
                break;
            case this.DIRECTIONS.SOUTH: // South
                this.offsetX = 0;
                this.offsetZ = 4;
                positionOffsetX = 0;
                positionOffsetZ = offset;
                break;
            case this.DIRECTIONS.WEST: // West
                this.offsetX = -4;
                this.offsetZ = 0;
                positionOffsetX = - offset;
                positionOffsetZ = 0;
                break;
        }

        this.camera.position.set(this.xPos + positionOffsetX, this.yPos + this.offsetY, this.zPos + positionOffsetZ); // Set the position of the camera
        this.camera.target = new THREE.Vector3(this.xPos + this.offsetX, this.yPos, this.zPos + this.offsetZ); // Set the target of the camera
        this.app.updateCameraTarget(); // Update the camera target
    }

    // updates the third person camera
    updateThirdPersonCamera() {
        switch (this.direction) { // Set the offset values
            case this.DIRECTIONS.NORTH: // North
                this.offsetX = 0;
                this.offsetZ = 8;
                break;
            case this.DIRECTIONS.EAST: // East
                this.offsetX = -8;
                this.offsetZ = 0;
                break;
            case this.DIRECTIONS.SOUTH: // South
                this.offsetX = 0;
                this.offsetZ = -8;
                break;
            case this.DIRECTIONS.WEST: // West
                this.offsetX = 8;
                this.offsetZ = 0;
                break;
        }

        this.camera.position.set(this.xPos + this.offsetX, this.yPos + this.offsetY, this.zPos + this.offsetZ); // Set the position of the camera
        this.camera.target = new THREE.Vector3(this.xPos, this.yPos, this.zPos); // Set the target of the camera
        this.app.updateCameraTarget(); // Update the camera target
    }

    // calculates the nearest point
    nearestPoint() {
        let finalPoint = this.trackPoints[0];
        let distance = Number.MAX_SAFE_INTEGER; // Maximum safe integer
        let index = 0;

        for (let i = 0; i < this.transformedPoints.length; i++) { // Calculate the nearest point
            const point = this.transformedPoints[i];
            let distancePoints = Math.sqrt(Math.pow(point.x - this.xPos, 2) + Math.pow(point.z - this.zPos, 2)); // Calculate the distance
            if (distancePoints < distance) {
                distance = distancePoints;
                finalPoint = point;
                index = i;
            }
        }

        finalPoint = this.transformedPoints[(index - 30 + 10000) % 10000]; // Calculate the final point

        this.xPos = finalPoint.x;
        this.zPos = finalPoint.z;

        this.balloonGroup.position.set(this.xPos, this.yPos, this.zPos); // Set the position of the balloon group

        this.marker.position.x = this.xPos;
        this.marker.position.z = this.zPos;

        if(this.extraLives > 0){ // Check if there are extra lives
            this.extraLives--;
        }
        else if(this.extraLives <= 0){ // Check if there are no extra lives
            this.penaltySeconds = this.app.contents.penaltySeconds * 1000;
        }

    }

    // checks the position
    checkPosition() {
        this.trackPoints = this.app.contents.track.path.getPoints(10000); // Get the track points

        this.transformedPoints = this.trackPoints.map(point => { // Transform the points
            let vector = new THREE.Vector3(point.x, point.y, point.z);
            this.app.contents.track.curve.localToWorld(vector);
            return vector;
        });

        for (let point of this.transformedPoints) { // Check the position
            let distance = Math.sqrt(Math.pow(point.x - this.xPos, 2) + Math.pow(point.z - this.zPos, 2)); // Calculate the distance
            if (distance < this.distanceTreshold) { // Check if the distance is less than the threshold
                return true;
            }
        }

        this.nearestPoint(); // Calculate the nearest point

        return false;
    }

    // initializes the checkpoints
    initCheckpoints() {
        this.checkpoints = this.app.contents.track.path.getPoints(this.checkpointsNum).map(point => { // Get the checkpoints
            let vector = new THREE.Vector3(point.x, point.y, point.z); // Create the vector
            this.app.contents.track.curve.localToWorld(vector); // Local to world
            return vector;
        });
        this.currentCheckpointIndex = 0;
    }

    // checks the current checkpoint
    checkcurrentCheckpoint() {
        let nextCheckpoint = this.checkpoints[this.currentCheckpointIndex]; // Get the next checkpoint
        let distance = Math.sqrt(Math.pow(nextCheckpoint.x - this.xPos, 2) + Math.pow(nextCheckpoint.z - this.zPos, 2)); // Calculate the distance

        if (distance < this.distanceCheckpoint) { // Check if the distance is less than the checkpoint
            this.currentCheckpointIndex++;
            return true;
        }

        if (this.currentCheckpointIndex >= this.checkpointsNum) { // Check if the current checkpoint index is greater than the number of checkpoints
            this.currentCheckpointIndex = 0;
            this.currentLap++;
            this.lastPowerUpObject = null;
        }

        return false;
    }

    // creates the route
    createRoute() {
        this.route = new MyRoute(this.app, this.initialPosition); // Create the route
        
        let value  = Math.floor((this.index) %10);
        if(value == 2) {
            this.multiplierFactor = 1.4;
        } else if(value == 0) {
            this.multiplierFactor = 0.6;
        }
    }

    // moves the AI balloon
    moveAiBalloon() {
        this.checkcurrentCheckpoint(); // Check the current checkpoint

        const elapsedTime = Date.now() - this.startTimeAi - this.app.contents.pausedTime; // Calculate the elapsed time
        const time = (elapsedTime % (400000*this.multiplierFactor)) / (400000*this.multiplierFactor); // Calculate the time
        const point = this.route.spline.getPointAt(time); // Get the point

        this.xPos = point.x;
        this.yPos = point.y;
        this.zPos = point.z;
        
        this.marker.position.set(point.x, 0, point.z); // Set the position of the marker
        this.balloonGroup.position.set(point.x, point.y, point.z); // Set the position of the balloon group
    }

    // moves the balloon
    moveWind() {
        this.checkcurrentCheckpoint(); // Check the current checkpoint

        if (this.penaltySeconds > 0) { // Check if there is a penalty
            this.penaltySeconds -= 30;
        } else if (this.checkPosition()) { // Check the position
            if (this.yPos <= 8 && this.yPos > 5) {
                this.moveForward(); // Move the balloon forward
            } else if (this.yPos <= 11 && this.yPos > 8) {
                this.moveBackward(); // Move the balloon backward
            } else if (this.yPos <= 14 && this.yPos > 11) {
                this.moveRight(); // Move the balloon right
            } else if (this.yPos <= 17 && this.yPos > 14) {
                this.moveLeft(); // Move the balloon left
            }
        }
    }

    // Move the balloon up
    moveUp() {
        if (this.yPos + 0.5 < this.maxHeight) { // Check if the balloon is below the maximum height
            clearTimeout(this.restoreTimer); // Clear the restore timer
            this.sizeModifiedUp = true;
            this.sizeModifiedDown = false;
            this.targetScale = 1.15;
            this.yPos += 0.5;
            this.offsetY += 0.2;
            this.balloonGroup.position.y += 0.5;
            this.updateScale(); // Update the scale
        }
    }

    // Move the balloon down
    moveDown() {
        if (this.yPos - 0.5 > this.minHeight) { // Check if the balloon is above the minimum height
            clearTimeout(this.restoreTimer); // Clear the restore timer
            this.sizeModifiedDown = true;
            this.sizeModifiedUp = false;
            this.targetScale = 1/1.15;
            this.yPos -= 0.5;
            this.offsetY -= 0.2;
            this.balloonGroup.position.y -= 0.5;
            this.updateScale(); // Update the scale
        }
    }

    // restores the size
    restoreSize() {
        if (this.sizeModifiedUp || this.sizeModifiedDown) { // Check if the size is modified
            this.targetScale = 1;
            this.updateScale(0.001);

            if (Math.abs(this.currentScale - 1) < 0.0002) { // Check if the current scale is close to 1
                this.currentScale = 1;
                this.sizeModifiedUp = false;
                this.sizeModifiedDown = false;
            }
        }
    }

    // updates the scale
    updateScale(stepSize = 0.1) {
        if (this.currentScale !== this.targetScale) { // Check if the current scale is different from the target scale
            if (this.currentScale < this.targetScale) {
                this.currentScale = Math.min( // Update the scale
                    this.currentScale + stepSize,
                    this.targetScale
                );
            } else {
                this.currentScale = Math.max( // Update the scale
                    this.currentScale - stepSize,
                    this.targetScale
                );
            }
            this.upPartGroup.scale.set( // Set the scale of the up part group
                this.currentScale,
                1,
                this.currentScale
            );
        }
    } 

    //moves balloon left
    moveLeft() {
        //position in x decreases
        this.xPos -= 0.1;
        this.direction = this.DIRECTIONS.WEST;
        this.marker.position.x -= 0.1;
        // change balloonGroup
        this.balloonGroup.position.x -= 0.1;
    }

    // moves balloon right
    moveRight() {
        //position in x increases
        this.xPos += 0.1;
        this.direction = this.DIRECTIONS.EAST;
        this.marker.position.x += 0.1;
        // change balloonGrou
        this.balloonGroup.position.x += 0.1;
    }

    // moves balloon forward
    moveForward() {
        //position in z decreases
        this.zPos -= 0.1;
        this.direction = this.DIRECTIONS.NORTH;
        this.marker.position.z -= 0.1;
        // change balloonGroup
        this.balloonGroup.position.z -= 0.1;
    }

    // move balloon backwards
    moveBackward() {
        //position in z increases
        this.zPos += 0.1;
        // direction south
        this.direction = this.DIRECTIONS.SOUTH;
        //change marker
        this.marker.position.z += 0.1;
        // change balloonGroup
        this.balloonGroup.position.z += 0.1;
    }

    // updates the first person camera and the third person camera
    update() {
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
    }

    // function to update the lod from the ballon
    updateLOD(camera) {
        // distance where the lod updates
        const distanceThreshold = 50;
    
        const balloonPosition = new THREE.Vector3();
        this.balloonGroup.getWorldPosition(balloonPosition); // Get world position of the balloon group
    
        //  distance from the camera to the balloon
        const distance = balloonPosition.distanceTo(camera.position);
    
        //shows the highly detailed view if close
        if (distance > distanceThreshold) {
            this.upPartGroup.visible = false;
            this.downPartGroup.visible = false;
            this.lowDetailSprite.visible = true;
        } else {
            // If the camera is close, show the detailed parts
            this.upPartGroup.visible = true;
            this.downPartGroup.visible = true;
            this.lowDetailSprite.visible = false;
        }
    }
}

export { MyBalloon };