import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

import { MySpringGuy } from './contents/MySpringGuy.js';
import { MyRadio } from './contents/MyRadio.js';
import { MyVase } from './contents/MyVase.js';
import { MyFlower } from './contents/MyFlower.js';
import { MySpotStudent } from './contents/MySpotStudent.js';
import { MySpotCake } from './contents/MySpotCake.js';
import { MyCake } from './contents/MyCake.js';
import { MyTelevision } from './contents/MyTelevision.js';
import { MyChair } from './contents/MyChair.js';
import { MyBillboard } from './contents/MyBillboard.js';
import { MyJournal } from './contents/MyJournal.js';
import { MyCurveObjects } from './contents/MyCurveObjects.js';
import { MyRoom } from './contents/MyRoom.js';
import { MySpring } from './contents/MySpring.js';
import { MyLamp } from './contents/MyLamp.js';
import { MyCouch } from './contents/MyCouch.js';
/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;
        this.axis = null;
        this.axisVisible = false;

        this.spotStudent = null;
        this.spotCake = null;
        this.springGuy = null;
        
        // table related attributes
        this.tableMesh = null;
        this.tableEnabled = true;
        this.lastTableEnabled = null;

        // cake related attributes
        this.cakeMesh = null;
        this.cakeEnabled = true;
        this.lastCakeEnabled = null;

        // floor related attributes
        this.diffuseFloorColor = "#ffffff";
        this.specularFloorColor = "#777777";
        this.floorShininess = 30;
        this.floorMaterial = new THREE.MeshPhongMaterial({ color: this.diffuseFloorColor, specular: this.specularFloorColor, emissive: "#000000", shininess: this.floorShininess });

        // other objects related attributes
        this.legHeight = 2.5;
        this.tableThickness = 0.3;

        // shadow related attributes
        this.mapSize = 4096;

        // room related attributes
        this.roomWidth = 25;
        this.roomHeight = 12;
        this.roomThickness = 0.1;

        // texture loader
        this.loader = new THREE.TextureLoader();
    }

    /**
     * builds the table mesh with material assigned
     */
    buildTable() {
        const woodTexture = this.loader.load('textures/wood.jpg');
        woodTexture.colorSpace = THREE.SRGBColorSpace;

        const woodMaterial = new THREE.MeshPhongMaterial({color: "#FF8844", map: woodTexture, opacity:1}); // otherwise the texture absorbs all light ## check this. light goes through, transparent:false, opacity:1
        let legMaterial = new THREE.MeshPhongMaterial({color: "#A1662F", specular: "#ffffff", emissive: "#000000", shininess: 100});

        let legRadius = 0.15;
        let radialSegments = 32;

        let tableWidth = 7;
        let tableLength = 4;

        this.tableMesh = new THREE.Group();

        let tableTop = new THREE.BoxGeometry(tableWidth + this.tableThickness, this.tableThickness, tableLength + this.tableThickness);
        this.topMesh = new THREE.Mesh(tableTop, woodMaterial);
        this.topMesh.position.set(0, this.legHeight, 0);
        this.topMesh.receiveShadow = true;
        this.topMesh.castShadow = true;
        this.tableMesh.add(this.topMesh);

        let legPositions = [
            {x: tableWidth / 2, y: this.legHeight / 2, z: tableLength / 2},
            {x: -tableWidth / 2, y: this.legHeight / 2, z: tableLength / 2},
            {x: tableWidth / 2, y: this.legHeight / 2, z: -tableLength / 2},
            {x: -tableWidth / 2, y: this.legHeight / 2, z: -tableLength / 2}
        ];

        for (let i = 0; i < 4; i++) {
            let leg = new THREE.CylinderGeometry(legRadius, legRadius, this.legHeight, radialSegments);
            let legMesh = new THREE.Mesh(leg, legMaterial);
            legMesh.position.set(legPositions[i].x, legPositions[i].y, legPositions[i].z);
            legMesh.receiveShadow = true;
            legMesh.castShadow = true;
            this.tableMesh.add(legMesh);
        }
    }
    
    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.axisVisible = true;
            this.app.scene.add(this.axis);
        }

        // add a general ambient light
        const ambientLight = new THREE.AmbientLight(0x555555, 5);
        this.app.scene.add(ambientLight);

        // creates a directional light - ambient light
        const roomAmbientLight = new THREE.DirectionalLight("#ffffff", 1.5);
        roomAmbientLight.position.set(0, 25, 0);
        roomAmbientLight.castShadow = true;
        roomAmbientLight.shadow.mapSize.width = this.mapSize;
        roomAmbientLight.shadow.mapSize.height = this.mapSize;
        roomAmbientLight.shadow.camera.near = 0.5;
        roomAmbientLight.shadow.camera.far = 100;
        roomAmbientLight.shadow.camera.left = -15;
        roomAmbientLight.shadow.camera.right = 15;
        roomAmbientLight.shadow.camera.bottom = -15;
        roomAmbientLight.shadow.camera.top = 15;

        //this.app.scene.add(roomAmbientLight);

        // creates a point light
        const roomLight = new THREE.PointLight("#484a2c", 100, 0, 0);
        roomLight.position.set(10, 15, 10);
        roomLight.castShadow = true;
        roomLight.shadow.mapSize.width = this.mapSize;
        roomLight.shadow.mapSize.height = this.mapSize;
        roomLight.shadow.camera.near = 0.5;
        roomLight.shadow.camera.far = 100;

        this.app.scene.add(roomLight);
        
        this.springGuy = new MySpringGuy(this.app);
        this.radio = new MyRadio(this.app);
        this.vase = new MyVase(this.app);
        this.flower = new MyFlower(this.app);
        this.spotStudent = new MySpotStudent(this.app);
        this.spotCake = new MySpotCake(this.app);
        this.cake = new MyCake(this.app, this.legHeight, this.tableThickness);
        this.television = new MyTelevision(this.app);
        this.chair = new MyChair(this.app);
        this.billboard = new MyBillboard(this.app);
        this.journal = new MyJournal(this.app);
        this.curveObjects = new MyCurveObjects(this.app, this.roomWidth);
        this.room = new MyRoom(this.app, this.roomWidth, this.roomHeight, this.roomThickness);
        this.spring = new MySpring(this.app);
        this.lamp = new MyLamp(this.app);
        this.couch = new MyCouch(this.app, this.roomHeight, this.roomWidth);
       
        
        this.buildTable();
        this.room.buildFloor();
        this.room.buildWalls();
        this.room.buildWindow(this.roomHeight, this.roomWidth);
        this.room.buildCarpet();
        this.room.buildLandscapeSphere();
        this.room.buildFrame(0.1, 2, 3, 0.1, 3.5, 6, false, 'textures/luis.jpg',"#ffffff", 'back');
        this.room.buildFrame(0.1, 2, 3, 0.1, -3.5, 6, false, 'textures/nuno.jpg',"#ffffff", 'back');
        this.room.buildFrame(0.1, 3, 2, 0.1, 5, 6, false, 'textures/cork.jpg', "#ffffff", 'front');
        this.room.buildFrame(0.1, 3, 3.5, 0.1, -5, 6, false, 'textures/cork.jpg', "#ffffff", 'front');
        this.spring.buildSpring();
        this.lamp.buildLamp();
        this.curveObjects.buildBeetle();
        this.curveObjects.buildFlower();
        this.spotStudent.buildSpot(3.5,this.roomHeight,6,this.roomWidth);
        this.spotStudent.buildSpot(-3.5,this.roomHeight,6,this.roomWidth);
        this.spotCake.buildSpot(3*this.roomWidth/8,this.roomHeight,0);
        this.springGuy.buildSpringGuy(this.roomHeight, this.roomWidth);
        this.radio.buildRadio(this.roomHeight, this.roomWidth);
        this.vase.buildVase(3,this.roomWidth/2-1,3);
        this.vase.buildVase(1.5,this.roomWidth/2-2,2);
        this.vase.buildVase(0,this.roomWidth/2-1,4);
        this.flower.buildFlower(3,this.roomWidth/2-1,2);
        this.flower.buildFlower(1.5,this.roomWidth/2-2,3);
        this.flower.buildFlower(0,this.roomWidth/2-1,4);
        this.cake.buildCake();
        this.television.buildTelevision(this.roomWidth/2,3*this.roomHeight/5,0);
        this.chair.buildChair(2,3,Math.PI/6);
        this.chair.buildChair(-2,3,-Math.PI/3);
        this.chair.buildChair(-2.5,-2,-Math.PI);
        this.chair.buildChair(1.5,-2,-Math.PI);
        this.billboard.buildBillboard(this.roomWidth,this.roomHeight,this.roomWidth);
        this.journal.buildJournal();
        this.couch.buildCouch();
    }

    updateTable() {
        if (this.tableEnabled !== this.lasttableEnabled) {
            this.lasttableEnabled = this.tableEnabled
            if(this.tableEnabled){
                this.app.scene.add(this.tableMesh)
            }
            else {
                this.app.scene.remove(this.tableMesh)
            }
        }
    }

    toggleAxis() {
        this.axis.visible = !this.axis.visible;
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        this.updateTable()
    }
}

export { MyContents };
