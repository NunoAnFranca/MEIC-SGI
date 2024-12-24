import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTrack } from "./MyTrack.js";
import { MyReader } from "./MyReader.js";
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
            "INIT": 0,
            "PLAY": 1,
            "PAUSE": 2,
            "END": 3
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
                    this.restoreColorOfFirstPickedObj();
                    this.gameState = this.GAME_STATE.PLAY;
                    this.removeInitialPositions();
                    setInterval(() => {
                        this.player = this.balloons[this.player1Balloon];
                        this.balloons[this.player1Balloon].moveWind();
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
        this.createStartMenu();

        //this.reader = new MyReader(this.app);

        // create temp lights so we can see the objects to not render the entire scene
        this.buildLights();

        // build balloons
        this.buildBalloons();
        
        this.initialPositions = {"A": null, "B": null};
        this.buildInitialPosition("A", 21.5, -15);
        this.buildInitialPosition("B", 17, -15);

        // create the track
        this.track = new MyTrack(this.app);
        
        this.testLetter();
        this.notPickableObjIds.push(this.track.mesh.name)
        this.lastPickedObj = null   
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
                this.balloons["R_col_" + i + "_" + j] = new MyBalloon(this.app, "R_col_" + i + "_" + j, j * 6 + 28, 4, - 6 * (i + 1) - 5, (i + j) % 5 + 1);
                this.balloons["B_col_" + i + "_" + j] = new MyBalloon(this.app, "B_col_" + i + "_" + j, j * 6 - 4, 4, - 6 * (i + 1) - 5, (i + j) % 5 + 1);
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
    * Update the color of selected object
    *
    */
    updatePickingColor(value) {
        this.pickingColor = value.replace('#', '0x');
    }

    /*
    * Change the color of the first intersected object
    *
    */
    changeColorOfFirstPickedObj(obj) {
        if (this.lastPickedObj != obj) {
            if (this.lastPickedObj) {
                this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
                for (let i = 6; i < this.lastPickedObj.parent.children.length; i++) {
                    this.lastPickedObj.parent.children[i].material.color.setHex(this.lastPickedObj.parent.children[i].currentHex);
                }
            }

            this.lastPickedObj = obj;
            this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
            this.lastPickedObj.material.color.setHex(this.pickingColor);

            for (let i = 6; i < this.lastPickedObj.parent.children.length; i++) {
                this.lastPickedObj.parent.children[i].currentHex = this.lastPickedObj.parent.children[i].material.color.getHex();
                this.lastPickedObj.parent.children[i].material.color.setHex(this.pickingColor);
            }
        }
    }

    /*
     * Restore the original color of the intersected object
     *
     */
    restoreColorOfFirstPickedObj() {
        if (this.lastPickedObj) {
            this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);

            for (let i = 6; i < this.lastPickedObj.parent.children.length; i++) {
                this.lastPickedObj.parent.children[i].material.color.setHex(this.lastPickedObj.parent.children[i].currentHex);
            }
        }

        this.lastPickedObj = null;
    }

    changeObjectPosition(obj) {
        if (this.lastPickedObj != obj) {
            if (this.lastPickedObj) {
                this.balloons[this.lastPickedObj.name].setPosition(obj.position.x, obj.position.y + 5, obj.position.z);
            }

            this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);

            for (let i = 6; i < this.lastPickedObj.parent.children.length; i++) {
                this.lastPickedObj.parent.children[i].material.color.setHex(this.lastPickedObj.parent.children[i].currentHex);
            }

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
                                this.balloons[this.player1Balloon].balloonGroup.children[10].add(this.app.cameras['Balloon']);
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
                    this.restoreColorOfFirstPickedObj()
                }
            } else {
                this.changeColorOfFirstPickedObj(obj)
            }
        } else {
            this.restoreColorOfFirstPickedObj()
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

        //console.log("Position x: " + this.pointer.x + " y: " + this.pointer.y);

        //2. set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.app.getActiveCamera());

        //3. compute intersections
        var intersects = this.raycaster.intersectObjects(this.app.scene.children);

        this.pickingHelper(intersects)

        this.transverseRaycastProperties(intersects)
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
    }
}

export { MyContents };
