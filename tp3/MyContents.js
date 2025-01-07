import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTrack } from "./MyTrack.js";
import { MyParser } from "./MyParser.js";
import { MyMenu } from "./MyMenu.js";
import { MyBalloon } from "./MyBalloon.js";
import { MyFirework } from "./MyFirework.js";
import { MyShader } from "./MyShader.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
    /**
         constructs the object
         @param {MyApp} app The application object
      */
    constructor(app) {
        this.app = app;
        this.axis = null;
        this.mapSize = 4096;

        // INitializes the ray caster
        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 40

        // initializes the pointer
        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"

        // Creates track variable
        this.track = null;
        this.humanBalloons = {};
        this.aiBalloons = {};

        // State machine for the game
        this.GAME_STATE = {
            PREPARATION: "PREPARATION",
            READY: "READY",
            CHOOSE_HUMAN_BALLOON: "CHOOSE_HUMAN_BALLOON",
            CHOOSE_AI_BALLOON: "CHOOSE_AI_BALLOON",
            CHOOSE_INITIAL_POSITION: "CHOOSE_INITIAL_POSITION",
            RUNNING: "RUNNING",
            PAUSED: "PAUSED",
            FINISHED: "FINISHED"
        }

        // Directions for the Player balloon
        this.DIRECTIONS = {
            0: "NORTH",
            1: "EAST",
            2: "SOUTH",
            3: "WEST"
        };

        // different tyypes
        this.PLAYER_TYPE = {
            HUMAN: "HUMAN",
            AI: "AI"
        }

        // creates variables for the human and AI
        this.players = {
            [this.PLAYER_TYPE.HUMAN]: null,
            [this.PLAYER_TYPE.AI]: null
        };

        //Change back to PREPARATION
        this.currentGameState = this.GAME_STATE.PREPARATION;
        this.fireworks = [];

        // initial menu variables
        this.totalLaps = 1;
        this.penaltySeconds = 1;
        this.playerUsername = "Nan";
        this.namePlayerBalloon = null;
        this.nameOponentBalloon = null;

        // Defines the names of the three main cameras
        this.threeMainCameraNames = ["BalloonFirstPerson", "BalloonThirdPerson", "Perspective"];
        // Sets Balloon first person as the first camera
        this.threeMainCameraIndex = 0;
        // array with all lights in the scene
        this.sceneLights = [];
        // lights on in the scene
        this.sceneLightsOn = true;
        // lights casting shadows
        this.sceneCastingShadows = true;
        this.startTimeAi = null;

        this.winner = null;
        this.loser = null;

        this.shaders = {};

        // register events
        document.addEventListener(
            "pointerdown",
            // list of events: https://developer.mozilla.org/en-US/docs/Web/API/Element
            this.onPointerMove.bind(this)
        );
        document.addEventListener(
            "pointermove",
            this.onPointerMove.bind(this)
        );

        // State machine in the game
        document.addEventListener("keydown", (event) => {
            // if the game is ready state and P is pressed game start running
            if (this.currentGameState === this.GAME_STATE.READY) {
                if ((event.key === 'p' || event.key === 'P') && !this.initialPositions[this.PLAYER_TYPE.HUMAN] && !this.initialPositions[this.PLAYER_TYPE.AI]) {
                    // game running
                    this.currentGameState = this.GAME_STATE.RUNNING;
                    // remobe positions from the track
                    this.removeInitialPositions();
                    // set first person as the first camera
                    this.setCamera('BalloonFirstPerson');

                    // timer for the match
                    this.matchTime = new Date().getTime();
                    // creates route for the ai
                    this.players[this.PLAYER_TYPE.AI].createRoute();
                    // timer for AI
                    this.players[this.PLAYER_TYPE.AI].startTimeAi = Date.now();

                    //Initializes paused time as 0
                    this.pausedTime = 0;

                    //  If an interval already exists removes it
                    if (this.gameInterval) {
                        clearInterval(this.gameInterval);
                    }

                    // creates a new game interval
                    this.gameInterval = setInterval(() => {
                        // if game is running
                        if (this.currentGameState === this.GAME_STATE.RUNNING) {

                            // move player with wind
                            this.players[this.PLAYER_TYPE.HUMAN].moveWind();
                            // move ai with key frame animation
                            this.players[this.PLAYER_TYPE.AI].moveAiBalloon();

                            // animates the obstacles and powerups
                            this.animateObstaclesAndPowerUps();

                            // updates the currenthMatchTime with the new time
                            this.menu.currentMatchTime = Math.floor((new Date().getTime() - this.matchTime - this.pausedTime) / 100);
                            // updates the currentWindVelocity with the new direction
                            this.menu.currentWindVelocity = this.DIRECTIONS[this.players[this.PLAYER_TYPE.HUMAN].direction];
                            // updates the currentGameState with the new state
                            this.menu.currentGameState = this.GAME_STATE.RUNNING;
                            // updates the currentGameState with the new current player laps
                            this.menu.currentLaps = this.players[this.PLAYER_TYPE.HUMAN].currentLap;
                            // updates the currentGameState with the new current extraLives
                            this.menu.currentVouchers = this.players[this.PLAYER_TYPE.HUMAN].extraLives;

                            // function to check game over
                            if (this.checkGameOver()) {
                                // change state to finished
                                this.currentGameState = this.GAME_STATE.FINISHED;
                                this.menu.currentGameState = this.GAME_STATE.FINISHED;
                                // updateGameStatus
                                this.menu.updateGameStatus();
                                // update game over menu
                                this.menu.updateGameOverMenu();
                                // change camera to game over
                                this.app.setActiveCamera("gameOverMenu");
                            }
                            
                            // update blimp menu
                            this.menu.updateBlimpMenu();
                        }
                        // update game status
                        this.menu.updateGameStatus();
                    }, 30);
                }
                // check if game is running
            } else if (this.currentGameState === this.GAME_STATE.RUNNING) {
                if (event.key === 'w' || event.key === 'W') {
                    // if w is pressed move up
                    this.players[this.PLAYER_TYPE.HUMAN].moveUp();
                } else if (event.key === 's' || event.key === 'S') {
                    // if s is pressed move up
                    this.players[this.PLAYER_TYPE.HUMAN].moveDown();
                } else if (event.key === ' ') {
                    // if space is pressed pause time
                    this.pauseStartTime = new Date().getTime();
                    this.currentGameState = this.GAME_STATE.PAUSED;
                    this.menu.currentGameState = this.GAME_STATE.PAUSED;
                }
            } else if (this.currentGameState === this.GAME_STATE.PAUSED) {
                // if space is pressed unpause time
                if (event.key === ' ') {
                    this.currentGameState = this.GAME_STATE.RUNNING;
                    this.menu.currentGameState = this.currentGameState;
                    this.pausedTime += (new Date().getTime() - this.pauseStartTime);
                }
            } else if (this.currentGameState === this.GAME_STATE.FINISHED) {
                // if game is finished and escape is pressed return to initialstate
                if (event.key === 'Escape') {
                    this.returnToInitialState();
                // if game is finished and R is pressed return to readystate
                } else if (event.key === 'r' || event.key === 'R') {
                    this.returnToReadyState();
                }
            }
            if ((this.currentGameState === this.GAME_STATE.PAUSED) || (this.currentGameState === this.GAME_STATE.RUNNING)) {
                // if game is running and v is pressed return to cycle between camera
                if (event.key === 'v' || event.key === "V") {
                    this.changeThreeMainCameras();
                // if game is running and escape is pressed return to initialstate
                } else if (event.key === 'Escape') {
                    this.returnToInitialState();
                }
            }
            if (!this.menu.writingUsername) {
                // if player is not writing the name and presses L, change turns on/off the lights
                if (event.key === 'l' || event.key === "L") {
                    this.changeLightsPower();
                // if player is not writing the name and presses L, change turns on/off the shadows
                } else if (event.key === "o" || event.key === "O") {
                    this.changeShadowProjection();
                }
            }
        });
    }

    /**
     * initializes the contents
     */
    init() {
        // create once
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.axis.visible = false;
            this.app.scene.add(this.axis);
        }

        this.reader = new MyParser(this.app);

        this.createFireworkSpots();
        // create temp lights so we can see the objects to not render the entire scene
        this.buildLights();

        // build balloons
        this.buildBalloons();

        this.initialPositions = { // Sets the initial positions
            RED: true,
            BLUE: true
        };

        this.initialPositionsCoords = { // Sets the initial positions coordinates
            RED: [27, 0.8, -15],
            BLUE: [21, 0.8, -15]
        };

        // create the track
        this.track = new MyTrack(this.app);

        this.loader = new THREE.TextureLoader(); // Creates a new texture loader

        this.menu = new MyMenu(this.app, this.loader); // Creates a new menu

        this.createShaders(); // Creates the shaders
    }

    // Captures the images
    captureImages(callback) {
        const canvas = this.app.renderer.domElement;
        const rgbImageBase64 = canvas.toDataURL('image/jpg'); // Converts the canvas to a base64 image
        const rgbImage = new Image(); // Creates a new image
        rgbImage.src = rgbImageBase64; // Sets the source of the image

        rgbImage.onload = () => { // When the image is loaded
            const texture = new THREE.Texture(rgbImage); // Creates a new texture
            texture.needsUpdate = true; // Updates the texture
            callback(texture); // Calls the callback function
        };
    }

    // Creates the shaders
    createShaders() {
        this.shaders["cameraShader"] = new MyShader(this.app, "Camera Shader", "Uses the camera image as texture",
            "shaders/bas.vert", "shaders/bas.frag", {
            uNormalTexture: { type: 't', value: this.loader.load('images/textures/scene.jpg') },
            uGrayScaleTexture: { type: 't', value: this.loader.load('images/textures/scene_grayscale.jpg') },
            displacementScale: { type: 'f', value: 1.0 }
        });

        setInterval(async () => { // Captures the images every 10 seconds
            this.captureImages((texture) => {
                this.shaders["cameraShader"].uniformValues.uNormalTexture.value = texture; // Sets the normal texture
                this.shaders["cameraShader"].uniformValues.uGrayScaleTexture.value = texture; // Sets the grayscale texture
            });
        }, 10000);

        this.shaders["obstacleShader"] = new MyShader(this.app, "Flat Shading", "Uses a constant color to shade the object",
            "shaders/flat.vert", "shaders/flat.frag", {
            timeFactor: { type: 'f', value: 0.0 },
            uTexture: { type: 'sample2D', value: this.loader.load('images/textures/obstacle.jpg') }
        });

        this.shaders["powerUpShader"] = new MyShader(this.app, "Flat Shading", "Uses a constant color to shade the object",
            "shaders/flat.vert", "shaders/flat.frag", {
            timeFactor: { type: 'f', value: 0.0 },
            uTexture: { type: 'sample2D', value: this.loader.load('images/textures/powerup.jpg') }
        });

        this.shaders["basReliefShader"] = new MyShader(this.app, "Bas Relief", "Creates a bas relief effect on the object",
            "shaders/bas.vert", "shaders/bas.frag", {
            uNormalTexture: { type: 'sample2D', value: this.loader.load('images/textures/mona_lisa.jpg') },
            uGrayScaleTexture: { type: 'sample2D', value: this.loader.load('images/textures/mona_lisa_grayscale.jpg') },
            displacementScale: { type: 'float', value: 0.8 }
        });

        this.waitForShaders(); // Waits for the shaders to be ready
    }

    // Waits for the shaders to be ready
    waitForShaders() {
        Object.keys(this.shaders).forEach((shader) => { 
            if (this.shaders[shader].ready === false) {
                setTimeout(this.waitForShaders.bind(this), 100);
                return;
            }

            if (this.shaders[shader] === null || this.shaders[shader] === undefined) {
                return;
            }

            switch (shader) { // Sets the shader for the object
                case "cameraShader":
                    this.track.cameraBillboard.material = this.shaders[shader].material;
                    break;
                case "obstacleShader":
                    for (let obstacle of this.track.obstacles) {
                        obstacle.mesh.material = this.shaders[shader].material;
                    }
                    break;
                case "powerUpShader":
                    for (let powerUp of this.track.powerUps) {
                        powerUp.mesh.material = this.shaders[shader].material;
                    }
                    break;
                case "basReliefShader":
                    this.track.basReliefGroup.children[0].material = this.shaders[shader].material;
                    break;
                default:
                    break;
            }
        });
    }

    // Updates the bounding box of the object
    updateBoundingBox(id, type) {
        switch (type) {
            case this.PLAYER_TYPE.HUMAN:
                this.humanBalloons[id].updateBoundingBoxHelpersVisibility(); // Updates the bounding box of the human balloon
                break;
            case this.PLAYER_TYPE.AI:
                this.aiBalloons[id].updateBoundingBoxHelpersVisibility(); // Updates the bounding box of the AI balloon
                break;
            default:
                break;
        }
    }

    // Builds the lights
    buildLights() {
        // add a point light on top of the model
        this.pointLight = new THREE.PointLight(0xece787, 10, 700, 0.2);
        this.pointLight.position.set(90, 40, 100);
        this.pointLight.castShadow = true;
        this.pointLight.shadow.mapSize.width = this.mapSize;
        this.pointLight.shadow.mapSize.height = this.mapSize;
        this.pointLight.shadow.camera.near = 0.5;
        this.pointLight.shadow.camera.far = 600;
        this.pointLight.shadow.bias = -0.001; // Adjust the bias to a negative value
        this.pointLight.shadow.normalBias = 0.01
        this.sceneLights.push(this.pointLight);
        this.app.scene.add(this.pointLight);

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555) // soft white light
        this.app.scene.add(ambientLight)
    }

    // Builds the balloons
    buildBalloons() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = `${i}${j}`;
                this.humanBalloons[index] = new MyBalloon(this.app, this.PLAYER_TYPE.HUMAN, index, j * 6 + 35, 4, - 6 * (i + 1) - 5, i * 3 + j + 1); // Creates a new human balloon
                this.aiBalloons[index] = new MyBalloon(this.app, this.PLAYER_TYPE.AI, index, j * 6, 4, - 6 * (i + 1) - 5, i * 3 + j + 1); // Creates a new AI balloon
            }
        }
    }

    // Removes the balloons
    removeBalloons() {
        for (const index in this.humanBalloons) { // Removes the human balloons
            const balloon = this.humanBalloons[index];
            this.app.scene.remove(balloon.balloonGroup);
            balloon.removeMarker(); // Removes the marker
            balloon.balloonGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            delete this.humanBalloons[index];
        }

        for (const index in this.aiBalloons) { // Removes the AI balloons
            const balloon = this.aiBalloons[index];
            this.app.scene.remove(balloon.balloonGroup);
            balloon.removeMarker(); // Removes the marker
            balloon.balloonGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            delete this.aiBalloons[index];
        }
    }

    // Builds the initial position
    buildInitialPosition(name, [xPos, yPos, zPos]) {
        let geometry = new THREE.CylinderGeometry(1, 1, 0.2, 64); // Creates a new cylinder geometry

        const texture = new THREE.TextureLoader().load('./images/textures/initial_position_' + name.toLowerCase() + '.jpg'); // Loads the texture

        let positionsMaterial = new THREE.MeshPhongMaterial({ // Creates a new phong material
            map: texture,
            color: "#ffffff",
            specular: "#000000",
            emissive: "#000000",
            shininess: 90,
        });

        let mesh = new THREE.Mesh(geometry, positionsMaterial);
        mesh.position.set(xPos, yPos, zPos);
        mesh.name = name;
        this.app.scene.add(mesh);
    }

    // Removes the initial positions
    removeInitialPositions() {
        for (let key in this.initialPositions) {
            this.app.scene.remove(this.app.scene.getObjectByName(key));
        }
    }

    // Checks if the game is over
    checkGameOver() {
        if (this.players[this.PLAYER_TYPE.HUMAN].currentLap > this.totalLaps) {
            this.winner = this.menu.currentTypedUsername;
            this.loser = this.menu.nameOponentBalloon;
            return true;
        }
        else if (this.players[this.PLAYER_TYPE.AI].currentLap > this.totalLaps) {
            this.winner = this.menu.nameOponentBalloon;
            this.loser = this.menu.currentTypedUsername;
            return true;
        }
        return false;
    }

    // Changes the position of the object
    changeObjectPosition(obj, position = null) {
        switch (obj.type) {
            case this.PLAYER_TYPE.HUMAN: // Changes the position of the human balloon
                this.humanBalloons[obj.index].setPosition(this.initialPositionsCoords[position], position); // Sets the position of the human balloon
                this.players[obj.type] = this.humanBalloons[obj.index];
                this.initialPositions[position] = false;
                this.players[this.PLAYER_TYPE.HUMAN].initialPosition = position;
                break;
            case this.PLAYER_TYPE.AI: // Changes the position of the AI balloon
                if (this.initialPositions["RED"]) {
                    position = "RED";
                } else {
                    position = "BLUE";
                }

                this.aiBalloons[obj.index].setPosition(this.initialPositionsCoords[position], position); // Sets the position of the AI balloon
                this.players[obj.type] = this.aiBalloons[obj.index];
                this.initialPositions[position] = false;
                this.players[this.PLAYER_TYPE.AI].initialPosition = position;
                break;
            default:
                break;
        }

        this.initialPositions[obj.type] = false;
    }

    // Changes the main camera
    changeThreeMainCameras() {
        if (this.threeMainCameraIndex < 2) {
            this.threeMainCameraIndex++;
        }
        else {
            this.threeMainCameraIndex = 0;
        }
        this.app.setActiveCamera(this.threeMainCameraNames[this.threeMainCameraIndex]); // Sets the active camera
    }

    // Creates the firework spots
    createFireworkSpots() {
        let material = new THREE.MeshPhongMaterial({ color: 0x000000 }); // Creates a new phong material
        let geometry = new THREE.BoxGeometry(1, 2.5, 1); // Creates a new box geometry
        let mesh1 = new THREE.Mesh(geometry, material);
        let mesh2 = new THREE.Mesh(geometry, material);
        let mesh3 = new THREE.Mesh(geometry, material);
        let mesh4 = new THREE.Mesh(geometry, material);

        mesh1.castShadow = true;
        mesh2.castShadow = true;
        mesh3.castShadow = true;
        mesh4.castShadow = true;

        mesh1.position.set(28, 0.8, -5);
        mesh2.position.set(18, 0.8, -5);
        mesh3.position.set(70, -73.75, -45);
        mesh4.position.set(70, -73.75, -90);

        this.app.scene.add(mesh1, mesh2, mesh3, mesh4); // Adds the meshes to the scene
    }

    // Changes the power of the lights
    changeLightsPower() {
        if (this.sceneLightsOn) {
            for (let light of this.sceneLights) {
                light.visible = false;
            }
            this.sceneLightsOn = false;
        } else {
            for (let light of this.sceneLights) {
                light.visible = true;
            }
            this.sceneLightsOn = true;
        }
    }

    // Changes the shadow projection
    changeShadowProjection() {
        if (this.sceneCastingShadows) {
            for (let light of this.sceneLights) {
                light.castShadow = false;
            }
            this.sceneCastingShadows = false;
        } else {
            for (let light of this.sceneLights) {
                light.castShadow = true;
            }
            this.sceneCastingShadows = true;
        }
    }

    // Returns to the initial state
    returnToInitialState() {

        this.menu.totalLaps = 1;
        this.menu.penaltySeconds = 1;
        this.menu.currentTypedUsername = "Type here...";
        this.namePlayerBalloon = null;
        this.nameOponentBalloon = null;
        this.currentGameState = this.GAME_STATE.PREPARATION;

        this.menu.currentMatchTime = 0;
        this.menu.currentWindVelocity = "None";
        this.menu.currentGameState = this.GAME_STATE.PREPARATION;
        this.menu.currentLaps = 0;
        this.menu.currentVouchers = 0;

        this.winner = null;
        this.loser = null;

        this.menu.updateBlimpMenu(); // Updates the blimp menu
        const initialCameraState = { position: new THREE.Vector3(-56.911910092428265, 18.53264621864038, -83.07926277580806), target: new THREE.Vector3(-71.5, 18.53264621864038, -91.50558), fov: 100, near: 0.1, far: 1000 }; // Sets the initial camera state

        const initMenu = new THREE.PerspectiveCamera( // Creates a new perspective camera
            initialCameraState.fov,
            this.aspect,
            initialCameraState.near,
            initialCameraState.far
        );
        initMenu.position.copy(initialCameraState.position); // Copies the position of the initial camera state
        initMenu.target = initialCameraState.target.clone(); // Clones the target of the initial camera state
        initMenu.lookAt(initMenu.target); // Looks at the target of the initial camera state
        this.app.cameras['InitialMenu'] = initMenu; // Sets the initial menu camera

        this.app.setActiveCamera('InitialMenu'); // Sets the active camera to initial menu
        this.menu.updateBlimpMenu(); // Updates the blimp menu
        this.menu.updateGameStatus(); // Updates the game status

        this.removeBalloons(); // Removes the balloons

        this.players[this.PLAYER_TYPE.HUMAN] = null;
        this.players[this.PLAYER_TYPE.AI] = null;

        this.menu.updateUsernameText(); // Updates the username text
        this.menu.updatePenaltyText(); // Updates the penalty text
        this.menu.updateLapsTextInitalMenu(); // Updates the laps text in the initial menu
        this.menu.updatePlayerBalloon(this.namePlayerBalloon); // Updates the player balloon
        this.menu.updateOponentBalloon(this.nameOponentBalloon); // Updates the oponent balloon

        this.buildBalloons(); // Builds the balloons

        this.initialPositions = { // Sets the initial positions
            RED: true,
            BLUE: true
        };

        this.removeInitialPositions(); // Removes the initial positions
    }

    // Returns to the ready state
    returnToReadyState() {
        this.currentGameState = this.GAME_STATE.READY; // Changes the game state to ready

        this.menu.currentMatchTime = 0;
        this.menu.currentWindVelocity = "None";
        this.menu.currentGameState = this.GAME_STATE.READY;
        this.menu.currentLaps = 0;
        this.menu.currentVouchers = 0;

        this.winner = null;
        this.loser = null;

        this.menu.updateBlimpMenu(); // Updates the blimp menu
        const startCameraState = { position: new THREE.Vector3(22, 20, 0), target: new THREE.Vector3(22, 0, -20), fov: 60, near: 0.1, far: 1000 }; // Sets the start camera state

        const start = new THREE.PerspectiveCamera( // Creates a new perspective camera
            startCameraState.fov,
            this.aspect,
            startCameraState.near,
            startCameraState.far
        );
        start.position.copy(startCameraState.position); // Copies the position of the start camera state
        start.target = startCameraState.target.clone(); // Clones the target of the start camera state
        start.lookAt(start.target); // Looks at the target of the start camera state
        this.app.cameras['Start'] = start; // Sets the start camera

        this.app.setActiveCamera('Start'); // Sets the active camera to start
        this.menu.updateBlimpMenu(); // Updates the blimp menu
        this.menu.updateGameStatus(); // Updates the game status

        this.removeBalloons(); // Removes the balloons

        this.buildBalloons(); // Builds the balloons

        this.initialPositions = { // Sets the initial positions
            RED: true,
            BLUE: true
        };

        this.changeObjectPosition(this.players[this.PLAYER_TYPE.HUMAN], this.players[this.PLAYER_TYPE.HUMAN].initialPosition); // Changes the position of the human balloon
        this.changeObjectPosition(this.players[this.PLAYER_TYPE.AI], this.players[this.PLAYER_TYPE.AI].initialPosition); // Changes the position of the AI balloon
    }

    // Unscales the objects
    unscaleObjects() {
        Object.keys(this.humanBalloons).forEach((balloon) => { // Unscales the human and AI balloons
            this.humanBalloons[balloon].balloonGroup.scale.set(1, 1, 1);
            this.aiBalloons[balloon].balloonGroup.scale.set(1, 1, 1);
        });

        this.app.scene.children.forEach((child) => { // Unscales the initial positions
            if (child.name === "RED" || child.name === "BLUE") {
                child.scale.set(1, 1, 1);
            }
        });
    }

    // Increases the size of the object
    increaseSize(obj) {
        const factor = 1.3;
        this.unscaleObjects(); // Unscales the objects
        obj.scale.set(factor, factor, factor);
    }

    // Selects the object
    selectObject(intersects) {
        if (intersects[0]) {
            const obj = intersects[0].object;
            if (obj) {
                const humanPlayer = this.players[this.PLAYER_TYPE.HUMAN]; // Gets the human player
                if ((obj.name === "RED" || obj.name === "BLUE") && humanPlayer && this.currentGameState === this.GAME_STATE.CHOOSE_INITIAL_POSITION) {
                    this.changeObjectPosition(humanPlayer, obj.name); 
                    this.menu.updatePlayerBalloon(`${humanPlayer.type}${humanPlayer.index}`); // Updates the player balloon
                    this.currentGameState = this.GAME_STATE.PREPARATION; // Changes the game state to preparation
                    this.setCamera("InitialMenu");
                } else if (obj.name === "surface") {
                    const balloonGroup = obj.parent.parent;
                    switch (this.currentGameState) {
                        case this.GAME_STATE.CHOOSE_HUMAN_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.HUMAN) {
                                this.players[balloonGroup.type] = this.humanBalloons[balloonGroup.index];
                                this.buildInitialPosition("RED", this.initialPositionsCoords["RED"]); // Builds the initial position for the RED balloon
                                this.buildInitialPosition("BLUE", this.initialPositionsCoords["BLUE"]); // Builds the initial position for the BLUE balloon
                                this.currentGameState = this.GAME_STATE.CHOOSE_INITIAL_POSITION; // Changes the game state to choose initial position
                            }
                            break;
                        case this.GAME_STATE.CHOOSE_AI_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.AI) {
                                this.changeObjectPosition(balloonGroup); // Changes the position of the AI balloon
                                this.menu.updateOponentBalloon(`${balloonGroup.type}${balloonGroup.index}`); // Updates the oponent balloon
                                this.currentGameState = this.GAME_STATE.PREPARATION; // Changes the game state to preparation
                                this.setCamera("InitialMenu"); // Sets the camera to the initial menu
                            }
                            break;
                        default:
                            break;
                    };
                }
            }
        }
    }

    // Increases the size of the object when the pointer is over it
    pointObject(intersects) {
        if (intersects[0]) {
            const obj = intersects[0].object;
            if (obj) {
                if (obj.name === "surface") {
                    const balloonGroup = obj.parent.parent;
                    switch (this.currentGameState) {
                        case this.GAME_STATE.CHOOSE_HUMAN_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.HUMAN) {
                                this.increaseSize(balloonGroup); // Increases the size of the balloon
                            }
                            break;
                        case this.GAME_STATE.CHOOSE_AI_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.AI) {
                                this.increaseSize(balloonGroup); // Increases the size of the balloon
                            }
                            break;
                        default:
                            break;
                    };
                } else if ((obj.name === "RED" || obj.name === "BLUE") && this.currentGameState === this.GAME_STATE.CHOOSE_INITIAL_POSITION) {
                    if (this.players[this.PLAYER_TYPE.HUMAN]) {
                        this.increaseSize(obj); // Increases the size of the balloon
                    }
                } else {
                    this.unscaleObjects(); // Unscales the objects
                }
            }
        } else {
            this.unscaleObjects(); // Unscales the objects
        }

    }

    /**
     * Print to console information about the intersected objects
     */
    transverseRaycastProperties(intersects) {
        for (var i = 0; i < intersects.length; i++) {

            /*
            An intersection has the following properties :
                - object : intersected object (THREE.Mesh)
                - distance : distance from camera to intersection (number)
                - face : intersected face (THREE.Face3)
                - faceIndex : intersected face index (number)
                - point : intersection point (THREE.Vector3)
                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
        }
    }

    onPointerMove(event) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        //of the screen is the origin
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.app.getActiveCamera());

        //3. compute intersections
        var intersects = this.raycaster.intersectObjects(this.app.scene.children);

        event.type === "pointerdown" ? this.selectObject(intersects) : this.pointObject(intersects);

        this.transverseRaycastProperties(intersects)
    }

    // sets the camera
    setCamera(cameraName) {
        if (this.currentGameState === this.GAME_STATE.RUNNING && (cameraName === 'BalloonFirstPerson' || cameraName === 'BalloonThirdPerson')) {
            this.players[this.PLAYER_TYPE.HUMAN].setCamera(this.app.cameras[cameraName]);
        }

        this.app.activeCameraName = cameraName;
        this.app.updateCameraIfRequired(); // Updates the camera
    }

    // checks for collisions
    checkCollision() {
        const balloon = this.players[this.PLAYER_TYPE.HUMAN];
        const balloonBoundingBox = new THREE.Box3().setFromObject(balloon.balloonGroup); // Gets the bounding box of the human balloon
        const upPartBoundingBox = new THREE.Box3().setFromObject(balloon.balloonGroup.children[0]); // Gets the bounding box of the upper part of the human balloon
        const downPartBoundingBox = new THREE.Box3().setFromObject(balloon.balloonGroup.children[1]); // Gets the bounding box of the lower part of the human balloon

        const balloonAI = this.players[this.PLAYER_TYPE.AI];
        const balloonBoundingBoxAI = new THREE.Box3().setFromObject(balloonAI.balloonGroup); // Gets the bounding box of the AI balloon
        const upPartBoundingBoxAI = new THREE.Box3().setFromObject(balloonAI.balloonGroup.children[0]); // Gets the bounding box of the upper part of the AI balloon
        const downPartBoundingBoxAI = new THREE.Box3().setFromObject(balloonAI.balloonGroup.children[1]); // Gets the bounding box of the lower part of the AI balloon

        for (let obstacle of this.track.obstacles) { // Checks for collision between the human and the obstacles
            const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle.mesh);
            if (obstacleBoundingBox.intersectsBox(balloonBoundingBox)) {
                let upCollision = obstacleBoundingBox.intersectsBox(upPartBoundingBox);
                let downCollision = obstacleBoundingBox.intersectsBox(downPartBoundingBox);
                if (upCollision || downCollision) {
                    balloon.nearestPoint();
                }
            }
        }

        for (let powerUp of this.track.powerUps) { // Checks for collision between the human and the power ups
            const powerUpBoundingBox = new THREE.Box3().setFromObject(powerUp.mesh);
            if (powerUpBoundingBox.intersectsBox(balloonBoundingBox)) {
                let upCollision = powerUpBoundingBox.intersectsBox(upPartBoundingBox);
                let downCollision = powerUpBoundingBox.intersectsBox(downPartBoundingBox);
                if (upCollision || downCollision) {
                    if (powerUp !== balloon.lastPowerUpObject)
                        balloon.extraLives++;
                    balloon.lastPowerUpObject = powerUp;
                }
            }
        }

        if (balloonBoundingBox.intersectsBox(balloonBoundingBoxAI)) { // Checks for collision between the human and AI balloons
            let upCollision = upPartBoundingBox.intersectsBox(upPartBoundingBoxAI);
            let downCollision = downPartBoundingBox.intersectsBox(downPartBoundingBoxAI);
            if (upCollision || downCollision) {
                balloon.nearestPoint();
            }
        }
    }

    // animates the obstacles and powerups
    animateObstaclesAndPowerUps() {
        this.track.powerUps.forEach(powerUp => {
            powerUp.animate(); // Animates the power up
        });

        this.track.obstacles.forEach(obstacle => {
            obstacle.animate(); // Animates the obstacle
        });
    }

    // updates the fireworks
    updateFireworks() {
        if (Math.random() < 0.04) {
            let chooseSpot = Math.random();
            if (chooseSpot < 0.25) {
                this.fireworks.push(new MyFirework(this.app, this, 28, 0.8, -5))
            } else if (chooseSpot < 0.5) {
                this.fireworks.push(new MyFirework(this.app, this, 18, 0.8, -5))
            } else if (chooseSpot < 0.75) {
                this.fireworks.push(new MyFirework(this.app, this, 70, -74.5, -45))
            } else {
                this.fireworks.push(new MyFirework(this.app, this, 70, -74.5, -90))
            }
        }

        for (let i = 0; i < this.fireworks.length; i++) {
            if (this.fireworks[i].done) {
                this.fireworks.splice(i, 1)
                continue
            }
            this.fireworks[i].update()
        }
    }

    // finishes the fireworks
    finishFireworks() {
        for (let i = 0; i < this.fireworks.length; i++) {
            if (this.fireworks[i].done) {
                this.fireworks.splice(i, 1) // Removes the fireworks
                continue
            }
            this.fireworks[i].update() // Updates the fireworks
        }
    }

    // updates the track
    updateTrack() {
        this.track.updateCurve() // Updates the curve of the track
    }

    // updates the axis
    updateAxis() {
        this.axis.update(); // Updates the axis
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update() {
        switch (this.currentGameState) { // State machine
            case this.GAME_STATE.PREPARATION:
                this.finishFireworks();
                break;
            case this.GAME_STATE.READY:
                this.finishFireworks();
                break;
            case this.GAME_STATE.RUNNING:
                this.players[this.PLAYER_TYPE.HUMAN].update(); // Updates the human player
                this.players[this.PLAYER_TYPE.HUMAN].restoreSize(); // Restores the size of the human player
                this.players[this.PLAYER_TYPE.AI].updateLOD(this.app.getActiveCamera()); // Updates the AI player
                this.checkCollision(); // Checks for collisions
                this.finishFireworks(); // Finishes the fireworks
                break;
            case this.GAME_STATE.PAUSED:
                this.players[this.PLAYER_TYPE.AI].updateLOD(this.app.getActiveCamera()); // Updates the AI player
                this.finishFireworks(); // Finishes the fireworks
                break;
            case this.GAME_STATE.FINISHED:
                this.players[this.PLAYER_TYPE.AI].updateLOD(this.app.getActiveCamera()); // Updates the AI player
                this.updateFireworks(); // Updates the fireworks
                break;
            default:
                break;
        }

        let t = this.app.clock.getElapsedTime() * 1000;
        if (this.shaders["obstacleShader"] !== undefined && this.shaders["obstacleShader"] !== null) {
            if (this.shaders["obstacleShader"].hasUniform("timeFactor")) { // Updates the time factor for the obstacle shader
                this.shaders["obstacleShader"].updateUniformsValue("timeFactor", t / 10); // Updates the time factor for the obstacle shader
            }
        }

        if (this.shaders["powerUpShader"] !== undefined && this.shaders["powerUpShader"] !== null) {
            if (this.shaders["powerUpShader"].hasUniform("timeFactor")) { // Updates the time factor for the power up shader
                this.shaders["powerUpShader"].updateUniformsValue("timeFactor", t / 10); // Updates the time factor for the power up shader
            }
        }
    }
}

export { MyContents };