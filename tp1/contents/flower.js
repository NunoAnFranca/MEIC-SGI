import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';


class MyFlower  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 64;
        this.samplesV = 64;

        this.materials = [
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#111111", map: textures.clay}), // green
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#111111", map: textures.dirt}), // Mid yellow
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase1, side: THREE.DoubleSide}), // blue
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase2, side: THREE.DoubleSide}), // rose
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase3, side: THREE.DoubleSide}), // purple
        ];
    }

    /**
     * Function that takes position x and y in order to create a flower
     */
    buildFlower(positionX, positionZ,tex){
        
    }

}
export { MyFlower };