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
        this.floorMaterial = new THREE.MeshPhongMaterial({ color: this.diffuseFloorColor, specular: this.specularFloorColor, emissive: "#000000", shininess: this.floorShininess });

        // room related attributes
        this.roomWidth = 25;
        this.roomHeight = 10;

        // lights related attributes
        this.spotLightEnabled = true;
        this.spotLight = null;
        this.lastSpotLightEnabled = null;
        this.targetSpot = null;

        // texture loader
        this.loader = new THREE.TextureLoader();
    }

    buildLampSticks(angleX, angleZ, x, z) {
        const lampStick = new THREE.CylinderGeometry(0.1, 0.1, 1.6, 32, 32);
        const lampStickMaterial = new THREE.MeshPhongMaterial({color: "#d9af25"});
        const lampStickMesh = new THREE.Mesh(lampStick, lampStickMaterial);
        lampStickMesh.position.set(x, 2.5, z);
        lampStickMesh.rotation.set(angleX, 0, angleZ);
        
        return lampStickMesh;
    }

    buildLamp() {
        const lamp = new THREE.Group();
        const outerPart = new THREE.CylinderGeometry(0.8, 2.1, 2, 32, 32, true);
        const innerPart = new THREE.CylinderGeometry(0.7, 2, 2, 32, 32, true);
        const topRing = new THREE.RingGeometry(0.7, 0.8, 32);
        const bottomRing = new THREE.RingGeometry(2, 2.1, 32);
        const lampSupport = new THREE.CylinderGeometry(0.2, 0.2, 3, 32, 32);
        const lampMaterial = new THREE.MeshPhongMaterial({color: "#993240"});
        const lampSupportMaterial = new THREE.MeshPhongMaterial({color: "#8f6b1d"});
        lampMaterial.side = THREE.DoubleSide; 
        const outerPartMesh = new THREE.Mesh(outerPart, lampMaterial);
        const innerPartMesh = new THREE.Mesh(innerPart, lampMaterial);
        const topRingMesh = new THREE.Mesh(topRing, lampMaterial);
        const bottomRingMesh = new THREE.Mesh(bottomRing, lampMaterial);
        const lampSupportMesh = new THREE.Mesh(lampSupport, lampSupportMaterial);
        outerPartMesh.position.set(0, 3, 0);
        innerPartMesh.position.set(0, 3, 0);
        topRingMesh.position.set(0, 4, 0);
        topRingMesh.rotation.set(Math.PI / 2, 0, 0);
        bottomRingMesh.position.set(0, 2, 0);
        bottomRingMesh.rotation.set(Math.PI / 2, 0, 0);
        lampSupportMesh.position.set(0, 1, 0);

        lamp.add(outerPartMesh);
        lamp.add(innerPartMesh);
        lamp.add(topRingMesh);
        lamp.add(bottomRingMesh);
        lamp.add(lampSupportMesh);
        lamp.add(this.buildLampSticks(0, - Math.PI / 4, 0.7, 0));
        lamp.add(this.buildLampSticks(0, Math.PI / 4, -0.7, 0));
        lamp.add(this.buildLampSticks(Math.PI / 4, 0, 0, 0.7));
        lamp.add(this.buildLampSticks(- Math.PI / 4, 0, 0, -0.7));

        lamp.position.set(9, 0, -9);

        this.app.scene.add(lamp);
        
    }

    buildFrame(frameThickness, frameWidth, frameHeight, frameDepth, horizontalDisp, verticalDisp, hasFrame, imagePath, color, side) {
        const frameTexture = this.loader.load('textures/frame.jpg');
        frameTexture.colorSpace = THREE.SRGBColorSpace;
        const frameMaterial = new THREE.MeshPhongMaterial({color: color, map: frameTexture, specular: "#000000", shininess: 0});

        let frameParts = [
            {name: 'Left', geometry: new THREE.BoxGeometry(frameThickness, frameHeight, frameDepth), position: new THREE.Vector3(frameWidth / 2, 0, 0)},
            {name: 'Right', geometry: new THREE.BoxGeometry(frameThickness, frameHeight, frameDepth), position: new THREE.Vector3(- frameWidth / 2, 0, 0)},
            {name: 'Front', geometry: new THREE.BoxGeometry(frameWidth + frameThickness, frameThickness, frameDepth), position: new THREE.Vector3(0, frameHeight / 2, 0)},
            {name: 'Back', geometry: new THREE.BoxGeometry(frameWidth + frameThickness, frameThickness, frameDepth), position: new THREE.Vector3(0, - frameHeight / 2, 0)}
        ];

        let frameGroup = new THREE.Group();

        for (let framePart of frameParts) {
            let frameMesh = new THREE.Mesh(framePart.geometry, frameMaterial);
            frameMesh.position.copy(framePart.position);
            frameGroup.add(frameMesh);
        }

        switch (side) {
            case 'left':
                frameGroup.position.set(- this.roomWidth / 2, verticalDisp, horizontalDisp);
                frameGroup.rotation.y = Math.PI / 2;
                break;
            case 'right':
                frameGroup.position.set(this.roomWidth / 2, verticalDisp, horizontalDisp);
                frameGroup.rotation.y = Math.PI / 2;
                break;
            case 'front':
                frameGroup.position.set(horizontalDisp, verticalDisp, this.roomWidth / 2);
                break;
            case 'back':
                frameGroup.position.set(horizontalDisp, verticalDisp, - this.roomWidth / 2);
                frameGroup.rotation.y = Math.PI;
                break;
        }

        if (hasFrame) {
            let verticalStripe = new THREE.BoxGeometry(frameThickness, frameHeight, frameDepth);
            let horizontalStripe = new THREE.BoxGeometry(frameWidth + frameThickness, frameThickness, frameDepth);
            let verticalStripeMesh = new THREE.Mesh(verticalStripe, frameMaterial);
            let horizontalStripeMesh = new THREE.Mesh(horizontalStripe, frameMaterial);
            verticalStripeMesh.position.set(0, 0, 0);
            horizontalStripeMesh.position.set(0, 0, 0);
            frameGroup.add(verticalStripeMesh, horizontalStripeMesh);  
        }

        const imageTexture = this.loader.load(imagePath);
        imageTexture.colorSpace = THREE.SRGBColorSpace;

        const imageMaterial = new THREE.MeshBasicMaterial({color: "ffffff", map: imageTexture});
        let image = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth / 2);
        let imageMesh = new THREE.Mesh(image, imageMaterial);
        frameGroup.add(imageMesh);      

        this.app.scene.add(frameGroup);
    }

	buildWalls() {
        const wallTexture = this.loader.load('textures/wall.jpg');
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        const wallMaterial = new THREE.MeshPhongMaterial({color: "#80573e", map: wallTexture});
	
		for (let i = 0; i < 4; i += 1) {
			let wall = new THREE.PlaneGeometry(this.roomWidth, this.roomHeight);
			let firstWallMesh = new THREE.Mesh(wall, wallMaterial);
			let secondWallMesh = new THREE.Mesh(wall, wallMaterial);
	
			switch (i) {
				case 0:
					firstWallMesh.position.set(0, this.roomHeight / 2, this.roomWidth / 2);
					secondWallMesh.position.set(0, this.roomHeight / 2, -this.roomWidth / 2);
					firstWallMesh.rotation.x = Math.PI;
					break;
				case 1:
					firstWallMesh.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
					secondWallMesh.position.set(-this.roomWidth / 2, this.roomHeight / 2, 0);
					firstWallMesh.rotation.y = Math.PI / 2;
					secondWallMesh.rotation.y = -Math.PI / 2;
					break;
				case 2:
					firstWallMesh.position.set(0, this.roomHeight / 2, -this.roomWidth / 2);
					secondWallMesh.position.set(0, this.roomHeight / 2, this.roomWidth / 2);
					firstWallMesh.rotation.x = Math.PI;
					break;
				case 3:
					firstWallMesh.position.set(-this.roomWidth / 2, this.roomHeight / 2, 0);
					secondWallMesh.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
					firstWallMesh.rotation.y = Math.PI / 2;
					secondWallMesh.rotation.y = -Math.PI / 2;
					break;
			}

			this.app.scene.add(firstWallMesh, secondWallMesh);
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
        const woodTexture = this.loader.load('textures/wood.jpg');
        woodTexture.colorSpace = THREE.SRGBColorSpace;

        const woodMaterial = new THREE.MeshPhongMaterial({color: "#FF8844", map: woodTexture, opacity:1}); // otherwise the texture absorbs all light ## check this. light goes through, transparent:false, opacity:1
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
        const floorTexture = this.loader.load('textures/floor.jpg');
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const floorMaterial = new THREE.MeshPhongMaterial({color: "#ffffff", map: floorTexture});

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
     * Creates a radio in the corner of the living room
     */
    buildRadio(){

        // grill texture for radio
        const radioTexture = this.loader.load('textures/radio.jpg');
        radioTexture.colorSpace = THREE.SRGBColorSpace;

        const materials = {
            box: new THREE.MeshPhongMaterial({ color: "#545454", specular: "#ffffff", emissive: "#000000", shininess: 40 }),
            black: new THREE.MeshPhongMaterial({ color: "#000000", specular: "#545454", emissive: "#000000", shininess: 100 }),
            brown: new THREE.MeshPhongMaterial({ color: "#3B1D14", specular: "#000000", emissive: "#000000", shininess: 20 }),
            antena: new THREE.MeshPhongMaterial({ color:"0f0f0f", specular: "#000000", emissive: "#000000", shininess: 90 }),
            grillMaterial: new THREE.MeshPhongMaterial({color: "#e1bf44", specular: "#545454", map: radioTexture})
        }

        let radio = new THREE.Group();

        const boxWidth = 2;
        const boxHeight = 1.2;
        const boxdepth = 0.6;
        const topSize = 1.5;
        const radialSegments = 32;
        const legSize = 0.1;
        const legHeight = 3;
        const antenaRadius = 0.02;   
        const antenaHeight = 2;
        const baseRadius = 0.1;
        const baseHeight = 0.04;   

        // radio box construction
        const radioBox = new THREE.BoxGeometry(boxWidth, boxHeight,boxdepth);
        const boxMesh = new THREE.Mesh(radioBox, materials.box);

        // antenas for radio
        const antena = new THREE.CylinderGeometry(antenaRadius, antenaRadius/4, antenaHeight, radialSegments);
        const antena1Mesh = new THREE.Mesh(antena, materials.antena);
        antena1Mesh.position.set(-boxWidth*3/8 + (Math.sin(Math.PI/3)), legHeight/2-(legHeight/2-(Math.cos(Math.PI/3)*legHeight/2))/2,0);
        antena1Mesh.rotation.x = Math.PI;
        antena1Mesh.rotation.z = Math.PI/3;
        radio.add(antena1Mesh);
        
        const antena2Mesh = new THREE.Mesh(antena, materials.antena);
        antena2Mesh.position.set(-boxWidth*3/8 - (Math.sin(Math.PI/6)), legHeight/2,0);
        antena2Mesh.rotation.x = Math.PI;
        antena2Mesh.rotation.z = 11*Math.PI/6;
        radio.add(antena2Mesh);

        const antenasBase = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, radialSegments);
        const antenasBaseMesh = new THREE.Mesh(antenasBase, materials.antena);
        antenasBaseMesh.position.set(-boxWidth*3/8, boxHeight/2 + baseHeight/2,0);
        radio.add(antenasBaseMesh);

        // Plane for radio grill
        const grillDepth = 0.01;
        const planeGrill = new THREE.BoxGeometry(4*boxWidth/5, 3*boxHeight/5, grillDepth);
        const planeMesh = new THREE.Mesh(planeGrill, materials.grillMaterial);
        planeMesh.position.set(0,boxHeight/6,-boxdepth/2-grillDepth/2)
        radio.add(planeMesh);


        // buttons
        for(let i = 0; i < 2; i++){
            const buttonRadius = 0.1;
            const radialSegments = 16;

            const button = new THREE.CylinderGeometry(buttonRadius, buttonRadius, buttonRadius/2, radialSegments);
            const buttonMesh = new THREE.Mesh(button, materials.black);
            buttonMesh.position.set(-1*boxWidth/4+i*boxWidth/2,-1*boxHeight/3,-boxdepth/2 - buttonRadius/4);
            buttonMesh.rotation.x = -Math.PI/2
            radio.add(buttonMesh);
        }

        // stool construction 
        let stool = new THREE.Group();

        // legs construction for stool
        for(let i = 0; i < 4; i++){
            const leg = new THREE.CylinderGeometry(legSize, legSize, legHeight,radialSegments);
            const legMesh = new THREE.Mesh(leg, materials.brown);
            legMesh.position.set(0,legHeight/2-(legHeight/2-Math.cos(Math.PI/4)*legHeight/2),0);
            legMesh.rotation.z = Math.PI/4;
            legMesh.rotation.y = i*Math.PI/2;
            stool.add(legMesh);
        }

        // top construction for stool
        const top = new THREE.CylinderGeometry(topSize, topSize, topSize/7, radialSegments);
        const topMesh = new THREE.Mesh(top, materials.brown);
        topMesh.position.set(0,legHeight/2-(legHeight/2-Math.cos(Math.PI/4)*legHeight/2) + legHeight*Math.sin(Math.PI/4)/2,0);
        stool.add(topMesh);

        stool.position.set(2*this.roomWidth/5,0,2*this.roomWidth/5);
        //stool.position.set(2*this.roomWidth/5,legHeight*Math.sin(Math.PI/4)/2,2*this.roomWidth/5);
        this.app.scene.add(stool);

        radio.add(boxMesh);
        radio.position.set(2*this.roomWidth/5,boxHeight/2+legHeight/2-(legHeight/2-Math.cos(Math.PI/4)*legHeight/2) + legHeight*Math.sin(Math.PI/4)/2+(topSize/7)/2,2*this.roomWidth/5);
        this.app.scene.add(radio);
    }

    buildBeetle(){
        let beetle = new THREE.Group()
        const materialBeetle = new THREE.LineBasicMaterial({color: "#ffffff"});

        let points = [
            new THREE.Vector3(-2,0,0),                                      // Left wheel & Left hull
            new THREE.Vector3(-2,0.75*(4/3),0),                             // Left wheel
            new THREE.Vector3(-0.5,0.75*(4/3),0),                           // Left wheel
            new THREE.Vector3(-0.5,0,0),                                    // Left wheel
            new THREE.Vector3(-2,2*(4/3)*(Math.sqrt(2)-1),0),               // Left hull
            new THREE.Vector3(-2*(4/3)*(Math.sqrt(2)-1),2,0),               // Left hull
            new THREE.Vector3(0,2,0),                                       // Left hull & Right top hull
            new THREE.Vector3((4/3)*(Math.sqrt(2)-1),2,0),                  // Right top hull
            new THREE.Vector3(1,1+(4/3)*(Math.sqrt(2)-1),0),                // Right top hull
            new THREE.Vector3(1,1,0),                                       // Right top hull & Right bottom hull
            new THREE.Vector3(1+(4/3)*(Math.sqrt(2)-1),1,0),                // Right bottom hull
            new THREE.Vector3(2,(4/3)*(Math.sqrt(2)-1),0),                  // Right bottom hull
            new THREE.Vector3(2,0,0),                                       // Right bottom hull & Right wheel
            new THREE.Vector3(2,0.75*(4/3),0),                              // Right wheel
            new THREE.Vector3(0.5,0.75*(4/3),0),                            // Right wheel
            new THREE.Vector3(0.5,0,0)                                      // Right wheel
        ]

        //Left wheel
        const curve1 = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
        const geometry1 = new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50));
        const curve1Mesh = new THREE.Line(geometry1, materialBeetle);
        beetle.add(curve1Mesh);

        //Left hull
        const curve2 = new THREE.CubicBezierCurve3(points[0],points[4], points[5], points[6]);
        const geometry2 = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50));
        const curve2Mesh = new THREE.Line(geometry2, materialBeetle);
        beetle.add(curve2Mesh);

        // Right top hull
        const curve3 = new THREE.CubicBezierCurve3(points[6],points[7], points[8], points[9]);
        const geometry3 = new THREE.BufferGeometry().setFromPoints(curve3.getPoints(50)); 
        const curve3Mesh = new THREE.Line(geometry3, materialBeetle);
        beetle.add(curve3Mesh);

        // Right bottom hull
        const curve4 = new THREE.CubicBezierCurve3(points[9],points[10], points[11], points[12]);
        const geometry4 = new THREE.BufferGeometry().setFromPoints(curve4.getPoints(50)); 
        const curve4Mesh = new THREE.Line(geometry4, materialBeetle);
        beetle.add(curve4Mesh);

        // Right wheel
        const curve5 = new THREE.CubicBezierCurve3(points[12],points[13], points[14], points[15]);
        const geometry5 = new THREE.BufferGeometry().setFromPoints(curve5.getPoints(50)); 
        const curve5Mesh = new THREE.Line(geometry5, materialBeetle);
        beetle.add(curve5Mesh);

        beetle.position.set(5,0,0);
        this.app.scene.add(beetle);
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
        const pointLight = new THREE.PointLight(0xffffff, 400, 0);
        pointLight.position.set(0, 20, 0);
        this.app.scene.add(pointLight);

        // add another point light on top of the cake
        const pointLight2 = new THREE.PointLight(0xffff00, 100, 0);
        pointLight2.position.set(9, 3.8, -9);
        this.app.scene.add(pointLight2);

        // add a spotlight to spot a specific object
        this.spotLight = new THREE.SpotLight(0xffffff, 8, 5, (2 * Math.PI) / 20, 0, 0);
        this.spotLight.position.set(1,5,1);
        
        // Object target for the spotLight
        this.targetSpot = new THREE.Object3D();
        this.targetSpot.position.set(0, 2.65, 0);
        this.spotLight.target = this.targetSpot;

        // add the Spot Ligh and it's respective target to the scene
        this.app.scene.add(this.spotLight);
        this.app.scene.add(this.targetSpot);

        const spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
        spotLightHelper.target = this.targetSpot; 
        //this.app.scene.add( spotLightHelper );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        this.app.scene.add(pointLightHelper);

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555, 4);
        this.app.scene.add(ambientLight);

        this.buildFloor();
        this.buildWalls();
		this.buildTable();
        this.buildCake();
        this.buildRadio();
        this.buildBeetle();
        this.buildFrame(0.1, 2, 3, 0.1, 3.5, 6, false, 'textures/luis.jpg',"#ffffff", 'back');
        this.buildFrame(0.1, 2, 3, 0.1, -3.5, 6, false, 'textures/nuno.jpg',"#ffffff", 'back');
        this.buildFrame(0.1, 6, 3, 0.1, 5, 6, true, 'textures/landscape1.jpg',"#423721", 'left');
        this.buildFrame(0.1, 6, 3, 0.1, -5, 6, true, 'textures/landscape2.jpg', "#423721", 'left');
        this.buildLamp();
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

    updateSpotLight() {
        if (this.spotLightEnabled !== this.lastSpotLightEnabled) {
            this.lastSpotLightEnabled = this.spotLightEnabled
            if(this.spotLightEnabled){
                this.app.scene.add(this.spotLight)
            }
            else {
                this.app.scene.remove(this.spotLight)
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
        this.updateSpotLight()
    }
}

export { MyContents };
