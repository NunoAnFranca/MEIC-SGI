import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';


class MyCouch  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app, roomHeight, roomWidth) {
        this.app = app;
        this.roomHeight = roomHeight;
        this.roomWidth = roomWidth;
        this.loader = new THREE.TextureLoader();
        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 64;
        this.samplesV = 64;

        const leatherTexture = this.loader.load('textures/leather.jpg');
        leatherTexture.wrapS = leatherTexture.wrapT = THREE.RepeatWrapping;
        leatherTexture.colorSpace = THREE.SRGBColorSpace;

        this.materials = {
            leather : new THREE.MeshPhongMaterial({color: "#FFFFFF", specular: "#ffffff", side: THREE.DoubleSide, map: leatherTexture})
        }
    }

    buildCouch(){
        let couch = new THREE.Group();

        const center = new THREE.BoxGeometry(3,1.5,6);
        const centerMesh = new THREE.Mesh(center,this.materials.leather);
        couch.add(centerMesh);
    
        couch.position.set(-this.roomWidth*0.35,0.75,0);
        this.app.scene.add(couch);
    }
}
export { MyCouch };