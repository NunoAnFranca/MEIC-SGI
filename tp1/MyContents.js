import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

import { MySpringGuy } from './contents/MySpringGuy.js';
import { MyRadio } from './contents/MyRadio.js';
import { MyVase } from './contents/MyVase.js';
import { MyFlower } from './contents/MyFlower.js';
import { MySpotStudent } from './contents/MySpotStudent.js';
import { MySpotCake } from './contents/MySpotCake.js';
import { MyCake } from './contents/MyCake.js';
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

        const map = new THREE.TextureLoader().load('textures/newspaper.png');
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;
        this.material = new THREE.MeshLambertMaterial({ map: map, side: THREE.DoubleSide});
        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 64;
        this.samplesV = 64;

        this.createNurbsSurfaces();
        
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

    buildLampSticks(angleX, angleZ, x, z) {
        const lampStick = new THREE.CylinderGeometry(0.1, 0.1, 1.6, 32, 32);
        const lampStickMaterial = new THREE.MeshPhongMaterial({color: "#d9af25"});
        const lampStickMesh = new THREE.Mesh(lampStick, lampStickMaterial);
        lampStickMesh.position.set(x, 2.5, z);
        lampStickMesh.rotation.set(angleX, 0, angleZ);
        lampStickMesh.receiveShadow = true;
        lampStickMesh.castShadow = true;
        
        return lampStickMesh;
    }

    buildLamp() {
        const lamp = new THREE.Group();
        const outerPart = new THREE.CylinderGeometry(0.8, 2.1, 2, 32, 32, true);
        const innerPart = new THREE.CylinderGeometry(0.7, 2, 2, 32, 32, true);
        const topRing = new THREE.RingGeometry(0.7, 0.8, 32);
        const bottomRing = new THREE.RingGeometry(2, 2.1, 32);
        const lampSupport = new THREE.CylinderGeometry(0.2, 0.2, 3, 32, 32);
        const outerLampMaterial = new THREE.MeshPhongMaterial({color: "#993240", side: THREE.FrontSide});
        const innerLampMaterial = new THREE.MeshPhongMaterial({color: "#993240", side: THREE.BackSide});
        const lampSupportMaterial = new THREE.MeshPhongMaterial({color: "#8f6b1d"});
        const outerPartMesh = new THREE.Mesh(outerPart, outerLampMaterial);
        const innerPartMesh = new THREE.Mesh(innerPart, innerLampMaterial);
        const topRingMesh = new THREE.Mesh(topRing, innerLampMaterial);
        const bottomRingMesh = new THREE.Mesh(bottomRing, outerLampMaterial);
        const lampSupportMesh = new THREE.Mesh(lampSupport, lampSupportMaterial);

        outerPartMesh.position.set(0, 3, 0);
        innerPartMesh.position.set(0, 3, 0);
        topRingMesh.position.set(0, 4, 0);
        topRingMesh.rotation.set(Math.PI / 2, 0, 0);
        bottomRingMesh.position.set(0, 2, 0);
        bottomRingMesh.rotation.set(Math.PI / 2, 0, 0);
        lampSupportMesh.position.set(0, 1, 0);

        outerPartMesh.receiveShadow = true;
        outerPartMesh.castShadow = true;
        innerPartMesh.receiveShadow = true;
        innerPartMesh.castShadow = true;
        topRingMesh.receiveShadow = true;
        topRingMesh.castShadow = true;
        bottomRingMesh.receiveShadow = true;
        bottomRingMesh.castShadow = true;
        lampSupportMesh.receiveShadow = true;
        lampSupportMesh.castShadow = true;

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
        const frameMaterial = new THREE.MeshPhongMaterial({color: color, map: frameTexture, specular: "#111111", shininess: 0});

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
                frameGroup.position.set(- this.roomWidth / 2 + frameThickness, verticalDisp, horizontalDisp);
                frameGroup.rotation.y = Math.PI / 2;
                break;
            case 'right':
                frameGroup.position.set(this.roomWidth / 2 - frameThickness, verticalDisp, horizontalDisp);
                frameGroup.rotation.y = Math.PI / 2;
                break;
            case 'front':
                frameGroup.position.set(horizontalDisp, verticalDisp, this.roomWidth / 2-frameThickness);
                break;
            case 'back':
                frameGroup.position.set(horizontalDisp, verticalDisp, - this.roomWidth / 2+frameThickness);
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

        const imageMaterial = new THREE.MeshPhongMaterial({color: "#ffffff", map: imageTexture});
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
			let wall = new THREE.BoxGeometry(this.roomWidth, this.roomHeight, this.roomThickness);
			let firstWallMesh = new THREE.Mesh(wall, wallMaterial);
            let secondWallMesh = new THREE.Mesh(wall, wallMaterial);
            let firstSideMesh = new THREE.Mesh(wall, wallMaterial);
            let secondSideMesh = new THREE.Mesh(wall, wallMaterial);

			switch (i) {
				case 0:
					firstWallMesh.position.set(0, this.roomHeight / 2, this.roomWidth / 2);
					firstWallMesh.rotation.x = Math.PI;
					break;
				case 1:
					firstWallMesh.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
					firstWallMesh.rotation.y = Math.PI / 2;
                    
                    secondWallMesh.scale.set(1,(1/4),1);
                    secondWallMesh.rotation.y = -Math.PI / 2;
                    secondWallMesh.position.set(-this.roomWidth / 2, this.roomHeight-(1/4)*(this.roomHeight / 2), 0);

                    firstSideMesh.scale.set((1/4),(1/2),1);
                    firstSideMesh.rotation.y = -Math.PI / 2;
                    firstSideMesh.position.set(-this.roomWidth / 2, this.roomHeight / 2, this.roomWidth/2-(1/4)*(this.roomWidth / 2));

                    secondSideMesh.scale.set((1/4),(1/2),1);
                    secondSideMesh.rotation.y = -Math.PI / 2;
                    secondSideMesh.position.set(-this.roomWidth / 2, this.roomHeight / 2, -this.roomWidth/2+(1/4)*(this.roomWidth / 2));

                    secondWallMesh.receiveShadow = true;
                    secondWallMesh.castShadow = true;
                    firstSideMesh.receiveShadow = true;
                    firstSideMesh.castShadow = true;
                    secondSideMesh.receiveShadow = true;
                    secondSideMesh.castShadow = true;

                    this.app.scene.add(secondWallMesh, firstSideMesh, secondSideMesh);
					break;
				case 2:
					firstWallMesh.position.set(0, this.roomHeight / 2, -this.roomWidth / 2);
					firstWallMesh.rotation.x = Math.PI;
					break;
				case 3:
                    firstWallMesh.scale.set(1,(1/4),1);
					firstWallMesh.position.set(-this.roomWidth / 2, this.roomHeight-(1/4)*(this.roomHeight / 2), 0);
					firstWallMesh.rotation.y = Math.PI / 2;

                    secondWallMesh.scale.set(1,(1/4),1);
                    secondWallMesh.rotation.y = Math.PI / 2;
                    secondWallMesh.position.set(-this.roomWidth / 2, (1/4)*(this.roomHeight / 2), 0);

                    firstSideMesh.scale.set((1/4),(1/2),1);
                    firstSideMesh.rotation.y = Math.PI / 2;
                    firstSideMesh.position.set(-this.roomWidth / 2, this.roomHeight / 2, this.roomWidth/2-(1/4)*(this.roomWidth / 2));

                    secondSideMesh.scale.set((1/4),(1/2),1);
                    secondSideMesh.rotation.y = Math.PI / 2;
                    secondSideMesh.position.set(-this.roomWidth / 2, this.roomHeight / 2, -this.roomWidth/2+(1/4)*(this.roomWidth / 2));

                    secondWallMesh.receiveShadow = true;
                    secondWallMesh.castShadow = true;
                    firstSideMesh.receiveShadow = true;
                    firstSideMesh.castShadow = true;
                    secondSideMesh.receiveShadow = true;
                    secondSideMesh.castShadow = true;

                    this.app.scene.add(secondWallMesh, firstSideMesh, secondSideMesh);
					break;
			}

            firstWallMesh.receiveShadow = true;
            firstWallMesh.castShadow = true;

			this.app.scene.add(firstWallMesh);
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

    buildFloor() {
        const floorTexture = this.loader.load('textures/floor.jpg');
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const floorMaterial = new THREE.MeshPhongMaterial({color: "#BCA89F", map: floorTexture});
        const floor = new THREE.BoxGeometry(25, 25, 0.1);
        const floorMesh = new THREE.Mesh(floor, floorMaterial);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = -0.1;
        floorMesh.receiveShadow = true;
        floorMesh.castShadow = true;

        this.app.scene.add(floorMesh);
    }

    buildBeetle(){
        const materialBeetle = new THREE.LineBasicMaterial({color: "#000000"});

        for(let i = 0; i<30;i++){

            let beetle = new THREE.Group();
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
    
            beetle.scale.set(0.5,0.5,0.5);
            beetle.position.set(5,5.5-i*0.002,this.roomWidth/2-0.15);
            beetle.rotation.y = Math.PI;
            this.app.scene.add(beetle);

        }
    }

    // 
    buildFlower(){
        const materials = {
            center: new THREE.LineBasicMaterial({color: "#4CF038"}),
            petals: new THREE.LineBasicMaterial({color: "#FF1D8D"})
        }
        
        for(let num = 0; num < 30; num++){
            let flower = new THREE.Group();
        
            let pointsCircle = [
                new THREE.Vector3(-1, 0,  0),
                new THREE.Vector3(-1, (4/3), 0),
                new THREE.Vector3(1, (4/3), 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(-1, -(4/3), 0),
                new THREE.Vector3(1, -(4/3), 0)
            ];
            
            const topCircle = new THREE.CubicBezierCurve3(pointsCircle[0], pointsCircle[1], pointsCircle[2], pointsCircle[3]);
            const topCircleGeometry = new THREE.BufferGeometry().setFromPoints(topCircle.getPoints(50));
            const topCircleMesh = new THREE.Line(topCircleGeometry, materials.center);
            flower.add(topCircleMesh);

            const downCircle = new THREE.CubicBezierCurve3(pointsCircle[0],pointsCircle[4],pointsCircle[5], pointsCircle[3]);
            const downCircleGeometry = new THREE.BufferGeometry().setFromPoints(downCircle.getPoints(50));
            const downCircleMesh = new THREE.Line(downCircleGeometry, materials.center);
            flower.add(downCircleMesh);
            
            //draw petals
            for(let i = 0; i < 12; i++){
                
                let angle = i*Math.PI/6;
                
                let points = [
                    new THREE.Vector3(Math.cos(Math.PI/2 - angle),Math.sin(Math.PI/2 + angle),0), // DONE
                    new THREE.Vector3(Math.cos(Math.PI/2 - angle)+0.2*Math.cos(Math.PI/2- angle),Math.sin(Math.PI/2+ angle)+0.2*Math.sin(Math.PI/2+ angle),0), // DONE
                    new THREE.Vector3(-3*Math.cos(5*(Math.PI/12) + angle),3*Math.sin(5*(Math.PI/12) +angle ),0), // DONE
                    new THREE.Vector3(-3*Math.cos(5*(Math.PI/12) + angle)+(Math.cos(Math.PI/6+angle)),3*Math.sin(5*(Math.PI/12)+ angle)-(Math.sin(Math.PI/6+angle)),0), // DONE
                    new THREE.Vector3(-Math.cos(Math.PI/3+angle),Math.sin(Math.PI/3+angle),0),
                    new THREE.Vector3(-Math.cos(Math.PI/3+angle)-0.2*Math.sin(Math.PI/6+angle),Math.sin(Math.PI/3+angle)-0.2*Math.cos(Math.PI/6+angle),0),
                    new THREE.Vector3(-3*Math.cos(5*(Math.PI/12)+ angle)-Math.sin(Math.PI/6+ angle),3*Math.sin(5*(Math.PI/12)+ angle)-Math.cos(Math.PI/6+ angle),0)
                ];
                
                const topPetal = new THREE.CubicBezierCurve3(points[0], points[1], points[3], points[2]);
                const topPetalGeometry = new THREE.BufferGeometry().setFromPoints(topPetal.getPoints(50));
                const topPetalMesh = new THREE.Line(topPetalGeometry, materials.petals);
                flower.add(topPetalMesh);

                const bottomPetal = new THREE.CubicBezierCurve3(points[4], points[5], points[6], points[2]);
                const bottomPetalGeometry = new THREE.BufferGeometry().setFromPoints(bottomPetal.getPoints(50));
                const bottomPetalMesh = new THREE.Line(bottomPetalGeometry, materials.petals);
                flower.add(bottomPetalMesh);
            }

            //draw Steem
            let pointsSteem = [
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(1,-2,0),
                new THREE.Vector3(-1,-4,0),
                new THREE.Vector3(0,-6,0),
            ];

            const steem = new THREE.CubicBezierCurve3(pointsSteem[0], pointsSteem[1], pointsSteem[2], pointsSteem[3]);
            const steemGeometry = new THREE.BufferGeometry().setFromPoints(steem.getPoints(50));
            const steemMesh = new THREE.Line(steemGeometry, materials.center);
            flower.add(steemMesh);

            flower.position.set(-5-num*0.001, 6.5,this.roomWidth/2-0.15);
            flower.scale.set(0.25,0.25,0.25);
            this.app.scene.add(flower);
        }
        
    }

    buildWindow(height, width){
        let frameWidth = 0.2;
        
        const frameTexture = this.loader.load('textures/frame.jpg');
        frameTexture.colorSpace = THREE.SRGBColorSpace;
        const frameMaterial = new THREE.MeshPhongMaterial({color: "#423721", map: frameTexture, specular: "#000000", shininess: 0});
        let frame = new THREE.Group();
        
        for(let i = -1; i < 2;i++){
            const frameCenter = new THREE.BoxGeometry(frameWidth,height/2,frameWidth);
            const centerMesh = new THREE.Mesh(frameCenter, frameMaterial);
            centerMesh.position.set(0,0,i*width/4);
            frame.add(centerMesh);
        }

        for(let i = -1; i < 2;i++){
            const frameCenter = new THREE.BoxGeometry(frameWidth,frameWidth,width/2);
            const centerMesh = new THREE.Mesh(frameCenter, frameMaterial);
            centerMesh.position.set(0,i*height/4,0);
            frame.add(centerMesh);
        }

        frame.position.set(-width/2,height/2,0);
        this.app.scene.add(frame);
    }

    buildSpring() {

        let materials = [
            new THREE.MeshPhongMaterial({color: "#ff0000" }),
            new THREE.MeshPhongMaterial({color: "#ffa500"}),
            new THREE.MeshPhongMaterial({color: "#ffff00"}),
            new THREE.MeshPhongMaterial({color: "#008000"}),
            new THREE.MeshPhongMaterial({color: "#0000ff"}),
            new THREE.MeshPhongMaterial({color: "#4b0082"}),
            new THREE.MeshPhongMaterial({color: "#ee82ee"})
        ];

        let spring = new THREE.Group();
    
        for (let i = 0; i < 28; i++) {
            let points = [
                new THREE.Vector3(-1, 0, 0 + 0.6 * i),
                new THREE.Vector3(-1, 4 / 3, 0.1 + 0.6 * i),
                new THREE.Vector3(1, 4 / 3, 0.2 + 0.6 * i),
                new THREE.Vector3(1, 0, 0.3 + 0.6 * i),
                new THREE.Vector3(1, -4 / 3, 0.4 + 0.6 * i),
                new THREE.Vector3(-1, -4 / 3, 0.5 + 0.6 * i),
                new THREE.Vector3(-1, 0, 0.6 + 0.6 * i),
            ];

            let colorMaterial = i%7;
            
            const topCircle = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
            const topCirclePoints = topCircle.getPoints(50);
            const topCurvePath = new THREE.CurvePath();
            topCurvePath.add(new THREE.CatmullRomCurve3(topCirclePoints));
            
            const topTubeGeometry = new THREE.TubeGeometry(topCurvePath, 25, 0.075, 8, false);
            const topTubeMesh = new THREE.Mesh(topTubeGeometry, materials[colorMaterial]);
            topTubeMesh.receiveShadow = true;
            topTubeMesh.castShadow = true;
            spring.add(topTubeMesh);
    
            const downCircle = new THREE.CubicBezierCurve3(points[3], points[4], points[5], points[6]);
            const downCirclePoints = downCircle.getPoints(50);
            const downCurvePath = new THREE.CurvePath();
            downCurvePath.add(new THREE.CatmullRomCurve3(downCirclePoints));
    
            const downTubeGeometry = new THREE.TubeGeometry(downCurvePath, 25, 0.075, 8, false);
            const downTubeMesh = new THREE.Mesh(downTubeGeometry, materials[colorMaterial]);
            downTubeMesh.receiveShadow = true;
            downTubeMesh.castShadow = true;
            spring.add(downTubeMesh);
        }
    
        spring.position.set(-2, 2.5 + 0.3 / 2, 1.5);
        spring.rotation.x = -Math.PI / 2;
        spring.scale.set(0.1, 0.1, 0.02);
        this.app.scene.add(spring);
    }
    
    buildCarpet(){
        const carpetTexture = this.loader.load('textures/carpet.jpg');
        carpetTexture.colorSpace = THREE.SRGBColorSpace;
        const carpetMaterial = new THREE.MeshPhongMaterial({color: "#FFFFFF", map: carpetTexture, opacity:1}); 

        const carpet = new THREE.CylinderGeometry(6, 6, 0.01, 64);
        const carpetMesh = new THREE.Mesh(carpet, carpetMaterial);
        carpetMesh.position.set(0,0.01,0);
        carpetMesh.scale.set(1,1,0.8);
        carpetMesh.receiveShadow = true;
        carpetMesh.castShadow = true;
        this.app.scene.add(carpetMesh);

    }

    buildLandscapeSphere(){
        const landscapeTexture = this.loader.load('textures/landscapefinal.jpg');
        landscapeTexture.colorSpace = THREE.SRGBColorSpace;
        
        const landscapeMaterial = new THREE.MeshPhongMaterial({color: "#FFFFFF", map: landscapeTexture, opacity:1, side: THREE.BackSide}); 
        const sphereMaterial = new THREE.SphereGeometry(100,64,64);
        const sphere = new THREE.Mesh(sphereMaterial, landscapeMaterial);

        this.app.scene.add(sphere);
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

        this.app.scene.add(roomAmbientLight);

        // creates a helper for the light
        // const roomAmbientLightHelper = new THREE.DirectionalLightHelper(roomAmbientLight, 5);
        // this.app.scene.add(roomAmbientLightHelper);

        // creates a point light
        const roomLight = new THREE.PointLight("#484a2c", 100, 0, 0);
        roomLight.position.set(10, 15, 10);
        roomLight.castShadow = true;
        roomLight.shadow.mapSize.width = this.mapSize;
        roomLight.shadow.mapSize.height = this.mapSize;
        roomLight.shadow.camera.near = 0.5;
        roomLight.shadow.camera.far = 100;

        this.app.scene.add(roomLight);

        // creates a helper for the light
        // const roomLightHelper = new THREE.PointLightHelper(roomLight, 1);
        // this.app.scene.add(roomLightHelper);

        // const spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
        // spotLightHelper.target = this.targetSpot; 
        // this.app.scene.add( spotLightHelper );

        // add another point light on the lamp
        const lampLight = new THREE.PointLight(0xffff00, 100, 0);
        lampLight.position.set(9, 3.8, -9);
        this.app.scene.add(lampLight);

        const springGuy = new MySpringGuy(this.app);
        const radio = new MyRadio(this.app);
        const vase = new MyVase(this.app);
        const flower = new MyFlower(this.app);
        this.spotStudent = new MySpotStudent(this.app);
        this.spotCake = new MySpotCake(this.app);
        const cake = new MyCake(this.app, this.legHeight, this.tableThickness);

        this.buildFloor();
        this.buildWalls();
		this.buildTable();
        this.buildBeetle();
        this.buildFlower();
        this.buildCarpet();
        this.buildSpring();
        this.buildWindow(this.roomHeight, this.roomWidth);
        this.buildFrame(0.1, 2, 3, 0.1, 3.5, 6, false, 'textures/luis.jpg',"#ffffff", 'back');
        this.buildFrame(0.1, 2, 3, 0.1, -3.5, 6, false, 'textures/nuno.jpg',"#ffffff", 'back');
        this.buildFrame(0.1, 3, 2, 0.1, 5, 6, false, 'textures/cork.jpg', "#ffffff", 'front');
        this.buildFrame(0.1, 3, 3.5, 0.1, -5, 6, false, 'textures/cork.jpg', "#ffffff", 'front');
        this.buildLamp();
        this.buildLandscapeSphere();
        this.spotStudent.buildSpot(3.5,this.roomHeight,6,this.roomWidth);
        this.spotStudent.buildSpot(-3.5,this.roomHeight,6,this.roomWidth);
        this.spotCake.buildSpot(3*this.roomWidth/8,this.roomHeight,0);
        springGuy.buildSpringGuy(this.roomHeight, this.roomWidth);
        radio.buildRadio(this.roomHeight, this.roomWidth);
        vase.buildVase(-4,this.roomWidth/2-1,3);
        vase.buildVase(-5.5,this.roomWidth/2-2,2);
        vase.buildVase(-7,this.roomWidth/2-1,4);
        flower.buildFlower(-4,this.roomWidth/2-1,2);
        flower.buildFlower(-5.5,this.roomWidth/2-2,3);
        flower.buildFlower(-7,this.roomWidth/2-1,4);
        cake.buildCake();
    }

    createNurbsSurfaces() {  
        // are there any meshes to remove?
        if (this.meshes !== null) {
            // traverse mesh array
            for (let i=0; i<this.meshes.length; i++) {
                // remove all meshes from the scene
                this.app.scene.remove(this.meshes[i]);
            }
            this.meshes = []; // empty the array  
        }

        // declare local variables
        let firstControlPoints, secondControlPoints;
        let firstSurfaceData, secondSurfaceData;
        let firstMesh, secondMesh;
        let offset = 0.2; // offset for each surface

        for (let n = 0; n < 5; n++) {
            firstControlPoints = [
                [
                    [1.5, -2.0, 0.0, 1],
                    [1.5, 2.0, 0.0, 1]
                ],
                [
                    [0.0, -2.0, 0.0, 1],
                    [0.0, 2.0, 0.0, 1]
                ],
                [
                    [-2.0 + n * offset * 2, -2.0, -2.0 + n * offset, 1],
                    [-2.0 + n * offset * 2, 2.0, -2.0 + n * offset, 1]
                ],
                [
                    [-2.0, -2.0, 2.0 - n * offset, 1],
                    [-2.0, 2.0, 2.0 - n * offset, 1]
                ],
                [
                    [2.0 - n * offset, -2.0, 2.0 - n * offset, 1],
                    [2.0 - n * offset, 2.0, 2.0 - n * offset, 1]
                ],
                [
                    [2.0, -2.0, 0.0 + n * offset, 1],
                    [2.0, 2.0, 0.0 + n * offset, 1]
                ],
                [
                    [0.0, -2.0, 0.0, 1],
                    [0.0, 2.0, 0.0, 1]
                ],
            ];

            let firstOrderU = firstControlPoints.length - 1;
            let firstOrderV = firstControlPoints[0].length - 1;

            firstSurfaceData = this.builder.build(firstControlPoints, firstOrderU, firstOrderV, this.samplesU, this.samplesV, this.material);
            firstMesh = new THREE.Mesh(firstSurfaceData, this.material);
            
            secondControlPoints = [
                [
                    [4.0, -2.0, 0.0 + n * offset * 0.2, 1],
                    [4.0, 2.0, 0.0 + n * offset * 0.2, 1]
                ],
                [
                    [0.0, -2.0, 0.0, 1],
                    [0.0, 2.0, 0.0, 1]
                ]
            ]

            let secondOrderU = secondControlPoints.length - 1;
            let secondOrderV = secondControlPoints[0].length - 1;

            secondSurfaceData = this.builder.build(secondControlPoints, secondOrderU, secondOrderV, this.samplesU, this.samplesV, this.material);
            secondMesh = new THREE.Mesh(secondSurfaceData, this.material);

            firstMesh.rotation.set(- Math.PI / 2, Math.PI / 30, 0);
            secondMesh.rotation.set(- Math.PI / 2, Math.PI / 30, 0);
            firstMesh.scale.set(0.5, 0.5, 0.5);
            secondMesh.scale.set(0.5, 0.5, 0.5);
            firstMesh.position.set(-3, 2.85, -0.2);
            secondMesh.position.set(-3, 2.85, -0.2);
            firstMesh.receiveShadow = true;
            firstMesh.castShadow = true;
            secondMesh.receiveShadow = true;
            secondMesh.castShadow = true;
            this.app.scene.add(firstMesh);
            this.app.scene.add(secondMesh);
            this.meshes.push(firstMesh);
            this.meshes.push(secondMesh);
        }
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
