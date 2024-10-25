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
            vase1 : this.loader.load('textures/vase1.jpg'),
            clay : this.loader.load('textures/clay.jpg')
        }

        textures.vase1.colorSpace = THREE.SRGBColorSpace;
        textures.clay.colorSpace = THREE.SRGBColorSpace;


        this.materials = {
            vase1: new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase1}),
            clay:  new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#111111", map: textures.clay}),
        }
    }

    /**
     * Function that takes position x and y in order to create a vase
     */
    buildVase(positionX, positionZ){
        this.materials.vase1.side = THREE.DoubleSide;
        
        let radialSegments = 32;
        let plateHeight = 0.2;
        let platewidth = 2;
        let vase = new THREE.Group();
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 3;
        let orderV = 4;

        controlPoints = [
            // U = 0
            [ // V = 0..4
                [-1,0,0,1],
                [-3,1,0,1],
                [-1/2,5,0,1],
                [-1.5,6,0,1],
                [-2,8,0,1]

            ],
            // U = 1
            [ // V = 0..4
                [-1,0,-4/3,1],
                [-3,1,-4,1],
                [-1/2,5,-2/3,1],
                [-1.5,6,-2,1],
                [-2,8,-8/3,1]

            ],
            // U = 2
            [ // V = 0..4
                [1,0,-4/3,1],
                [3,1,-4,1],
                [1/2,5,-2/3,1],
                [1.5,6,-2,1],
                [2,8,-8/3,1]
            ],
            // U = 3
            [ // V = 0..4
                [1,0,0,1],
                [3,1,0,1],
                [1/2,5,0,1],
                [1.5,6,0,1],
                [2,8,0,1]
            ]
        ];

        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials.vase1);
        mesh = new THREE.Mesh(surfaceData, this.materials.vase1);
        mesh.position.set(0,plateHeight/2,0);
        vase.add(mesh);
        this.meshes.push(mesh);

        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials.vase1);
        mesh = new THREE.Mesh(surfaceData, this.materials.vase1);
        mesh.rotation.y = Math.PI;
        mesh.position.set(0,plateHeight/2,0);
        vase.add(mesh);
        this.meshes.push(mesh);

        const plate = new THREE.CylinderGeometry(platewidth, platewidth, plateHeight, radialSegments, radialSegments);
        const plateMesh = new THREE.Mesh(plate, this.materials.clay);
        plateMesh.position.set(0,plateHeight/2,0);
        vase.add(plateMesh);

        vase.position.set(positionX, 0,positionZ);
        vase.scale.set(0.25,0.25,0.25);
        this.app.scene.add(vase);
    }

}
export { MyVase };