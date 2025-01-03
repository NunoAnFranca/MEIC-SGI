import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTrack } from "./MyTrack.js";
import { MyParser } from "./MyParser.js";
import { MyBalloon } from "./MyBalloon.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
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

        // Blimp Menu Variables
        this.matchTime = null;
        this.currentMatchTime = 0;
        this.lastWindVelocity = null;
        this.currentWindVelocity = "Nan";
        this.lastGameState = null;
        this.lastLaps = null;
        this.currentLaps = 0;
        this.lastVouchers = null;
        this.currentVouchers = 0;

        //Initial Menu Variables
        this.totalLaps = 1;
        this.penaltySeconds = 1;
        this.playerUsername = "Nan";
        this.namePlayerBalloon = null;
        this.nameOponentBalloon = null;

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
                            
                            this.currentMatchTime = Math.floor((new Date().getTime() - this.matchTime  - this.pausedTime)/100);
                            this.currentWindVelocity = this.DIRECTIONS[this.players[this.PLAYER_TYPE.HUMAN].direction];
                            this.currentGameState = this.GAME_STATE.RUNNING;
                            this.currentLaps = this.players[this.PLAYER_TYPE.HUMAN].currentLap;
                            //TODO Vouchers Logic

                            this.updateBlimpMenu();
                        }
                        this.updateGameStatus();
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
                }
            } else if (this.currentGameState === this.GAME_STATE.PAUSED) {
                if (event.key === ' ') {
                    this.currentGameState = this.GAME_STATE.RUNNING;
                    this.pausedTime += (new Date().getTime() - this.pauseStartTime);
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

        this.loadBlimpMenu();
        this.loadStartMenu();
    }
    
    loadBlimpMenu() {
        const textTime = "Time: ";
        const textNumbers = String(this.currentMatchTime);
        const textLaps = "Laps: " + this.currentLaps + "/" + this.totalLaps;
        const textWind = "Wind: " + this.currentWindVelocity;
        const textVouchers = "Vouchers: " + this.currentVouchers;
        const textGameStatus = "Status: " + this.currentGameState;
    
        this.textTimeGroup = new THREE.Group();
        this.textNumbersGroup = new THREE.Group();
        this.textLapsGroup = new THREE.Group();
        this.textWindGroup = new THREE.Group();
        this.textVouchersGroup = new THREE.Group();
        this.textGameStatusGroup = new THREE.Group();
        
        this.menuGroup = new THREE.Group();

        this.convertTextToSprite(textTime, this.textTimeGroup);
        this.convertTextToSprite(textNumbers, this.textNumbersGroup);
        this.convertTextToSprite(textLaps, this.textLapsGroup);
        this.convertTextToSprite(textWind, this.textWindGroup);
        this.convertTextToSprite(textVouchers, this.textVouchersGroup);
        this.convertTextToSprite(textGameStatus, this.textGameStatusGroup);


        this.textTimeGroup.position.set(0, 11.5, 0);
        this.textNumbersGroup.position.set(1.4 * textTime.length, 11.5, 0);
        this.textLapsGroup.position.set(0, 9, 0);
        this.textWindGroup.position.set(0, 6.5, 0);
        this.textVouchersGroup.position.set(0, 4, 0);
        this.textGameStatusGroup.position.set(0, 1.5, 0);

        this.menuGroup.add(this.textTimeGroup, this.textLapsGroup, this.textWindGroup, this.textVouchersGroup, this.textGameStatusGroup, this.textNumbersGroup);

        this.menuGroup.position.set(69.5, 24, -60.5);
        this.menuGroup.rotation.set(0, - Math.PI/3, 0);
        this.app.scene.add(this.menuGroup);    
    }

    loadStartMenu() {

        const textAuthors = "Created by Nuno França & Luis Alves          @FEUP";
        const textUsername = "Username: " + this.playerUsername; 
        const textPlayerBalloon = "Player Balloon: " + this.namePlayerBalloon;
        const textOponentBalloon = "Oponent Balloon: " + this.nameOponentBalloon;
        const textNumberOfLaps = "Number of Laps: " + this.totalLaps;
        const textPenalty = "Penalty (seconds): " + this.penaltySeconds;
        
        this.createButtonsPenalty();

        this.textAuthorsGroup = new THREE.Group();
        this.textUsernameGroup = new THREE.Group();
        this.textPlayerBalloonGroup = new THREE.Group();    
        this.textOponentBalloonGroup = new THREE.Group();
        this.textNumberOfLapsGroup = new THREE.Group();
        this.textPenaltyGroup = new THREE.Group();

        this.startMenuGroup = new THREE.Group();

        this.convertTextToSprite(textAuthors, this.textAuthorsGroup);
        this.convertTextToSprite(textUsername, this.textUsernameGroup);
        this.convertTextToSprite(textPlayerBalloon, this.textPlayerBalloonGroup);
        this.convertTextToSprite(textOponentBalloon, this.textOponentBalloonGroup);
        this.convertTextToSprite(textNumberOfLaps, this.textNumberOfLapsGroup);
        this.convertTextToSprite(textPenalty, this.textPenaltyGroup);
        
        this.textAuthorsGroup.position.set(0,0, 0);
        this.textAuthorsGroup.scale.set(0.6,0.6, 0.6);
        this.textUsernameGroup.position.set(-4,30,0);
        this.textPlayerBalloonGroup.position.set(-4,25,0);
        this.textOponentBalloonGroup.position.set(-4,20,0);
        this.textNumberOfLapsGroup.position.set(-4,15,0);
        this.textPenaltyGroup.position.set(-4,10,0);

        this.startMenuGroup.add(this.textAuthorsGroup, this.textUsernameGroup, this.textPlayerBalloonGroup, this.textOponentBalloonGroup, this.textNumberOfLapsGroup, this.textPenaltyGroup);

        this.startMenuGroup.position.set(-70,11,-78.5);
        this.startMenuGroup.rotation.set(0,Math.PI/3,0);
        this.startMenuGroup.scale.set(0.5,0.5,0.5);
        this.app.scene.add(this.startMenuGroup);    
    }

    createButtonsPenalty(){
        this.buttonPenalty1 = new THREE.Group();
        this.buttonPenalty2 = new THREE.Group();

        let buttonMaterial = new THREE.MeshPhongMaterial({color:0xEEEEEE});
        let buttonGeometry = new THREE.CylinderGeometry(0.5,0.5,0.5,32);
        let buttonGeometry2 = new THREE.CylinderGeometry(0.5,0.5,0.5,32);

        let buttonMesh1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
        let buttonMesh3 = new THREE.Mesh(buttonGeometry2, buttonMaterial);
        let buttonMesh4 = new THREE.Mesh(buttonGeometry2, buttonMaterial);
        
        this.buttonPenaltyPlus = new THREE.Group();
        this.buttonPenaltyMinus = new THREE.Group();
        this.convertTextToSprite("-", this.buttonPenaltyMinus);
        this.convertTextToSprite("+", this.buttonPenaltyPlus);

        this.buttonPenaltyPlus.position.set(0,0.5,0);
        this.buttonPenaltyPlus.scale.set(0.4,0.4,0.4);
        this.buttonPenaltyMinus.position.set(0,0.5,0);
        this.buttonPenaltyMinus.scale.set(0.4,0.4,0.4);

        buttonMesh3.visible = false
        buttonMesh4.visible = false;
        buttonMesh3.position.set(0,0.5,0);
        buttonMesh4.position.set(0,0.5,0);

        this.buttonPenalty1.add(buttonMesh1, buttonMesh3, this.buttonPenaltyMinus);
        this.buttonPenalty1.position.set(-62.4,0,-93);
        this.buttonPenalty1.rotation.set(Math.PI/2,0,-Math.PI/3);

        this.buttonPenalty2.add(buttonMesh2, buttonMesh4, this.buttonPenaltyPlus);
        this.buttonPenalty2.position.set(-60.7,0,-96);
        this.buttonPenalty2.rotation.set(Math.PI/2,0,-Math.PI/3);

        this.buttonsPenaltyGroup = new THREE.Group();
        this.buttonsPenaltyGroup.add(this.buttonPenalty1, this.buttonPenalty2);
        this.buttonsPenaltyGroup.position.set(0,16,0);

        this.app.scene.add(this.buttonsPenaltyGroup);
    }

    updateTextTime() {
        const textTime = String(this.currentMatchTime);

        while (this.textNumbersGroup.children.length > 0) {
            this.textNumbersGroup.remove(this.textNumbersGroup.children[0]);
        }

        this.convertTextToSprite(textTime, this.textNumbersGroup);
    }

    updateTextWind() {
        const textWind = "Wind: " + this.currentWindVelocity;
    
        if (this.currentWindVelocity !== this.lastWindVelocity) {
            while (this.textWindGroup.children.length > 0) {
                this.textWindGroup.remove(this.textWindGroup.children[0]);
            }
            this.convertTextToSprite(textWind, this.textWindGroup);
        }

        this.lastWindVelocity = this.currentWindVelocity;
    }

    updateGameStatus() {
        const textGameStatus = "Status: " + this.currentGameState;
    
        if (this.currentGameState !== this.lastGameState) {
            while (this.textGameStatusGroup.children.length > 0) {
                this.textGameStatusGroup.remove(this.textGameStatusGroup.children[0]);
            }
            this.convertTextToSprite(textGameStatus, this.textGameStatusGroup);
        }

        this.lastGameState = this.currentGameState;
    }

    updateTextVouchers() {
        const textVouchers = "Vouchers: " + this.currentVouchers;
    
        if(this.currentVouchers !== this.lastVouchers){
            while (this.textVouchersGroup.children.length > 0) {
                this.textVouchersGroup.remove(this.textVouchersGroup.children[0]);
            }
            this.convertTextToSprite(textVouchers, this.textVouchersGroup);
        }
        this.lastVouchers = this.currentVouchers;
    }

    updateTextLaps() {
        const textLaps = "Laps: " + this.currentLaps + "/" + this.totalLaps;
    
        if(this.currentLaps !== this.lastLaps){
            while (this.textLapsGroup.children.length > 0) {
                this.textLapsGroup.remove(this.textLapsGroup.children[0]);
            }
            this.convertTextToSprite(textLaps, this.textLapsGroup);
        }
        this.lastLaps = this.currentLaps;
    }

    updateTextVouchers() {
        const textVouchers = "Vouchers: " + this.currentVouchers;
    
        if(this.currentVouchers !== this.lastVouchers){
            while (this.textVouchersGroup.children.length > 0) {
                this.textVouchersGroup.remove(this.textVouchersGroup.children[0]);
            }
            this.convertTextToSprite(textVouchers, this.textVouchersGroup);
        }
        this.lastVouchers = this.currentVouchers;
    }

    updateTextLaps() {
        const textLaps = "Laps: " + this.currentLaps + "/" + this.totalLaps;
    
        if(this.currentLaps !== this.lastLaps){
            while (this.textLapsGroup.children.length > 0) {
                this.textLapsGroup.remove(this.textLapsGroup.children[0]);
            }
            this.convertTextToSprite(textLaps, this.textLapsGroup);
        }
        this.lastLaps = this.currentLaps;
    }

    updateBlimpMenu() {
        this.updateTextTime();
        this.updateTextWind();
        this.updateTextVouchers();
        this.updateTextLaps();
    }

    convertTextToSprite(text, group) {
        let sheet = this.loader.load('images/spritesheet.png');
        const charMap = {
            " ": 0, "!": 1, "#": 3, "$": 4, "%": 5, "&": 6,
            "(": 8, ")": 9, "*": 10, "+": 11, ",": 12, "-": 13, ".": 14,
            "/": 15, "0": 16, "1": 17, "2": 18, "3": 19, "4": 20, "5": 21,
            "6": 22, "7": 23, "8": 24, "9": 25, ":": 26, ";": 27, "<": 28, 
            "=": 29, ">": 30, "?": 31, "@": 32, "A": 33, "B": 34, "C": 35,
            "D": 36, "E": 37, "F": 38, "G": 39, "H": 40, "I": 41, "J": 42, 
            "K": 43, "L": 44, "M": 45, "N": 46, "O": 47, "P": 48, "Q": 49, 
            "R": 50, "S": 51, "T": 52, "U": 53, "V": 54, "W": 55, "X": 56, 
            "Y": 57, "Z": 58, "[": 59, "]": 61, "^": 62, "_": 63, 
            "Ç": 96
        };

        const columns = 15;
        const rows = 8;
        const spriteWidth = 1 / columns;
        const spriteHeight = 1 / rows;

        
        let xOffset = 0; 
    
        for (let char of text) {
            const spriteIndex = charMap[char.toUpperCase()];
            if (spriteIndex === undefined) continue; // Skip if character is not in the map
    
            const x = spriteIndex % columns; // Column of the sprite
            const y = Math.floor(spriteIndex / columns); // Row of the sprite
    
            // Clone the texture for independent UV mapping
            const charTexture = sheet.clone();
            charTexture.offset.set(x * spriteWidth, 1 - (y + 1) * spriteHeight);
            charTexture.repeat.set(spriteWidth, spriteHeight);
    
            // Create a new material with the cloned texture
            const charMaterial = new THREE.SpriteMaterial({ map: charTexture });
    
            // Create a sprite with the new material
            const sprite = new THREE.Sprite(charMaterial);
    
            // Position the sprite relative to the sentence
            sprite.position.set(xOffset, 0, 0); // Adjust xOffset for spacing
            sprite.scale.set(2, 2, 2);
    
            // Add the sprite to the group
            group.add(sprite);
    
            // Update xOffset for the next character
            xOffset += 1.4; // Adjust spacing as needed
        }
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