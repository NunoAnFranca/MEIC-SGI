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

        this.initialPositions = {
            RED: true,
            BLUE: true
        };

        this.initialPositionsCoords = {
            RED: [27, 0.8, -15],
            BLUE: [21, 0.8, -15]
        };

        // create the track
        this.track = new MyTrack(this.app);

        this.loader = new THREE.TextureLoader();

        this.menu = new MyMenu(this.app, this.loader);

        this.createShaders();
    }

    captureImages(callback) {
        const canvas = this.app.renderer.domElement;
        const rgbImageBase64 = canvas.toDataURL('image/jpg');
        const rgbImage = new Image();
        rgbImage.src = rgbImageBase64;

        rgbImage.onload = () => {
            const texture = new THREE.Texture(rgbImage);
            texture.needsUpdate = true;
            callback(texture);
        };
    }

    createShaders() {
        this.shaders["cameraShader"] = new MyShader(this.app, "Camera Shader", "Uses the camera image as texture",
            "shaders/bas.vert", "shaders/bas.frag", {
            uNormalTexture: { type: 't', value: this.loader.load('images/textures/scene.jpg') },
            uGrayScaleTexture: { type: 't', value: this.loader.load('images/textures/scene_grayscale.jpg') },
            displacementScale: { type: 'f', value: 1.0 }
        });

        setInterval(async () => {
            this.captureImages((texture) => {
                this.shaders["cameraShader"].uniformValues.uNormalTexture.value = texture;
                this.shaders["cameraShader"].uniformValues.uGrayScaleTexture.value = texture;
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

        this.waitForShaders();
    }

    waitForShaders() {
        Object.keys(this.shaders).forEach((shader) => {
            if (this.shaders[shader].ready === false) {
                setTimeout(this.waitForShaders.bind(this), 100);
                return;
            }

            if (this.shaders[shader] === null || this.shaders[shader] === undefined) {
                return;
            }

            switch (shader) {
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

    updateBoundingBox(id, type) {
        switch (type) {
            case this.PLAYER_TYPE.HUMAN:
                this.humanBalloons[id].updateBoundingBoxHelpersVisibility();
                break;
            case this.PLAYER_TYPE.AI:
                this.aiBalloons[id].updateBoundingBoxHelpersVisibility();
                break;
            default:
                break;
        }
    }

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

        // add a point light helper for the previous point light
        //const sphereSize = 0.5
        //const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize)
        //this.app.scene.add(pointLightHelper)

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555)
        this.app.scene.add(ambientLight)
    }

    buildBalloons() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = `${i}${j}`;
                this.humanBalloons[index] = new MyBalloon(this.app, this.PLAYER_TYPE.HUMAN, index, j * 6 + 35, 4, - 6 * (i + 1) - 5, i * 3 + j + 1);
                this.aiBalloons[index] = new MyBalloon(this.app, this.PLAYER_TYPE.AI, index, j * 6, 4, - 6 * (i + 1) - 5, i * 3 + j + 1);
            }
        }
    }

    removeBalloons() {
        for (const index in this.humanBalloons) {
            const balloon = this.humanBalloons[index];
            this.app.scene.remove(balloon.balloonGroup);
            balloon.removeMarker();
            balloon.balloonGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            delete this.humanBalloons[index];
        }

        for (const index in this.aiBalloons) {
            const balloon = this.aiBalloons[index];
            this.app.scene.remove(balloon.balloonGroup);
            balloon.removeMarker();
            balloon.balloonGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            delete this.aiBalloons[index];
        }
    }

    buildInitialPosition(name, [xPos, yPos, zPos]) {
        let geometry = new THREE.CylinderGeometry(1, 1, 0.2, 64);

        const texture = new THREE.TextureLoader().load('./images/textures/initial_position_' + name.toLowerCase() + '.jpg');

        let positionsMaterial = new THREE.MeshPhongMaterial({
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

    removeInitialPositions() {
        for (let key in this.initialPositions) {
            this.app.scene.remove(this.app.scene.getObjectByName(key));
        }
    }

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

    changeObjectPosition(obj, position = null) {
        switch (obj.type) {
            case this.PLAYER_TYPE.HUMAN:
                this.humanBalloons[obj.index].setPosition(this.initialPositionsCoords[position], position);
                this.players[obj.type] = this.humanBalloons[obj.index];
                this.initialPositions[position] = false;
                this.players[this.PLAYER_TYPE.HUMAN].initialPosition = position;
                break;
            case this.PLAYER_TYPE.AI:
                if (this.initialPositions["RED"]) {
                    position = "RED";
                } else {
                    position = "BLUE";
                }

                this.aiBalloons[obj.index].setPosition(this.initialPositionsCoords[position], position);
                this.players[obj.type] = this.aiBalloons[obj.index];
                this.initialPositions[position] = false;
                this.players[this.PLAYER_TYPE.AI].initialPosition = position;
                break;
            default:
                break;
        }

        this.initialPositions[obj.type] = false;
    }

    changeThreeMainCameras() {
        if (this.threeMainCameraIndex < 2) {
            this.threeMainCameraIndex++;
        }
        else {
            this.threeMainCameraIndex = 0;
        }
        this.app.setActiveCamera(this.threeMainCameraNames[this.threeMainCameraIndex]);
    }

    createFireworkSpots() {
        let material = new THREE.MeshPhongMaterial({ color: 0x000000 });
        let geometry = new THREE.BoxGeometry(1, 2.5, 1);
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

        this.app.scene.add(mesh1, mesh2, mesh3, mesh4);
    }

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

        this.menu.updateBlimpMenu();
        const initialCameraState = { position: new THREE.Vector3(-56.911910092428265, 18.53264621864038, -83.07926277580806), target: new THREE.Vector3(-71.5, 18.53264621864038, -91.50558), fov: 100, near: 0.1, far: 1000 };

        const initMenu = new THREE.PerspectiveCamera(
            initialCameraState.fov,
            this.aspect,
            initialCameraState.near,
            initialCameraState.far
        );
        initMenu.position.copy(initialCameraState.position);
        initMenu.target = initialCameraState.target.clone();
        initMenu.lookAt(initMenu.target);
        this.app.cameras['InitialMenu'] = initMenu;

        this.app.setActiveCamera('InitialMenu');
        this.menu.updateBlimpMenu();
        this.menu.updateGameStatus();

        this.removeBalloons();

        this.players[this.PLAYER_TYPE.HUMAN] = null;
        this.players[this.PLAYER_TYPE.AI] = null;

        this.menu.updateUsernameText();
        this.menu.updatePenaltyText();
        this.menu.updateLapsTextInitalMenu();
        this.menu.updatePlayerBalloon(this.namePlayerBalloon);
        this.menu.updateOponentBalloon(this.nameOponentBalloon);

        this.buildBalloons();

        this.initialPositions = {
            RED: true,
            BLUE: true
        };

        this.removeInitialPositions();
    }

    returnToReadyState() {
        this.currentGameState = this.GAME_STATE.READY;

        this.menu.currentMatchTime = 0;
        this.menu.currentWindVelocity = "None";
        this.menu.currentGameState = this.GAME_STATE.READY;
        this.menu.currentLaps = 0;
        this.menu.currentVouchers = 0;

        this.winner = null;
        this.loser = null;

        this.menu.updateBlimpMenu();
        const startCameraState = { position: new THREE.Vector3(22, 20, 0), target: new THREE.Vector3(22, 0, -20), fov: 60, near: 0.1, far: 1000 };

        const start = new THREE.PerspectiveCamera(
            startCameraState.fov,
            this.aspect,
            startCameraState.near,
            startCameraState.far
        );
        start.position.copy(startCameraState.position);
        start.target = startCameraState.target.clone();
        start.lookAt(start.target);
        this.app.cameras['Start'] = start;

        this.app.setActiveCamera('Start');
        this.menu.updateBlimpMenu();
        this.menu.updateGameStatus();

        this.removeBalloons();

        this.buildBalloons();

        this.initialPositions = {
            RED: true,
            BLUE: true
        };

        this.changeObjectPosition(this.players[this.PLAYER_TYPE.HUMAN], this.players[this.PLAYER_TYPE.HUMAN].initialPosition);
        this.changeObjectPosition(this.players[this.PLAYER_TYPE.AI], this.players[this.PLAYER_TYPE.AI].initialPosition);
    }

    unscaleObjects() {
        Object.keys(this.humanBalloons).forEach((balloon) => {
            this.humanBalloons[balloon].balloonGroup.scale.set(1, 1, 1);
            this.aiBalloons[balloon].balloonGroup.scale.set(1, 1, 1);
        });

        this.app.scene.children.forEach((child) => {
            if (child.name === "RED" || child.name === "BLUE") {
                child.scale.set(1, 1, 1);
            }
        });
    }

    increaseSize(obj) {
        const factor = 1.3;
        this.unscaleObjects();
        obj.scale.set(factor, factor, factor);
    }

    selectObject(intersects) {
        if (intersects[0]) {
            const obj = intersects[0].object;
            if (obj) {
                const humanPlayer = this.players[this.PLAYER_TYPE.HUMAN];
                if ((obj.name === "RED" || obj.name === "BLUE") && humanPlayer && this.currentGameState === this.GAME_STATE.CHOOSE_INITIAL_POSITION) {
                    this.changeObjectPosition(humanPlayer, obj.name);
                    this.menu.updatePlayerBalloon(`${humanPlayer.type}${humanPlayer.index}`);
                    this.currentGameState = this.GAME_STATE.PREPARATION;
                    this.setCamera("InitialMenu");
                } else if (obj.name === "surface") {
                    const balloonGroup = obj.parent.parent;
                    switch (this.currentGameState) {
                        case this.GAME_STATE.CHOOSE_HUMAN_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.HUMAN) {
                                this.players[balloonGroup.type] = this.humanBalloons[balloonGroup.index];
                                this.buildInitialPosition("RED", this.initialPositionsCoords["RED"]);
                                this.buildInitialPosition("BLUE", this.initialPositionsCoords["BLUE"]);
                                this.currentGameState = this.GAME_STATE.CHOOSE_INITIAL_POSITION;
                            }
                            break;
                        case this.GAME_STATE.CHOOSE_AI_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.AI) {
                                this.changeObjectPosition(balloonGroup);
                                this.menu.updateOponentBalloon(`${balloonGroup.type}${balloonGroup.index}`);
                                this.currentGameState = this.GAME_STATE.PREPARATION;
                                this.setCamera("InitialMenu");
                            }
                            break;
                        default:
                            break;
                    };
                }
            }
        }
    }

    pointObject(intersects) {
        if (intersects[0]) {
            const obj = intersects[0].object;
            if (obj) {
                if (obj.name === "surface") {
                    const balloonGroup = obj.parent.parent;
                    switch (this.currentGameState) {
                        case this.GAME_STATE.CHOOSE_HUMAN_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.HUMAN) {
                                this.increaseSize(balloonGroup);
                            }
                            break;
                        case this.GAME_STATE.CHOOSE_AI_BALLOON:
                            if (balloonGroup.type === this.PLAYER_TYPE.AI) {
                                this.increaseSize(balloonGroup);
                            }
                            break;
                        default:
                            break;
                    };
                } else if ((obj.name === "RED" || obj.name === "BLUE") && this.currentGameState === this.GAME_STATE.CHOOSE_INITIAL_POSITION) {
                    if (this.players[this.PLAYER_TYPE.HUMAN]) {
                        this.increaseSize(obj);
                    }
                } else {
                    this.unscaleObjects();
                }
            }
        } else {
            this.unscaleObjects();
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

    setCamera(cameraName) {
        if (this.currentGameState === this.GAME_STATE.RUNNING && (cameraName === 'BalloonFirstPerson' || cameraName === 'BalloonThirdPerson')) {
            this.players[this.PLAYER_TYPE.HUMAN].setCamera(this.app.cameras[cameraName]);
        }

        this.app.activeCameraName = cameraName;
        this.app.updateCameraIfRequired();
    }

    checkCollision() {
        const balloon = this.players[this.PLAYER_TYPE.HUMAN];
        const balloonBoundingBox = new THREE.Box3().setFromObject(balloon.balloonGroup);
        const upPartBoundingBox = new THREE.Box3().setFromObject(balloon.balloonGroup.children[0]);
        const downPartBoundingBox = new THREE.Box3().setFromObject(balloon.balloonGroup.children[1]);

        const balloonAI = this.players[this.PLAYER_TYPE.AI];
        const balloonBoundingBoxAI = new THREE.Box3().setFromObject(balloonAI.balloonGroup);
        const upPartBoundingBoxAI = new THREE.Box3().setFromObject(balloonAI.balloonGroup.children[0]);
        const downPartBoundingBoxAI = new THREE.Box3().setFromObject(balloonAI.balloonGroup.children[1]);

        for (let obstacle of this.track.obstacles) {
            const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle.mesh);
            if (obstacleBoundingBox.intersectsBox(balloonBoundingBox)) {
                let upCollision = obstacleBoundingBox.intersectsBox(upPartBoundingBox);
                let downCollision = obstacleBoundingBox.intersectsBox(downPartBoundingBox);
                if (upCollision || downCollision) {
                    balloon.nearestPoint();
                }
            }
        }

        for (let powerUp of this.track.powerUps) {
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

        if (balloonBoundingBox.intersectsBox(balloonBoundingBoxAI)) {
            let upCollision = upPartBoundingBox.intersectsBox(upPartBoundingBoxAI);
            let downCollision = downPartBoundingBox.intersectsBox(downPartBoundingBoxAI);
            if (upCollision || downCollision) {
                balloon.nearestPoint();
            }
        }
    }

    animateObstaclesAndPowerUps() {
        this.track.powerUps.forEach(powerUp => {
            powerUp.animate();
        });

        this.track.obstacles.forEach(obstacle => {
            obstacle.animate();
        });
    }

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

    finishFireworks() {
        for (let i = 0; i < this.fireworks.length; i++) {
            if (this.fireworks[i].done) {
                this.fireworks.splice(i, 1)
                continue
            }
            this.fireworks[i].update()
        }
    }

    updateTrack() {
        this.track.updateCurve()
    }

    updateAxis() {
        this.axis.update();
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update() {
        switch (this.currentGameState) {
            case this.GAME_STATE.PREPARATION:
                this.finishFireworks();
                break;
            case this.GAME_STATE.READY:
                this.finishFireworks();
                break;
            case this.GAME_STATE.RUNNING:
                this.players[this.PLAYER_TYPE.HUMAN].update();
                this.players[this.PLAYER_TYPE.HUMAN].restoreSize();
                this.players[this.PLAYER_TYPE.AI].updateLOD(this.app.getActiveCamera());
                this.checkCollision();
                this.finishFireworks();
                break;
            case this.GAME_STATE.PAUSED:
                this.players[this.PLAYER_TYPE.AI].updateLOD(this.app.getActiveCamera());
                this.finishFireworks();
                break;
            case this.GAME_STATE.FINISHED:
                this.players[this.PLAYER_TYPE.AI].updateLOD(this.app.getActiveCamera());
                this.updateFireworks();
                break;
            default:
                break;
        }

        let t = this.app.clock.getElapsedTime()
        if (this.shaders["obstacleShader"] !== undefined && this.shaders["obstacleShader"] !== null) {
            if (this.shaders["obstacleShader"].hasUniform("timeFactor")) {
                this.shaders["obstacleShader"].updateUniformsValue("timeFactor", t / 10);
            }
        }

        if (this.shaders["powerUpShader"] !== undefined && this.shaders["powerUpShader"] !== null) {
            if (this.shaders["powerUpShader"].hasUniform("timeFactor")) {
                this.shaders["powerUpShader"].updateUniformsValue("timeFactor", t / 10);
            }
        }
    }
}

export { MyContents };