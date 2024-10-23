import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';



class MyRadio  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.loader = new THREE.TextureLoader();
        this.roomWidth = null;
        this.roomHeight = null;

    }
    /**
     * Creates a radio in the corner of the living room
     */
    buildRadio(roomHeight, roomWidth){
        this.roomHeight = roomHeight;
        this.roomWidth = roomWidth;
        
        // grill texture for radio
        const radioTexture = this.loader.load('textures/radio.jpg');
        radioTexture.colorSpace = THREE.SRGBColorSpace;

        const materials = {
            box: new THREE.MeshPhongMaterial({ color: "#545454", specular: "#ffffff", emissive: "#000000", shininess: 40 }),
            black: new THREE.MeshPhongMaterial({ color: "#000000", specular: "#545454", emissive: "#000000", shininess: 100 }),
            brown: new THREE.MeshPhongMaterial({ color: "#3B1D14", specular: "#000000", emissive: "#000000", shininess: 20 }),
            antena: new THREE.MeshPhongMaterial({ color:"#0f0f0f", specular: "#000000", emissive: "#000000", shininess: 90 }),
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

}
export { MyRadio };