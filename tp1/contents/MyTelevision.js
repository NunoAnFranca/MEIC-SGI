import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';


class MyTelevision  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.loader = new THREE.TextureLoader();

        const screenTexture = this.loader.load('textures/television.jpg')
        const buttonTexture = this.loader.load('textures/on-off.jpg')

        screenTexture.colorSpace = THREE.SRGBColorSpace;
        buttonTexture.colorSpace = THREE.SRGBColorSpace;

        this.materials = {
            black : new THREE.MeshPhongMaterial({color: "#000000", specular: "#000000"}),
            gray : new THREE.MeshPhongMaterial({color: "#545454", specular: "#000000"}),  
            screen: new THREE.MeshBasicMaterial({color: "#ffffff", specular: "#000000", map: screenTexture}),
            button: new THREE.MeshBasicMaterial({color: "#ffffff", specular: "#000000", map: buttonTexture}) 
        };
    }

    /**
     * 
     */
    buildTelevision(x,y,z){
        let television = new THREE.Group();
        const radialSegments = 32;
        const backWdith = 0.4;
        const backy = 3*(3/2);
        const backz = 4*(3/2);

        const frontWidth = 0.2;
        const fronty = backy+0.4;
        const frontz = backz+0.4;

        const buttonWidth = 0.075;
        const buttonHeight = 0.05;

        const backTelevision = new THREE.BoxGeometry(backWdith,backy,backz);
        const backMesh = new THREE.Mesh(backTelevision, this.materials.black);
        backMesh.position.set(-backWdith/2,0,0);
        backMesh.receiveShadow = true;
        backMesh.castShadow = true;
        television.add(backMesh);

        const frontTelevision = new THREE.BoxGeometry(frontWidth,backy,backz);
        const frontMesh = new THREE.Mesh(frontTelevision, this.materials.screen);
        frontMesh.position.set(-backWdith-frontWidth/2,0,0);
        frontMesh.receiveShadow = true;
        frontMesh.castShadow = true;
        television.add(frontMesh);

        const button1  = new THREE.CylinderGeometry(buttonWidth,buttonWidth,buttonHeight,radialSegments);
        const button1Mesh = new THREE.Mesh(button1, this.materials.gray);
        button1Mesh.position.set(-backWdith-frontWidth/2,0.5-fronty/2,frontz/2+buttonHeight/2);
        button1Mesh.rotation.x = Math.PI/2;
        button1Mesh.receiveShadow = true;
        button1Mesh.castShadow = true;
        television.add(button1Mesh);

        const button1Tex  = new THREE.CylinderGeometry(buttonWidth,buttonWidth,buttonHeight/100,radialSegments);
        const button1TexMesh = new THREE.Mesh(button1Tex, this.materials.button);
        button1TexMesh.position.set(-backWdith-frontWidth/2,0.5-fronty/2,frontz/2+buttonHeight+buttonHeight/100);
        button1TexMesh.rotation.x = Math.PI/2;
        button1TexMesh.rotation.y = Math.PI/2;
        button1TexMesh.receiveShadow = true;
        button1TexMesh.castShadow = true;
        television.add(button1TexMesh);

        for(let i = 0; i<2; i++){
            const bar = new THREE.BoxGeometry(frontWidth,frontWidth,frontz);
            const barMesh = new THREE.Mesh(bar, this.materials.black);
            barMesh.position.set(-backWdith-frontWidth/2,-frontWidth/2-backy/2+i*(backy+frontWidth),0);
            barMesh.receiveShadow = true;
            barMesh.castShadow = true;
            television.add(barMesh);

            const sideBar = new THREE.BoxGeometry(frontWidth,fronty,frontWidth);
            const sideBarMesh = new THREE.Mesh(sideBar, this.materials.black);
            sideBarMesh.position.set(-backWdith-frontWidth/2,0,-frontWidth/2-backz/2+i*(backz+frontWidth));
            sideBarMesh.receiveShadow = true;
            sideBarMesh.castShadow = true;
            television.add(sideBarMesh);
        }

        television.position.set(x,y,z);
        this.app.scene.add(television);
    }
    
}
export { MyTelevision };