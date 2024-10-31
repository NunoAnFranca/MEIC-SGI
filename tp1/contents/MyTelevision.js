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
        screenTexture.colorSpace = THREE.SRGBColorSpace;

        this.materials = {
            black : new THREE.MeshPhongMaterial({color: "#000000", specular: "#000000"}), 
            screen: new THREE.MeshBasicMaterial({color: "#ffffff", specular: "#000000", map: screenTexture}) 
        };
    }

    /**
     * 
     */
    buildTelevision(x,y,z){
        let television = new THREE.Group();
        const backWdith = 0.4;
        const backy = 3*(3/2);
        const backz = 4*(3/2);

        const frontWidth = 0.2;
        const fronty = backy+0.4;
        const frontz = backz+0.4;

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