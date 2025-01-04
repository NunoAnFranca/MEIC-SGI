import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTrack } from "./MyTrack.js";
import { MyParser } from "./MyParser.js";
import { MyMenu } from "./MyMenu.js";
import { MyBalloon } from "./MyBalloon.js";

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

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 40

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"

        this.track = null;
        this.humanBalloons = {};
        this.aiBalloons = {};

        this.GAME_STATE = {
            PREPARATION: "PREPARATION",
            RUNNING: "RUNNING",
            PAUSED: "PAUSED",
            FINISHED: "FINISHED"
        }

        this.DIRECTIONS = {
            0: "NORTH",
            1: "EAST",
            2: "SOUTH",
            3: "WEST"
        };

        this.PLAYER_TYPE = {
            HUMAN: "HUMAN",
            AI: "AI"
        }

        this.players = {
            [this.PLAYER_TYPE.HUMAN]: null,
            [this.PLAYER_TYPE.AI]: null
        };

        this.currentGameState = this.GAME_STATE.PREPARATION;
      
        // initial menu variables
        this.totalLaps = 1;
        this.penaltySeconds = 1;
        this.playerUsername = "Nan";
        this.namePlayerBalloon = null;
        this.nameOponentBalloon = null;

        this.threeMainCameraNames = ["BalloonFirstPerson", "BalloonThirdPerson", "Perspective"];
        this.threeMainCameraIndex = 0;
        
        // register events

        document.addEventListener(
            // "pointermove",
            // "mousemove",
            "pointerdown",
            // list of events: https://developer.mozilla.org/en-US/docs/Web/API/Element
            this.onPointerMove.bind(this)
        );

        document.addEventListener("keydown", (event) => {
            if (this.currentGameState === this.GAME_STATE.PREPARATION) {
                if ((event.key === 'p' || event.key === 'P') && !this.initialPositions[this.PLAYER_TYPE.HUMAN] && !this.initialPositions[this.PLAYER_TYPE.AI]) {
                    this.currentGameState = this.GAME_STATE.RUNNING;
                    this.removeInitialPositions();
                    this.setCamera('BalloonFirstPerson');

                    this.matchTime = new Date().getTime();
                    this.pausedTime = 0; 

                    setInterval(() => {
                        if (this.currentGameState === this.GAME_STATE.RUNNING) {
                            this.players[this.PLAYER_TYPE.HUMAN].moveWind();
                            
                            this.menu.currentMatchTime = Math.floor((new Date().getTime() - this.matchTime  - this.pausedTime)/100);
                            this.menu.currentWindVelocity = this.DIRECTIONS[this.players[this.PLAYER_TYPE.HUMAN].direction];
                            this.menu.currentGameState = this.GAME_STATE.RUNNING;
                            this.menu.currentLaps = this.players[this.PLAYER_TYPE.HUMAN].currentLap;
                            //TODO Vouchers Logic

                            this.menu.updateBlimpMenu();
                        }
                        this.menu.updateGameStatus();
                    }, 30);
                }
            } else if (this.currentGameState === this.GAME_STATE.RUNNING) {
                if (event.key === 'w' || event.key === 'W') {
                    this.players[this.PLAYER_TYPE.HUMAN].moveUp();
                } else if (event.key === 's' || event.key === 'S') {
                    this.players[this.PLAYER_TYPE.HUMAN].moveDown();
                } else if (event.key === ' ') {
                    this.pauseStartTime = new Date().getTime();
                    this.currentGameState = this.GAME_STATE.PAUSED;
                    this.menu.currentGameState = this.GAME_STATE.PAUSED;
                }
            } else if (this.currentGameState === this.GAME_STATE.PAUSED) {
                if (event.key === ' ') {
                    this.currentGameState = this.GAME_STATE.RUNNING;
                    this.menu.currentGameState = this.currentGameState;
                    this.pausedTime += (new Date().getTime() - this.pauseStartTime);
                }
            }
            if ((this.currentGameState === this.GAME_STATE.PAUSED) || (this.currentGameState === this.GAME_STATE.RUNNING)) {
                if(event.key === 'v' || event.key === "V"){
                    this.changeThreeMainCameras();
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

        // create temp lights so we can see the objects to not render the entire scene
        this.buildLights();

        // build balloons
        this.buildBalloons();
        
        this.initialPositions = {
            [this.PLAYER_TYPE.HUMAN]: true,
            [this.PLAYER_TYPE.AI]: true
        };
        this.initialPositionsCoords = {
            [this.PLAYER_TYPE.HUMAN]: [27, 0.8, -15],
            [this.PLAYER_TYPE.AI]: [21, 0.8, -15]
        };
        this.buildInitialPosition(this.PLAYER_TYPE.HUMAN, this.initialPositionsCoords[this.PLAYER_TYPE.HUMAN]);
        this.buildInitialPosition(this.PLAYER_TYPE.AI, this.initialPositionsCoords[this.PLAYER_TYPE.AI]);

        // create the track
        this.track = new MyTrack(this.app);
        
        this.loader = new THREE.TextureLoader();

        this.menu = new MyMenu(this.app, this.loader);
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
        const pointLight = new THREE.PointLight(0xffffff, 500, 0)
        pointLight.position.set(0, 20, 0)
        this.app.scene.add(pointLight)

        // add a point light helper for the previous point light
        const sphereSize = 0.5
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize)
        this.app.scene.add(pointLightHelper)

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555)
        this.app.scene.add(ambientLight)
    }

    buildBalloons() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = `${i}${j}`;
                this.humanBalloons[index] = new MyBalloon(this.app, this.PLAYER_TYPE.HUMAN, index, j * 6 + 35, 4, - 6 * (i + 1) - 5, (i + j) % 5 + 1);
                this.aiBalloons[index] = new MyBalloon(this.app, this.PLAYER_TYPE.AI, index, j * 6, 4, - 6 * (i + 1) - 5, (i + j) % 5 + 1);
            }
        }
    }

    buildInitialPosition(name, [xPos, yPos, zPos]) {
        let geometry = new THREE.CylinderGeometry(1,1,0.2,64);

        let positionsMaterial = new THREE.MeshPhongMaterial({
            color: "#888888",
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

    changeObjectPosition(obj) {
        switch (obj.type) {
            case this.PLAYER_TYPE.HUMAN:
                this.humanBalloons[obj.index].setPosition(this.initialPositionsCoords[obj.type]);
                this.players[obj.type] = this.humanBalloons[obj.index];
                break;
            case this.PLAYER_TYPE.AI:
                this.aiBalloons[obj.index].setPosition(this.initialPositionsCoords[obj.type]);
                this.players[obj.type] = this.aiBalloons[obj.index];
                break;
            default:
                break;
        }

        this.initialPositions[obj.type] = false;
    }

    changeThreeMainCameras(){
        if(this.threeMainCameraIndex < 2){
            this.threeMainCameraIndex++;
        }
        else{
            this.threeMainCameraIndex = 0;
        }
        this.app.setActiveCamera(this.threeMainCameraNames[this.threeMainCameraIndex]);
    }

    pickingHelper(intersects) {
        if (intersects.length > 0 && this.currentGameState === this.GAME_STATE.PREPARATION) {
            const obj = intersects[0].object;
            if (obj.parent && this.PLAYER_TYPE[obj.parent.type] && this.initialPositions[obj.parent.type]) {
                this.changeObjectPosition(obj.parent);
            }
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

        this.pickingHelper(intersects)

        this.transverseRaycastProperties(intersects)
    }

    setCamera(cameraName) {
        if (this.currentGameState === this.GAME_STATE.RUNNING && (cameraName === 'BalloonFirstPerson' || cameraName === 'BalloonThirdPerson')) {
            this.players[this.PLAYER_TYPE.HUMAN].setCamera(this.app.cameras[cameraName]);
        }

        this.app.activeCameraName = cameraName;
        this.app.updateCameraIfRequired();
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
                break;
            case this.GAME_STATE.RUNNING:
                this.players[this.PLAYER_TYPE.HUMAN].update(this.track.obstacles);
                break;
            case this.GAME_STATE.PAUSED:
                break;
            case this.GAME_STATE.FINISHED:
                break;
            default:
                break;
        }
    }
}

export { MyContents };