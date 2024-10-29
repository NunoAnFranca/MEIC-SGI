import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';



class MySpringGuy  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.roomHeight = null;
        this.roomWidth = null;
        this.springGuyLegsHeight = null;
        this.springGuyTorsoHeight = null;
        this.loader = new THREE.TextureLoader();

        const textures = {
            woodTexture : this.loader.load('textures/springGuy.jpg'),
            faceTexture : this.loader.load('textures/nuno.jpg'),
            shoesTexture :  this.loader.load('textures/springGuyShoes.jpg'),
            jointsTexture :  this.loader.load('textures/springGuyJoints.jpg')
        }

        textures.woodTexture.colorSpace = THREE.SRGBColorSpace;
        textures.faceTexture.colorSpace = THREE.SRGBColorSpace;
        textures.shoesTexture.colorSpace = THREE.SRGBColorSpace;
        textures.jointsTexture.colorSpace = THREE.SRGBColorSpace;


        this.materials = {
            wood: new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.woodTexture}),
            shoes: new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#545454", map: textures.shoesTexture}),
            joints: new THREE.MeshPhongMaterial({color: "#fff0f0", specular: "#545454", map: textures.jointsTexture}),
            face: new THREE.MeshPhongMaterial({color: "#fff0f0", specular: "#545454", map: textures.faceTexture}),
            black: new THREE.MeshPhongMaterial({ color: "#000000", specular: "#000000", emissive: "#000000", shininess: 90 }),
            gray: new THREE.MeshPhongMaterial({ color: "#545454", specular: "#000000", emissive: "#000000", shininess: 90 }),

        }
    }

    buildSpring(x,y,z) {

        let spring = new THREE.Group();
    
        for (let i = 0; i < 6; i++) {
            let points = [
                new THREE.Vector3(-1, 0, 0 + 0.6 * i),
                new THREE.Vector3(-1, 4 / 3, 0.1 + 0.6 * i),
                new THREE.Vector3(1, 4 / 3, 0.2 + 0.6 * i),
                new THREE.Vector3(1, 0, 0.3 + 0.6 * i),
                new THREE.Vector3(1, -4 / 3, 0.4 + 0.6 * i),
                new THREE.Vector3(-1, -4 / 3, 0.5 + 0.6 * i),
                new THREE.Vector3(-1, 0, 0.6 + 0.6 * i),
            ];
            
            const topCircle = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
            const topCirclePoints = topCircle.getPoints(50);
            const topCurvePath = new THREE.CurvePath();
            topCurvePath.add(new THREE.CatmullRomCurve3(topCirclePoints));
            
            const topTubeGeometry = new THREE.TubeGeometry(topCurvePath, 25, 0.2, 8, false);
            const topTubeMesh = new THREE.Mesh(topTubeGeometry, this.materials.black);
            topTubeMesh.receiveShadow = true;
            topTubeMesh.castShadow = true;
            spring.add(topTubeMesh);
    
            const downCircle = new THREE.CubicBezierCurve3(points[3], points[4], points[5], points[6]);
            const downCirclePoints = downCircle.getPoints(50);
            const downCurvePath = new THREE.CurvePath();
            downCurvePath.add(new THREE.CatmullRomCurve3(downCirclePoints));
    
            const downTubeGeometry = new THREE.TubeGeometry(downCurvePath, 25, 0.2, 8, false);
            const downTubeMesh = new THREE.Mesh(downTubeGeometry, this.materials.black);
            downTubeMesh.receiveShadow = true;
            downTubeMesh.castShadow = true;
            spring.add(downTubeMesh);
        }
    
        spring.position.set(x,y,z);
        spring.rotation.x = -Math.PI / 2;
        
        return spring;
    }
    

    buildLegs() {
        const baseHeight = 0.1;
        const baseWidth = 2.5;
        const shoesWidth = 0.5;
        const shoesHeight = 0.5;
        const tibiaHeight = 1.3;
        const tibiaWidth = shoesWidth/2;
        const femurHeight = tibiaHeight*0.9;
        const femurWidth = tibiaWidth*1.2;
        const radialSegments = 64;
        const centerBaseX = 3-this.roomWidth/2;
        const centerBaseZ = 3-this.roomWidth/2;
        let legs = new THREE.Group();

        const base = new THREE.CylinderGeometry(baseWidth, baseWidth,baseHeight,radialSegments);
        const baseMesh = new THREE.Mesh(base, this.materials.gray);
        baseMesh.position.set(0,baseHeight/2,0);
        baseMesh.receiveShadow = true;
        baseMesh.castShadow = true;
        legs.add(baseMesh);
        
        for (let i = 0; i < 2; i++) {
            let spring = this.buildSpring(0,baseHeight,1-2*i);
            spring.scale.set(0.25,0.25,0.25);
            legs.add(spring);

            const shoes = new THREE.CylinderGeometry(shoesWidth,shoesWidth*3/4, shoesHeight, radialSegments);
            const shoesMesh = new THREE.Mesh(shoes, this.materials.shoes);
            shoesMesh.position.set(0,baseHeight+1,1-2*i);
            shoesMesh.rotation.z = Math.PI;
            shoesMesh.receiveShadow = true;
            shoesMesh.castShadow = true;
            legs.add(shoesMesh);

            const tibia = new THREE.CylinderGeometry(tibiaWidth,tibiaWidth, tibiaHeight, radialSegments);
            const tibiaMesh = new THREE.Mesh(tibia, this.materials.wood);
            tibiaMesh.position.set(0,tibiaHeight/2+shoesHeight/2+baseHeight+1,1-2*i);
            tibiaMesh.receiveShadow = true;
            tibiaMesh.castShadow = true;
            legs.add(tibiaMesh);

            const knee = new THREE.SphereGeometry(tibiaWidth,radialSegments,radialSegments);
            const kneeMesh = new THREE.Mesh(knee, this.materials.joints);
            kneeMesh.position.set(0,tibiaHeight+tibiaWidth/2+shoesHeight/2+baseHeight+1,1-2*i);
            kneeMesh.receiveShadow = true;
            kneeMesh.castShadow = true;
            legs.add(kneeMesh);

            switch(i){
                case 0:
                    const femur = new THREE.CylinderGeometry(femurWidth,femurWidth, femurHeight, radialSegments);
                    const femurMesh = new THREE.Mesh(femur, this.materials.wood);
                    femurMesh.rotation.x=-Math.PI/12;
                    femurMesh.position.set(0,tibiaHeight+femurHeight/2+tibiaWidth+shoesHeight/2+baseHeight+1,1-2*i-Math.sin(Math.PI/12)*femurHeight/2);
                    femurMesh.receiveShadow = true;
                    femurMesh.castShadow = true;
                    legs.add(femurMesh);
                    break;
                case 1:
                    const femur2 = new THREE.CylinderGeometry(femurWidth,femurWidth, femurHeight, radialSegments);
                    const femurMesh2 = new THREE.Mesh(femur2, this.materials.wood);
                    femurMesh2.rotation.x=Math.PI/12;
                    femurMesh2.position.set(0,tibiaHeight+femurHeight/2+tibiaWidth+shoesHeight/2+baseHeight+1,1-2*i+Math.sin(Math.PI/12)*femurHeight/2);
                    femurMesh2.receiveShadow = true;
                    femurMesh2.castShadow = true;
                    legs.add(femurMesh2);
                    break;
            }
        }
        this.springGuyLegsHeight = tibiaHeight+femurHeight+tibiaWidth+shoesHeight/2+baseHeight+1;

        legs.position.set(centerBaseX,0,centerBaseZ)
        legs.scale.set(0.75,0.75,0.75);
        this.app.scene.add(legs);
    }

    buildTorso() {
        const bottomWidth = 0.75;
        const bottomHeight = 0.1;
        const bottomDepth = 2;
        const torsoBase = 0.7;
        const torsoTop = 1.1;
        const torsoHeight = 2.5;
        const radialSegments = 32;
        const shoulderRadius = 0.35;
        const armRadius = 0.3;
        const armHeight = 1.5;
        const forearmRadius = 0.28;
        const forearmHeight = 1.8;
        const thumbRadius = 0.2;
        const thumbHeight = 0.2;
        const centerBaseX = 3-this.roomWidth/2;
        const centerBaseZ = 3-this.roomWidth/2;
        let top = new THREE.Group();

        const bottom = new THREE.BoxGeometry(bottomWidth, bottomHeight,bottomDepth);
        const bottomMesh = new THREE.Mesh(bottom, this.materials.wood);
        bottomMesh.position.set(0,this.springGuyLegsHeight,0);
        bottomMesh.receiveShadow = true;
        bottomMesh.castShadow = true;
        top.add(bottomMesh);

        let spring = this.buildSpring(0,this.springGuyLegsHeight+0.05,0);
        spring.scale.set(0.2,0.2,0.05);
        top.add(spring);

        const torso = new THREE.CylinderGeometry(torsoTop,torsoBase, torsoHeight, radialSegments);
        const torsoMesh = new THREE.Mesh(torso, this.materials.wood);
        torsoMesh.position.set(0,this.springGuyLegsHeight+0.25+torsoHeight/2,0);
        torsoMesh.receiveShadow = true;
        torsoMesh.castShadow = true;
        top.add(torsoMesh);

        let springNeck = this.buildSpring(0,this.springGuyLegsHeight+0.25+torsoHeight,0);
        springNeck.scale.set(0.2,0.2,0.15);
        top.add(springNeck);

        this.springGuyTorsoHeight = this.springGuyLegsHeight+0.25+torsoHeight + 0.7;

        for(let i = 0; i <2;i++){

            const shoulder = new THREE.SphereGeometry(shoulderRadius, radialSegments, radialSegments);
            const shoulderMesh = new THREE.Mesh(shoulder, this.materials.joints);
            shoulderMesh.position.set(0,this.springGuyLegsHeight+torsoHeight-shoulderRadius/2,torsoTop-i*2*torsoTop);
            shoulderMesh.receiveShadow = true;
            shoulderMesh.castShadow = true;
            top.add(shoulderMesh);

            const arm = new THREE.CylinderGeometry(armRadius,armRadius,armHeight,radialSegments);
            const armMesh = new THREE.Mesh(arm, this.materials.wood);
            armMesh.rotation.x = -Math.PI/12+2*i*Math.PI/12;
            armMesh.position.set(0,this.springGuyLegsHeight+torsoHeight-shoulderRadius/2-armHeight/2,torsoTop+3*shoulderRadius/4-i*2*(torsoTop+3*shoulderRadius/4));            
            armMesh.receiveShadow = true;
            armMesh.castShadow = true;
            top.add(armMesh);

            const elbow = new THREE.SphereGeometry(shoulderRadius, radialSegments, radialSegments);
            const elbowMesh = new THREE.Mesh(elbow, this.materials.joints);
            elbowMesh.position.set(0,this.springGuyLegsHeight+torsoHeight-shoulderRadius/2-armHeight,torsoTop+4*shoulderRadius/3-i*2*(torsoTop+4*shoulderRadius/3));            
            elbowMesh.receiveShadow = true;
            elbowMesh.castShadow = true;
            top.add(elbowMesh);

            const forearm = new THREE.CylinderGeometry(forearmRadius,forearmRadius,forearmHeight,radialSegments);
            const forearmMesh = new THREE.Mesh(forearm, this.materials.wood);
            forearmMesh.rotation.z = Math.PI/2;
            forearmMesh.position.set(forearmHeight/2,this.springGuyLegsHeight+torsoHeight-shoulderRadius/2-armHeight,torsoTop+4*shoulderRadius/3-i*2*(torsoTop+4*shoulderRadius/3));      
            forearmMesh.receiveShadow = true;
            forearmMesh.castShadow = true;
            top.add(forearmMesh);

            const hands = new THREE.SphereGeometry(forearmRadius, radialSegments, radialSegments);
            const handsMesh = new THREE.Mesh(hands, this.materials.wood);
            handsMesh.rotation.x = Math.PI/2;
            handsMesh.position.set(forearmHeight+forearmRadius,this.springGuyLegsHeight+torsoHeight-shoulderRadius/2-armHeight,torsoTop+4*shoulderRadius/3-i*2*(torsoTop+4*shoulderRadius/3));
            handsMesh.scale.set(1.5,1,0.5);      
            handsMesh.receiveShadow = true;
            handsMesh.castShadow = true;
            top.add(handsMesh);

            const thumb = new THREE.CylinderGeometry(thumbRadius, thumbRadius/2, thumbHeight, radialSegments);
            const thumbMesh = new THREE.Mesh(thumb, this.materials.wood);
            thumbMesh.rotation.z = Math.PI/2;
            thumbMesh.rotation.y = -Math.PI/6 + 2*i*Math.PI/6;
            thumbMesh.position.set(forearmHeight+forearmRadius,this.springGuyLegsHeight+torsoHeight-shoulderRadius/2-armHeight,torsoTop+4*shoulderRadius/3+0.2-i*2*(torsoTop+4*shoulderRadius/3+0.2));
            thumbMesh.scale.set(0.3,3,0.6);      
            thumbMesh.receiveShadow = true;
            thumbMesh.castShadow = true;
            top.add(thumbMesh);
        }

        top.position.set(centerBaseX,0,centerBaseZ);
        top.scale.set(0.75,0.75,0.75);
        this.app.scene.add(top);
    }

    buildHead() {
        const headRadius = 0.75;
        const radialSegments = 32;
        const centerBaseX = 3-this.roomWidth/2;
        const centerBaseZ = 3-this.roomWidth/2;
        let head = new THREE.Group();


        const headBall = new THREE.SphereGeometry(headRadius,radialSegments,radialSegments);
        const headMesh = new THREE.Mesh(headBall, this.materials.face);
        headMesh.position.set(0,this.springGuyTorsoHeight+headRadius/2,0);
        headMesh.scale.set(0.75,1.2,1);
        headMesh.receiveShadow = true;
        headMesh.castShadow = true;
        head.add(headMesh);
        
        head.position.set(centerBaseX,0,centerBaseZ);
        head.scale.set(0.75,0.75,0.75);
        this.app.scene.add(head);
    }
    buildSpringGuy(roomHeight, roomWidth) {
        this.roomHeight = roomHeight;
        this.roomWidth = roomWidth;

        this.buildLegs();
        this.buildTorso();
        this.buildHead();

    }
}
export { MySpringGuy };