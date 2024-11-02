import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';

class MyRoom  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app, roomWidth, roomHeight, roomThickness) {
        this.app = app;
        this.loader = new THREE.TextureLoader();
        this.roomWidth = roomWidth;
        this.roomHeight = roomHeight;
        this.roomThickness = roomThickness;

    }

    buildFloor() {
        const floorTexture = this.loader.load('textures/floor.jpg');
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const floorMaterial = new THREE.MeshPhongMaterial({color: "#BCA89F", map: floorTexture});
        const floor = new THREE.BoxGeometry(25, 25, 0.1);
        const floorMesh = new THREE.Mesh(floor, floorMaterial);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        floorMesh.castShadow = true;
        floorMesh.position.set(0,-0.05,0);

        this.app.scene.add(floorMesh);
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
        
        const landscapeMaterial = new THREE.MeshBasicMaterial({color: "#777777", map: landscapeTexture, opacity:1, side: THREE.BackSide}); 
        const sphereMaterial = new THREE.SphereGeometry(100,64,64);
        const sphere = new THREE.Mesh(sphereMaterial, landscapeMaterial);

        this.app.scene.add(sphere);
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
}
export { MyRoom };