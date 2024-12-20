import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyTrack } from "./MyTrack.js";

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

        //picking: read documentation of THREE.Raycaster

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 20

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"


        // structure of layers: each layer will contain its objects
        // this can be used to select objects that are pickeable     
        this.availableLayers = ['none', 1, 2, 3]
        this.selectedLayer = this.availableLayers[0]    // change this in interface

        // define the objects ids that are not to be pickeable
        // NOTICE: not a ThreeJS facility
        // this.notPickableObjIds = []
        // this.notPickableObjIds = ["col_0_0", "col_2_0", "col_1_1"]
        this.notPickableObjIds = ["A", "B"]
      
        //register events

        document.addEventListener(
            // "pointermove",
            // "mousemove",
            "pointerdown",
            // list of events: https://developer.mozilla.org/en-US/docs/Web/API/Element
            this.onPointerMove.bind(this)
        );

        this.track = null;
    }

    /**
     * initializes the contents
     */
    init() {
        // create once
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
        }

        //setup lights
        this.buildLights()


        //build boxes by columnS
        this.buildBaloonsColumn("col_0_", "#ff0000", 10)
        this.buildBaloonsColumn("col_1_", "#ff0000", 8)
        this.buildBaloonsColumn("col_2_", "#ff0000", 6)

        this.buildBaloonsColumn("col_3_", "#0000ff", -10)
        this.buildBaloonsColumn("col_4_", "#0000ff", -8)
        this.buildBaloonsColumn("col_5_", "#0000ff", -6)
        
        this.initialPoistions = ["A","B"];
        this.buildInitialPosition("A",3,2);
        this.buildInitialPosition("B",3,-2);

        // create the track
        this.track = new MyTrack(this.app);
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

    buildBaloonsColumn(name, color, posz) {
        for (let i = 0; i < 3; i++) {
            this.buildBaloon(name + i, color, i * 2, 2, posz)
        }
    }

    buildInitialPosition(name, xpos, zpos) {
        let geometry = new THREE.CylinderGeometry(1,1,0.2,64);

        let positionsMaterial = new THREE.MeshPhongMaterial({
            color: "#888888",
            specular: "#000000",
            emissive: "#000000",
            shininess: 90,
        });



        this.mesh = new THREE.Mesh(geometry, positionsMaterial);
        this.mesh.position.set(xpos,0.5,zpos);
        this.mesh.name = name;
        this.app.scene.add(this.mesh);

    }

    /**
     * builds the box mesh with material assigned
     */
    buildBaloon(name, color, xpos, ypos, zpos) {

        this.radius = 0.5;
        this.slices = 64;
        this.stacks = 64;

        let baloonMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: "#000000",
            emissive: "#000000",
            shininess: 90,
        });

        // Create a Cube Mesh with basic material
        let baloon = new THREE.SphereGeometry(
            this.radius,
            this.slices,
            this.stacks
        );

        this.baloonMesh = new THREE.Mesh(baloon, baloonMaterial);
        this.baloonMesh.name = name
        this.baloonMesh.position.x = xpos;
        this.baloonMesh.position.y = ypos;
        this.baloonMesh.position.z = zpos;

        this.app.scene.add(this.baloonMesh)
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
            if (this.lastPickedObj)
                this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
            this.lastPickedObj = obj;
            this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
            this.lastPickedObj.material.color.setHex(this.pickingColor);
        }
    }

    /*
     * Restore the original color of the intersected object
     *
     */
    restoreColorOfFirstPickedObj() {
        if (this.lastPickedObj)
            this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
        this.lastPickedObj = null;
    }

    changeObjectPosition( obj) {
        if (this.lastPickedObj != obj) {
            if (this.lastPickedObj){
                this.lastPickedObj.position.set(obj.position.x,obj.position.y+0.8,obj.position.z);
            }
            this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
            this.lastPickedObj = null;
        }
    }

    /*
    * Helper to visualize the intersected object
    *
    */
    pickingHelper(intersects) {
        if (intersects.length > 0) {
            const obj = intersects[0].object
            if (this.notPickableObjIds.includes(obj.name)) {
                if(this.lastPickedObj){
                    console.log("Object to choose");
                    if(!this.initialPoistions.includes(this.lastPickedObj.name)){
                        this.changeObjectPosition(obj)
                    }
                }
                else{
                    this.restoreColorOfFirstPickedObj()
                    console.log("Object cannot be picked !")
                }
            }
            else
                this.changeColorOfFirstPickedObj(obj)
        } else {
            this.restoreColorOfFirstPickedObj()
        }
    }


    /**
     * Print to console information about the intersected objects
     */
    transverseRaycastProperties(intersects) {
        for (var i = 0; i < intersects.length; i++) {

            console.log(intersects[i]);

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


    /**
     * updates the contents
     * this method is called from the render method of the app
     *
     */
    update() {
    }
}

export { MyContents };
