import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';



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
        this.loader = new THREE.TextureLoader();

        const textures = {
            woodTexture : this.loader.load('textures/springGuy.jpg'),
            shoesTexture :  this.loader.load('textures/springGuyShoes.jpg'),
            jointsTexture :  this.loader.load('textures/springGuyJoints.jpg')
        }

        textures.woodTexture.colorSpace = THREE.SRGBColorSpace;
        textures.shoesTexture.colorSpace = THREE.SRGBColorSpace;
        textures.jointsTexture.colorSpace = THREE.SRGBColorSpace;


        this.materials = {
            wood: new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.woodTexture}),
            shoes: new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#545454", map: textures.shoesTexture}),
            joints: new THREE.MeshPhongMaterial({color: "#fff0f0", specular: "#545454", map: textures.jointsTexture}),
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
            
            const topTubeGeometry = new THREE.TubeGeometry(topCurvePath, 25, 0.075, 8, false);
            const topTubeMesh = new THREE.Mesh(topTubeGeometry, this.materials.black);
            spring.add(topTubeMesh);
    
            const downCircle = new THREE.CubicBezierCurve3(points[3], points[4], points[5], points[6]);
            const downCirclePoints = downCircle.getPoints(50);
            const downCurvePath = new THREE.CurvePath();
            downCurvePath.add(new THREE.CatmullRomCurve3(downCirclePoints));
    
            const downTubeGeometry = new THREE.TubeGeometry(downCurvePath, 25, 0.075, 8, false);
            const downTubeMesh = new THREE.Mesh(downTubeGeometry, this.materials.black);
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
        const femurWidth = tibiaWidth*0.9;
        const radialSegments = 64;
        const centerBaseX = 3-this.roomWidth/2;
        const centerBaseZ = 3-this.roomWidth/2;
        let legs = new THREE.Group();

        const base = new THREE.CylinderGeometry(baseWidth, baseWidth,baseHeight,radialSegments);
        const baseMesh = new THREE.Mesh(base, this.materials.gray);
        baseMesh.position.set(0,baseHeight/2,0);
        legs.add(baseMesh);
        
        for(let i = 0; i < 2; i++){
            let spring = this.buildSpring(0,baseHeight,1-2*i);
            spring.scale.set(0.25,0.25,0.25);
            legs.add(spring);

            const shoes = new THREE.CylinderGeometry(shoesWidth,shoesWidth*3/4, shoesHeight, radialSegments);
            const shoesMesh = new THREE.Mesh(shoes, this.materials.shoes);
            shoesMesh.position.set(0,baseHeight+1,1-2*i);
            shoesMesh.rotation.z = Math.PI;
            legs.add(shoesMesh);

            const tibia = new THREE.CylinderGeometry(tibiaWidth,tibiaWidth, tibiaHeight, radialSegments);
            const tibiaMesh = new THREE.Mesh(tibia, this.materials.wood);
            tibiaMesh.position.set(0,tibiaHeight/2+shoesHeight/2+baseHeight+1,1-2*i);
            legs.add(tibiaMesh);

            const knee = new THREE.SphereGeometry(tibiaWidth,radialSegments,radialSegments);
            const kneeMesh = new THREE.Mesh(knee, this.materials.joints);
            kneeMesh.position.set(0,tibiaHeight+tibiaWidth/2+shoesHeight/2+baseHeight+1,1-2*i);
            legs.add(kneeMesh);

            switch(i){
                case 0:
                    const femur = new THREE.CylinderGeometry(femurWidth,femurWidth, femurHeight, radialSegments);
                    const femurMesh = new THREE.Mesh(femur, this.materials.wood);
                    femurMesh.rotation.x=-Math.PI/12;
                    femurMesh.position.set(0,tibiaHeight+femurHeight/2+tibiaWidth+shoesHeight/2+baseHeight+1,1-2*i-Math.sin(Math.PI/12)*femurHeight/2);
                    legs.add(femurMesh);
                    break;
                case 1:
                    const femur2 = new THREE.CylinderGeometry(femurWidth,femurWidth, femurHeight, radialSegments);
                    const femurMesh2 = new THREE.Mesh(femur2, this.materials.wood);
                    femurMesh2.rotation.x=Math.PI/12;
                    femurMesh2.position.set(0,tibiaHeight+femurHeight/2+tibiaWidth+shoesHeight/2+baseHeight+1,1-2*i+Math.sin(Math.PI/12)*femurHeight/2);
                    legs.add(femurMesh2);
                    break;
            }
        }
        this.springGuyLegsHeight = tibiaHeight+femurHeight+tibiaWidth+shoesHeight/2+baseHeight+1;

        legs.position.set(centerBaseX,0,centerBaseZ)
        this.app.scene.add(legs);
    }

    buildTorso() {
        const torsoWidth = 0.75;
        const torsoHeight = 0.1;
        const torsoDepth = 2;
        const centerBaseX = 3-this.roomWidth/2;
        const centerBaseZ = 3-this.roomWidth/2;
        let top = new THREE.Group();

        const torso = new THREE.BoxGeometry(torsoWidth, torsoHeight,torsoDepth);
        const torsoMesh = new THREE.Mesh(torso, this.materials.wood);
        torsoMesh.position.set(0,this.springGuyLegsHeight,0);
        top.add(torsoMesh);

        top.position.set(centerBaseX,0,centerBaseZ);
        this.app.scene.add(top);

    }

    buildSpringGuy(roomHeight, roomWidth) {
        this.roomHeight = roomHeight;
        this.roomWidth = roomWidth;

        this.buildLegs();
        this.buildTorso();

    }
}
export { MySpringGuy };