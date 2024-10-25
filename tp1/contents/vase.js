import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';


class MyVase  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.loader = new THREE.TextureLoader();
        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 32;
        this.samplesV = 32;

        const textures = {
            vase1 : this.loader.load('textures/vase1.jpg')
        }

        textures.vase1.colorSpace = THREE.SRGBColorSpace;

        this.materials = {
            vase1: new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase1})
        }
    }

    /**
     * Function that takes position x and y in order to create a vase
     */
    buildVase(positionX, positionZ){
        this.materials.vase1.side = THREE.DoubleSide;
        
        let vase = new THREE.Group();
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 3;
        let orderV = 2;

        controlPoints = [
            // U = 0
            [ // V = 0..1
                [-2.0, -3.0, 0.0, 1],
                [-3.0, 0.0, 0.0, 1],
                [-1.0, 3.0, 0.0, 1]
            ],
            // U = 1
            [ // V = 0..1
                [0, -3.0,-2.0, 1],
                [0, 0,-3.0, 1],
                [0, 3.0, -1.0, 1]
            ],
            // U = 2
            [ // V = 0..1
                [2.0, -3.0, 0, 1],
                [3.0, 0, 0, 1],
                [1.0, 3.0, 0, 1]
            ],
            // U = 3
            [ // V = 0..1
                [0, -3.0, 2.0, 1],
                [0, 0, 3.0, 1],
                [0, 3.0, 1.0, 1]
            ]
        ];

        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials.vase1);
        mesh = new THREE.Mesh(surfaceData, this.materials.vase1);
        vase.add(mesh);
        this.meshes.push(mesh);


        vase.position.set(positionX, 5,positionZ);
        vase.scale.set(0.25,0.25,0.25);
        this.app.scene.add(vase);
    }

}
export { MyVase };