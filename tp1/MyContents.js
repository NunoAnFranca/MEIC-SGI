import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // table related attributes
        this.tableMesh = null
        this.tableEnabled = true
        this.lasttableEnabled = null

        // cake related attributes
        this.cakeMesh = null
        this.cakeEnabled = true
        this.lastCakeEnabled = null

        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        // plane related attributes
        this.diffusePlaneColor = "#00ffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess })
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        let boxMaterial = new THREE.MeshPhongMaterial({ color: "#ffff77", 
        specular: "#000000", emissive: "#000000", shininess: 90 })

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, boxMaterial );
        this.boxMesh.rotation.x = -Math.PI / 2;
        this.boxMesh.position.y = this.boxDisplacement.y;
    }

   
    buildCake() {
        let cakeBrownMaterial = new THREE.MeshPhongMaterial({ color: "#3B1D14", 
            specular: "#000000", emissive: "#000000", shininess: 90 })

        let cakePinkMaterial = new THREE.MeshPhongMaterial({ color: "#FFC0CB", 
            specular: "#000000", emissive: "#000000", shininess: 90 })
    
        let plateMaterial = new THREE.MeshPhongMaterial({ color: "#D3D3D3", 
            specular: "#000000", emissive: "#000000", shininess: 90 })

        this.cakeMesh = new THREE.Group();

        let cake1 = new THREE.CylinderGeometry(0.5,0.5,0.12,32,1,false, 0, 2*Math.PI);//(5*Math.PI)/3);
        this.cMesh1 = new THREE.Mesh(cake1, cakeBrownMaterial);
        this.cMesh1.position.set(0,5.22,0);

        let cake2 = new THREE.CylinderGeometry(0.5,0.5,0.12,32,1,false, 0, 2*Math.PI);//(5*Math.PI)/3);
        this.cMesh2 = new THREE.Mesh(cake2, cakePinkMaterial);
        this.cMesh2.position.set(0,5.34,0);

        let cake3 = new THREE.CylinderGeometry(0.5,0.5,0.12,32,1,false, 0, 2*Math.PI);//(5*Math.PI)/3);
        this.cMesh3 = new THREE.Mesh(cake3, cakeBrownMaterial);
        this.cMesh3.position.set(0,5.46 ,0);

        //let planeLeft1 = new THREE.PlaneGeometry(0.5,0.33);
        //this.pMeshL1 = new THREE.Mesh(planeLeft1, cakeBrownMaterial);
        //this.pMeshL1.position.set(1,5.30,0);
        //this.pMeshL1.rotation.y = -(5*Math.PI)/6;

        let plate = new THREE.CylinderGeometry(0.7,0.7,0.04,32);
        this.plateMesh = new THREE.Mesh(plate, plateMaterial);
        this.plateMesh.position.set(0,5.15,0);

        this.cakeMesh.add(this.plateMesh);
        this.cakeMesh.add(this.cMesh1);
        this.cakeMesh.add(this.cMesh2);
        this.cakeMesh.add(this.cMesh3);
        this.cakeMesh.add(this.pMeshL1);


    }


    /**
     * builds the table mesh with material assigned
     */
    buildtable() {
        let tableMaterial = new THREE.MeshPhongMaterial({color: "#A1662F", 
        specular: "#000000", emissive: "#000000", shininess: 10})

        this.tableMesh = new THREE.Group()

        let tableTop = new THREE.BoxGeometry(5, 0.3,3);
        this.topMesh = new THREE.Mesh(tableTop, tableMaterial);
        this.topMesh.position.set(0,5,0);

        let leg1 = new THREE.CylinderGeometry(0.15,0.15,2.2,32);
        this.leg1Mesh = new THREE.Mesh(leg1, tableMaterial);
        this.leg1Mesh.position.set(2.2,4,1.2);

        let leg2 = new THREE.CylinderGeometry(0.15,0.15,2.2,32);
        this.leg2Mesh = new THREE.Mesh(leg2, tableMaterial);
        this.leg2Mesh.position.set(-2.2,4,1.2);

        let leg3 = new THREE.CylinderGeometry(0.15,0.15,2.2,32);
        this.leg3Mesh = new THREE.Mesh(leg3, tableMaterial);
        this.leg3Mesh.position.set(2.2,4,-1.2);

        let leg4 = new THREE.CylinderGeometry(0.15,0.15,2.2,32);
        this.leg4Mesh = new THREE.Mesh(leg4, tableMaterial);
        this.leg4Mesh.position.set(-2.2,4,-1.2);

        this.tableMesh.add(this.topMesh);
        this.tableMesh.add(this.leg1Mesh);
        this.tableMesh.add(this.leg2Mesh);
        this.tableMesh.add(this.leg3Mesh);
        this.tableMesh.add(this.leg4Mesh);

    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        this.app.scene.add( ambientLight );

        this.buildBox()
        this.buildtable()
        this.buildCake()
        // Create a Plane Mesh with basic material
        
        let plane = new THREE.PlaneGeometry( 10, 10 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }

    updateCake() {
        if (this.cakeEnabled !== this.lastCakeEnabled) {
            this.lastCakeEnabled = this.cakeEnabled
            if(this.cakeEnabled){
                this.app.scene.add(this.cakeMesh)
            }
            else {
                this.app.scene.remove(this.cakeMesh)
            }
        }
    }
    
    updatetable() {
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
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()
        this.updatetable()
        this.updateCake()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
        
    }

}

export { MyContents };