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
        this.app = app;
        this.axis = null;

		// this.coneMesh = null
        // this.coneMeshSize = 1.0
        // this.coneEnabled = true
        // this.lastConeEnabled = null

        // box related attributes
        this.boxMesh = null;
        this.boxMeshSize = 1.0;
        this.boxEnabled = true;
        this.lastBoxEnabled = null;
        this.boxDisplacement = new THREE.Vector3(0,2,0);

        // floor related attributes
        this.diffuseFloorColor = "#00000";
        this.specularFloorColor = "#777777";
        this.floorShininess = 30;
        this.floorMaterial = new THREE.MeshPhongMaterial({ color: this.diffuseFloorColor, 
            specular: this.specularFloorColor, emissive: "#000000", shininess: this.floorShininess });
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        let boxMaterial = new THREE.MeshPhongMaterial({ color: "#ffff77",  specular: "#000000", emissive: "#000000", shininess: 90 });

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, boxMaterial );
        this.boxMesh.rotation.x = -Math.PI / 2;
        this.boxMesh.position.y = this.boxDisplacement.y;
    }

	buildWalls() {
		let wallMaterial = new THREE.MeshPhongMaterial({
			color: "#80573e",
			specular: "#000000",
			emissive: "#241811",
			shininess: 200,
		});
	
		let wallWidth = 20;
		let wallHeight = 10;
	
		for (let i = 0; i < 4; i += 1) {
			let wall = new THREE.PlaneGeometry(wallWidth, wallHeight);
			let firstWallMesh = new THREE.Mesh(wall, wallMaterial);
			let secondWallMesh = new THREE.Mesh(wall, wallMaterial);
	
			switch (i) {
				case 0:
					firstWallMesh.position.set(0, wallHeight / 2, wallWidth / 2);
					secondWallMesh.position.set(0, wallHeight / 2, -wallWidth / 2);
					firstWallMesh.rotation.x = Math.PI;
					break;
				case 1:
					firstWallMesh.position.set(wallWidth / 2, wallHeight / 2, 0);
					secondWallMesh.position.set(-wallWidth / 2, wallHeight / 2, 0);
					firstWallMesh.rotation.y = Math.PI / 2;
					secondWallMesh.rotation.y = -Math.PI / 2;
					break;
				case 2:
					firstWallMesh.position.set(0, wallHeight / 2, -wallWidth / 2);
					secondWallMesh.position.set(0, wallHeight / 2, wallWidth / 2);
					firstWallMesh.rotation.x = Math.PI;
					break;
				case 3:
					firstWallMesh.position.set(-wallWidth / 2, wallHeight / 2, 0);
					secondWallMesh.position.set(wallWidth / 2, wallHeight / 2, 0);
					firstWallMesh.rotation.y = Math.PI / 2;
					secondWallMesh.rotation.y = -Math.PI / 2;
					break;
			}

			this.app.scene.add(firstWallMesh);
			this.app.scene.add(secondWallMesh);
		}
	}

    /*buildCone() {
        let coneMaterial = new THREE.MeshPhongMaterial({color: "#ff0077", 
        	specular: "#000000", emissive: "#00F0F0", shininess: 90});

        let cone = new THREE.ConeGeometry( this.coneMeshSize, 2,50);
        this.coneMesh = new THREE.Mesh(cone, coneMaterial);
        this.coneMesh.position.y = 5
    }*/

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

        // add a point light on top of the model
        const pointLight = new THREE.PointLight(0xffffff, 500, 0);
        pointLight.position.set(0, 20, 0);
        this.app.scene.add(pointLight);

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        this.app.scene.add(pointLightHelper);

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.app.scene.add(ambientLight);

        this.buildBox();
        this.buildWalls();
		// this.buildCone()
        
        // Create a Floor Mesh with basic material
        
        let floor = new THREE.PlaneGeometry(20, 20);
        this.firstFloorMesh = new THREE.Mesh(floor, this.floorMaterial);
		this.secondFloorMesh = new THREE.Mesh(floor, this.floorMaterial);
        this.firstFloorMesh.rotation.x = -Math.PI / 2;
        this.firstFloorMesh.position.y = -0;
		this.secondFloorMesh.rotation.x = Math.PI / 2;
        this.app.scene.add(this.firstFloorMesh);
		this.app.scene.add(this.secondFloorMesh);
    }
    
    /**
     * updates the diffuse floor color and the material
     * @param {THREE.Color} value 
     */
    updatediffuseFloorColor(value) {
        this.diffuseFloorColor = value;
        this.floorMaterial.color.set(this.diffuseFloorColor);
    }
    /**
     * updates the specular floor color and the material
     * @param {THREE.Color} value 
     */
    updatespecularFloorColor(value) {
        this.specularFloorColor = value;
        this.floorMaterial.specular.set(this.specularFloorColor);
    }
    /**
     * updates the floor shininess and the material
     * @param {number} value 
     */
    updatefloorShininess(value) {
        this.floorShininess = value;
        this.floorMaterial.shininess = this.floorShininess;
    }
    
    /*rebuildCone(){
        if (this.coneMesh !== undefined && this.coneMesh !== null) {  
            this.app.scene.remove(this.coneMesh)
        }
        this.buildCone();
        this.lastConeEnabled = null
    }*/

    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh);
        }
        this.buildBox();
        this.lastBoxEnabled = null;
    }
    
    /*updateCone() {
        if (this.coneEnabled !== this.lastConeEnabled) {
            this.lastConeEnabled = this.coneEnabled
            if(this.coneEnabled){
                this.app.scene.add(this.coneMesh)
            }
            else {
                this.app.scene.remove(this.coneMesh)
            }
        }
    }*/

    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh);
            }
            else {
                this.app.scene.remove(this.boxMesh);
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
        this.updateBoxIfRequired();
        
		// this.updateCone()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x;
        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.position.z = this.boxDisplacement.z;
        
    }
}

export { MyContents };
