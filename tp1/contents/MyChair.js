import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';



class MyChair  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.loader = new THREE.TextureLoader();

        this.woodTexture = this.loader.load('textures/wood.jpg');
        this.woodTexture.colorSpace = THREE.SRGBColorSpace;

        this.materials = {
            wood : new THREE.MeshPhongMaterial({color: "#FFFFFF", map: this.woodTexture, opacity:1})
        }
    }
    /**
     *
     */
    buildChair(x,z,rotation){
        let chair = new THREE.Group();  
        let base = new THREE.Group();
        let top = new THREE.Group();

        const legx = 0.1, legy = 1.8, legz = 0.15;
        const legsDistance = 1;
        const boxHeight = 0.2;

        const leg = new THREE.BoxGeometry(legx,legy,legz);
        const legMesh = new THREE.Mesh(leg, this.materials.wood);
        legMesh.receiveShadow = true;
        legMesh.castShadow = true;

        const topSideMesh = new THREE.Mesh(leg, this.materials.wood);
        topSideMesh.receiveShadow = true;
        topSideMesh.castShadow = true;
        
        const legSide = new THREE.BoxGeometry(4*legx/5,boxHeight,legsDistance);
        const legSideMesh = new THREE.Mesh(legSide, this.materials.wood);
        legSideMesh.receiveShadow = true;
        legSideMesh.castShadow = true;

        const legOSide = new THREE.BoxGeometry(legsDistance,boxHeight,4*legz/5);
        const legOSideMesh = new THREE.Mesh(legOSide, this.materials.wood);
        legOSideMesh.receiveShadow = true;
        legOSideMesh.castShadow = true;

        const box = new THREE.BoxGeometry(legsDistance+1.2*legx, boxHeight, legsDistance+1.2*legz);
        const boxMesh = new THREE.Mesh(box, this.materials.wood);
        boxMesh.position.set(-legsDistance/2,legy,legsDistance/2);
        boxMesh.receiveShadow = true;
        boxMesh.castShadow = true;
        chair.add(boxMesh);

        for(let i = 0; i < 2; i++){
            let leg1 = legMesh.clone();
            let leg2 = legMesh.clone();

            let leg1Side = legSideMesh.clone();
            let leg2Side = legOSideMesh.clone();
            let topSide = legOSideMesh.clone();

            let topBar = topSideMesh.clone();

            leg1.position.set(-legsDistance + i*legsDistance,legy/2,0);
            leg2.position.set(-legsDistance + i*legsDistance,legy/2,1);

            leg1Side.position.set(-legsDistance + i*legsDistance,3*legy/5-0.4,legsDistance/2);
            leg2Side.position.set(-legsDistance/2,legy/2-0.4,i*legsDistance);

            topBar.position.set(-legsDistance + i*legsDistance,legy+legy/2,1);
            topSide.position.set(-legsDistance/2,0.2+legy+legy/2+i*legy/4,1);

            top.add(topBar,topSide);
            base.add(leg1, leg2, leg1Side,leg2Side); 
        }

        chair.add(top);
        top.position.set(0,0.2,-0.4);
        top.rotation.x=0.2;
        chair.add(base);
        chair.rotation.y = rotation;
        chair.position.set(x,0,z);
        this.app.scene.add(chair);
    }

}
export { MyChair };