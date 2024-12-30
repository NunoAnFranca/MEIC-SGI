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
        this.raycaster.far = 20

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"

        this.track = null;
        this.balloons = {};
        this.player1Balloon = null;
        this.player2Balloon = null;

        this.matchTime = null;
        this.currentMatchTime = 0;

        // structure of layers: each layer will contain its objects
        // this can be used to select objects that are pickeable     
        this.availableLayers = ['none', 1, 2, 3]
        this.selectedLayer = this.availableLayers[0]    // change this in interface

        // define the objects ids that are not to be pickeable
        // NOTICE: not a ThreeJS facility
        // this.notPickableObjIds = []
        // this.notPickableObjIds = ["col_0_0", "col_2_0", "col_1_1"]
        this.notPickableObjIds = ["A", "B", "track"]

        this.GAME_STATE = {
            INIT: 0,
            PLAY: 1,
            PAUSE: 2,
            END: 3
        }

        this.gameState = this.GAME_STATE.INIT;
      
        //register events

        document.addEventListener(
            // "pointermove",
            // "mousemove",
            "pointerdown",
            // list of events: https://developer.mozilla.org/en-US/docs/Web/API/Element
            this.onPointerMove.bind(this)
        );

        document.addEventListener("keydown", (event) => {
            if (this.gameState === this.GAME_STATE.INIT) {
                if (event.key === 'p' && this.player1Balloon && this.player2Balloon) {
                    this.restoreTranslate();
                    this.gameState = this.GAME_STATE.PLAY;
                    this.removeInitialPositions();
                    this.setCamera('BalloonFirstPerson');
                    this.matchTime = new Date().getTime();
                    setInterval(() => {
                        this.player = this.balloons[this.player1Balloon];
                        this.balloons[this.player1Balloon].moveWind();
                        this.currentMatchTime = Math.floor((new Date().getTime() - this.matchTime)/100);
                        console.log(this.currentMatchTime);
                    }, 30);
                }
            } else if (this.gameState === this.GAME_STATE.PLAY) {
                if (event.key === 'w') {
                    this.balloons[this.player1Balloon].moveUp();
                } else if (event.key === 's') {
                    this.balloons[this.player1Balloon].moveDown();
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
        //this.createStartMenu();

        this.reader = new MyParser(this.app);

        // create temp lights so we can see the objects to not render the entire scene
        this.buildLights();

        // build balloons
        this.buildBalloons();
        
        this.initialPositions = {"A": null, "B": null};
        this.buildInitialPosition("A", 27, -15);
        this.buildInitialPosition("B", 21, -15);

        // create the track
        this.track = new MyTrack(this.app);
        
        this.loader = new THREE.TextureLoader();

        this.loadBlimpMenu();

        this.testLetter();
        this.notPickableObjIds.push(this.track.mesh.name)
        this.lastPickedObj = null   
    }

    loadSpriteSheet() {
        // Load the sprite sheet texture
        let sheet = this.loader.load('images/spritesheet.png');
    
        // Create a material using the texture
        let material = new THREE.SpriteMaterial({ map: sheet });
    
        // Create a sprite
        let sprite = new THREE.Sprite(material);
    
        // Set the UV coordinates to show a specific sprite
        const spriteIndex = 50; // Index of the sprite (0 for the first sprite)
        const columns = 15; // Number of columns in the sprite sheet
        const rows = 8; // Number of rows in the sprite sheet
        const spriteWidth = 1 / columns; // Width of each sprite in UV space
        const spriteHeight = 1 / rows; // Height of each sprite in UV space
        const x = spriteIndex % columns; // Column of the sprite
        const y = Math.floor(spriteIndex / columns); // Row of the sprite
    
        // Adjust the UV coordinates
        sheet.offset.set(x * spriteWidth, 1 - (y + 1) * spriteHeight); // Offset for the sprite
        sheet.repeat.set(spriteWidth, spriteHeight); // Scale to show only one sprite
    
        // Adjust the position of the sprite and add it to the scene
        sprite.position.set(75, 15, -50); // Set position
        sprite.scale.set(2,2,2);
        this.app.scene.add(sprite);
    }
    
    loadBlimpMenu() {
        // Load the sprite sheet texture
        let sheet = this.loader.load('images/spritesheet.png');
    
        // Define the character-to-sprite index map
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
    
        // Define the string you want to display
        const text = "The characters work as intended!";
    
        // Dimensions of the sprite sheet
        const columns = 15;
        const rows = 8;
        const spriteWidth = 1 / columns;
        const spriteHeight = 1 / rows;
    
        // Create a group to hold the text
        const textGroup = new THREE.Group();
    
        let xOffset = 0; // Initial x-offset for text positioning
    
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
            textGroup.add(sprite);
    
            // Update xOffset for the next character
            xOffset += 1.4; // Adjust spacing as needed
        }
    
        // Position the entire group in the scene
        textGroup.position.set(75, 2, -50);
        this.app.scene.add(textGroup);
    
        console.log("Text displayed as a group.");
    }
    
    /*
    *
    * Setup Lights
    *
    */
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
                this.balloons["R_col_" + i + "_" + j] = new MyBalloon(this.app, "R_col_" + i + "_" + j, j * 6 + 35, 4, - 6 * (i + 1) - 5, (i + j) % 5 + 1);
                this.balloons["B_col_" + i + "_" + j] = new MyBalloon(this.app, "B_col_" + i + "_" + j, j * 6, 4, - 6 * (i + 1) - 5, (i + j) % 5 + 1);
            }
        }
    }

    buildInitialPosition(name, xPos, zPos) {
        let geometry = new THREE.CylinderGeometry(1,1,0.2,64);

        let positionsMaterial = new THREE.MeshPhongMaterial({
            color: "#888888",
            specular: "#000000",
            emissive: "#000000",
            shininess: 90,
        });

        let mesh = new THREE.Mesh(geometry, positionsMaterial);
        mesh.position.set(xPos, 0.8, zPos);
        mesh.name = name;
        this.app.scene.add(mesh);
    }

    removeInitialPositions() {
        for (let key in this.initialPositions) {
            this.app.scene.remove(this.app.scene.getObjectByName(key));
        }
    }

    /*
    *
    * Only object from selected layer will be eligible for selection
    * when 'none' is selected no layer is active, so all objects can be selected
    */
    updateSelectedLayer() {
        this.raycaster.layers.enableAll()
        if (this.selectedLayer !== 'none') {
            const selectedIndex = this.availableLayers[parseInt(this.selectedLayer)]
            this.raycaster.layers.set(selectedIndex)
        }
    }

    /*
    * Change the position of the first intersected object
    *
    */
    changeTranslate(obj) {
        if (this.lastPickedObj != obj) {
            if (this.lastPickedObj) {
                this.lastPickedObj.parent.translateY(-1);
            }

            this.lastPickedObj = obj;
            this.lastPickedObj.parent.translateY(1);
        }
    }

    /*
     * Restore the original position of the intersected object
     *
     */
    restoreTranslate() {
        if (this.lastPickedObj) {
            this.lastPickedObj.parent.translateY(-1);
        }

        this.lastPickedObj = null;
    }

    changeObjectPosition(obj) {
        if (this.lastPickedObj != obj) {
            if (this.lastPickedObj) {
                this.balloons[this.lastPickedObj.name].setPosition(obj.position.x, obj.position.y + 5, obj.position.z);
            }

            this.lastPickedObj.parent.translateY(-1);
            this.lastPickedObj = null;
        }
    }

    /*
    * Helper to visualize the intersected object
    *
    */
    pickingHelper(intersects) {
        if (intersects.length > 0 && this.gameState === this.GAME_STATE.INIT) {
            const obj = intersects[0].object;
            if (this.notPickableObjIds.includes(obj.name)) {
                if (this.lastPickedObj) {
                    switch (this.lastPickedObj.name.charAt(0)) {
                        case "R":
                            if (obj.name === "A" && this.initialPositions["A"] === null) {
                                this.initialPositions["A"] = this.lastPickedObj.name;
                                this.player1Balloon = this.lastPickedObj.name;
                                this.changeObjectPosition(obj)
                            }
                            break;
                        case "B":
                            if (obj.name === "B" && this.initialPositions["B"] === null) {
                                this.initialPositions["B"] = obj.name;
                                this.player2Balloon = this.lastPickedObj.name;
                                this.changeObjectPosition(obj)
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    this.restoreTranslate();
                }
            } else {
                this.changeTranslate(obj);
            }
        }
    }

    createStartMenu() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
              
        canvas.width = 1920;
        canvas.height = 1080;

        const backgroundImage = new Image();
        backgroundImage.src = 'images/menu.jpg';
      
        backgroundImage.onload = () => {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 90px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PLAY', canvas.width / 2, canvas.height / 2);

        texture.needsUpdate = true;
        };
      
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(128, 72), material);
        plane.rotation.x= -Math.PI/2;
        
        const box = new THREE.BoxGeometry(15,5,5);
        const boxMaterial = new THREE.MeshPhongMaterial({color:0x0000ff});
        const boxMesh = new THREE.Mesh(box, boxMaterial);
        boxMesh.position.set(0,20,0);
        boxMesh.visible = false;
        this.app.scene.add(boxMesh);

        plane.position.set(0, 20, 0);
        this.app.scene.add(plane);
     
            
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseClick = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersects = raycaster.intersectObject(boxMesh);

            if (intersects.length > 0) {
                this.app.scene.remove(boxMesh);
                this.app.scene.remove(plane);
            }
        };

        window.addEventListener('click', onMouseClick);
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

    /**
     * FUNCTION 
     * TEST 
     * LETTER 
     * */
    testLetter() {
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new TextGeometry('Hello, Three.js!', {
                font: font,
                size: 1,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelSegments: 5
            });
        
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
            this.app.scene.add(textMesh);
            textMesh.position.set(-5, 0, 0);
        });
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
        this.balloons[this.player1Balloon].setCamera(this.app.cameras[cameraName]);
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
        switch (this.gameState) {
            case this.GAME_STATE.INIT:
                break;
            case this.GAME_STATE.PLAY:
                this.balloons[this.player1Balloon].update();
                break;
            case this.GAME_STATE.PAUSE:
                break;
            case this.GAME_STATE.END:
                break;
            default:
                break;
        }
    }
}

export { MyContents };
