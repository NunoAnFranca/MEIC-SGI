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
        this.floorMaterial = new THREE.MeshPhongMaterial({ color: this.diffuseFloorColor, 
            specular: this.specularFloorColor, emissive: "#000000", shininess: this.floorShininess });
    }
0
	buildWalls() {
		let wallMaterial = new THREE.MeshPhongMaterial({color: "#80573e", specular: "#80573e", emissive: "#80573e", shininess: 0});
	
		let wallWidth = 25;
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

    buildCake() {
        const materials = {
            brown: new THREE.MeshPhongMaterial({ color: "#3B1D14", specular: "#000000", emissive: "#000000", shininess: 90 }),
            pink: new THREE.MeshPhongMaterial({ color: "#FFC0CB", specular: "#000000", emissive: "#000000", shininess: 90 }),
            plate: new THREE.MeshPhongMaterial({ color: "#D3D3D3", specular: "#000000", emissive: "#000000", shininess: 90 }),
            flame: new THREE.MeshPhongMaterial({ color: "#FFA500", specular: "#111111", emissive: "#FFFF00", shininess: 30, transparent:true, opacity:0.8 }),
            base: new THREE.MeshPhongMaterial({ color: "#FFFFFF", specular: "#000000", emissive: "#000000", shininess: 40})
        };

        this.cakeMesh = new THREE.Group();

        const candleRadius = 0.02;
        const candleHeight = 0.25;
        const slicePosition = 1.5;
		const cakeRadius = 0.5;
		const cakeThickness = 0.15;
		const radialSegments = 32;
		const cakeAngle = 2 * Math.PI - Math.PI / 4;
		const plateRadius = 0.7;
		const plateThickness = 0.04;
		const tableHeight = 2.5 + 0.3 / 2; // legHeight + tableThickness / 2

        const cake = new THREE.CylinderGeometry(cakeRadius, cakeRadius, cakeThickness, radialSegments, 1, false, 0, cakeAngle);
		const endCake = new THREE.PlaneGeometry(cakeRadius, cakeThickness);
        const coneFlame = new THREE.ConeGeometry(candleRadius/2, candleHeight/5, radialSegments);
        const candleBase = new THREE.CylinderGeometry(candleRadius,candleRadius,candleHeight,radialSegments);
        const candleRope = new THREE.CylinderGeometry(candleRadius/8,candleRadius/8,candleHeight/5,radialSegments);
        const slicecake = new THREE.CylinderGeometry(cakeRadius, cakeRadius, cakeThickness, radialSegments, 1, false, 0, Math.PI / 4);

        this.cakeMesh = new THREE.Group();
        this.sliceCakeMesh = new THREE.Group();

        ['brown', 'pink', 'brown'].forEach((color, i) => {
            const mesh = new THREE.Mesh(cake, materials[color]);
            mesh.position.set(0, tableHeight + plateThickness + cakeThickness * (1 + 2 * i) / 2, 0);
            this.cakeMesh.add(mesh);

            const endMesh1 = new THREE.Mesh(endCake, materials[color]);
            endMesh1.position.set(0, tableHeight + plateThickness + cakeThickness * (1 + 2 * i) / 2, cakeRadius / 2);
            endMesh1.rotation.y = -Math.PI / 2;
            this.cakeMesh.add(endMesh1);

            const endMesh2 = new THREE.Mesh(endCake, materials[color]);
            endMesh2.position.set(- cakeRadius / Math.sqrt(2) / 2, tableHeight + plateThickness + cakeThickness * (1 + 2 * i) / 2, cakeRadius / Math.sqrt(2) / 2);
            endMesh2.rotation.y = Math.PI / 4;
            this.cakeMesh.add(endMesh2);

            //Slice creation
            const meshSlice = new THREE.Mesh(slicecake, materials[color]);
            meshSlice.position.set(0,cakeThickness * (1 + 2 * i) / 2,0);
            this.sliceCakeMesh.add(meshSlice);

            const endSlice1 = new THREE.Mesh(endCake, materials[color]);
            endSlice1.position.set(0,cakeThickness * (1 + 2 * i) / 2, cakeRadius / 2);
            endSlice1.rotation.y = -Math.PI / 2;
            this.sliceCakeMesh.add(endSlice1);

            const endSlice2 = new THREE.Mesh(endCake, materials[color]);
            endSlice2.position.set(cakeRadius / Math.sqrt(2) / 2,cakeThickness * (1 + 2 * i) / 2, cakeRadius / Math.sqrt(2) / 2);
            endSlice2.rotation.y = (3*Math.PI) / 4;
            this.sliceCakeMesh.add(endSlice2);
        })

        const plate = new THREE.CylinderGeometry(plateRadius, plateRadius, plateThickness, radialSegments);
        const plateMesh = new THREE.Mesh(plate, materials.plate);
        plateMesh.position.set(0, tableHeight + plateThickness / 2, 0);
        this.cakeMesh.add(plateMesh);

        //Slice position
        this.sliceCakeMesh.position.set(slicePosition - cakeRadius/2, tableHeight + plateThickness, slicePosition/2 - cakeRadius/2);
        this.sliceCakeMesh.rotation.z = Math.PI/2;
        this.sliceCakeMesh.rotation.y = Math.PI/2;
        this.cakeMesh.add(this.sliceCakeMesh);

        //Slice plate position
        const smallPlate = new THREE.CylinderGeometry(3*plateRadius/5, 3*plateRadius/5, plateThickness, radialSegments);
        const smallPlateMesh = new THREE.Mesh(smallPlate, materials.plate);
        smallPlateMesh.position.set(slicePosition, tableHeight + plateThickness / 2, slicePosition/2);
        this.cakeMesh.add(smallPlateMesh);        

        //Candle creation
        for (let i = 0; i < 5; i += 1) {
            const candle = new THREE.Object3D();

            const cFlame = new THREE.Mesh(coneFlame, materials.flame);
            cFlame.position.set(3*cakeRadius/5,tableHeight + plateThickness + cakeThickness*3.5+candleHeight/1.5,0);
            candle.add(cFlame);

            const cBase = new THREE.Mesh(candleBase, materials.base);
            cBase.position.set(3*cakeRadius/5,tableHeight + plateThickness + cakeThickness*3.5,0);
            candle.add(cBase);

            const cRope = new THREE.Mesh(candleRope, materials.base);
            cRope.position.set(3*cakeRadius/5,tableHeight + plateThickness + cakeThickness*3.5+candleHeight/2,0);
            candle.add(cRope);

            this.cakeMesh.add(candle);
            candle.rotation.y = -Math.PI/3 + i*(Math.PI/3);
        }
    }

    /**
     * builds the table mesh with material assigned
     */
    buildTable() {
        const loader = new THREE.TextureLoader();
        const woodTexture = loader.load('textures/wood.jpg');
        woodTexture.colorSpace = THREE.SRGBColorSpace;

        const woodMaterial = new THREE.MeshBasicMaterial({color: "#FF8844", map: woodTexture});
        let legMaterial = new THREE.MeshPhongMaterial({color: "#A1662F", specular: "#ffffff", emissive: "#000000", shininess: 100});

        let legRadius = 0.15;
        let legHeight = 2.5;
        let radialSegments = 32;

        let tableWidth = 5;
        let tableLength = 3;
        let tableThickness = 0.3;

        this.tableMesh = new THREE.Group();

        let tableTop = new THREE.BoxGeometry(tableWidth + tableThickness, tableThickness, tableLength + tableThickness);
        this.topMesh = new THREE.Mesh(tableTop, woodMaterial);
        this.topMesh.position.set(0, legHeight, 0);
        this.tableMesh.add(this.topMesh);

        let legPositions = [
            {x: tableWidth / 2, y: legHeight / 2, z: tableLength / 2},
            {x: -tableWidth / 2, y: legHeight / 2, z: tableLength / 2},
            {x: tableWidth / 2, y: legHeight / 2, z: -tableLength / 2},
            {x: -tableWidth / 2, y: legHeight / 2, z: -tableLength / 2}
        ];

        for (let i = 0; i < 4; i++) {
            let leg = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, radialSegments);
            let legMesh = new THREE.Mesh(leg, legMaterial);
            legMesh.position.set(legPositions[i].x, legPositions[i].y, legPositions[i].z);
            this.tableMesh.add(legMesh);
        }
    }

    buildFloor() {
        const loader = new THREE.TextureLoader();
        const floorTexture = loader.load('textures/floor.jpg');
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const floorMaterial = new THREE.MeshBasicMaterial({color: "#ffffff", map: floorTexture});

        let floor = new THREE.PlaneGeometry(25, 25);
        let firstFloorMesh = new THREE.Mesh(floor, floorMaterial);
		let secondFloorMesh = new THREE.Mesh(floor, floorMaterial);
        firstFloorMesh.rotation.x = -Math.PI / 2;
        firstFloorMesh.position.y = -0;
		secondFloorMesh.rotation.x = Math.PI / 2;
        this.app.scene.add(firstFloorMesh);
		this.app.scene.add(secondFloorMesh);
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

        this.buildFloor();
        this.buildWalls();
		this.buildTable()
        this.buildCake()
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
    updateFloorShininess(value) {
        this.floorShininess = value;
        this.floorMaterial.shininess = this.floorShininess;
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

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        this.updateTable()
        this.updateCake()
    }
}

export { MyContents };
