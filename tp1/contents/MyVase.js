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
        this.samplesU = 64;
        this.samplesV = 64;

        // Textures for vase
        const textures = {
            vase1 : this.loader.load('textures/vase1.jpg'),
            vase2 : this.loader.load('textures/vase2.jpg'),
            vase3 : this.loader.load('textures/vase3.jpg'),
            clay : this.loader.load('textures/clay.jpg'),
            dirt : this.loader.load('textures/dirt.jpg'),
        }

        textures.vase1.colorSpace = THREE.SRGBColorSpace;
        textures.vase2.colorSpace = THREE.SRGBColorSpace;
        textures.vase3.colorSpace = THREE.SRGBColorSpace;
        textures.clay.colorSpace = THREE.SRGBColorSpace;
        textures.dirt.colorSpace = THREE.SRGBColorSpace;

        // Materials for vase
        this.materials = [
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#111111", map: textures.clay}),
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#111111", map: textures.dirt, side: THREE.DoubleSide}), 
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase1, side: THREE.DoubleSide}),
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase2, side: THREE.DoubleSide}),
            new THREE.MeshPhongMaterial({color: "#ffffff", specular: "#ffffff", map: textures.vase3, side: THREE.DoubleSide}),
        ];
    }

    /**
     * Function that takes position x and y in order to create a vase
     */
    buildVase(positionX, positionZ,tex){
        
        let radialSegments = 64;
        let plateHeight = 0.2;
        let platewidth = 1.75;
        let vase = new THREE.Group();
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 3;
        let orderV = 4;

        // Points definition for the vase
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
        
        // Two surfaces for vase creation, given the rotation of one side
        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials[tex]);
        mesh = new THREE.Mesh(surfaceData, this.materials[tex]);
        mesh.position.set(0,plateHeight/2,0);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        vase.add(mesh);
        this.meshes.push(mesh);

        // Two surfaces for vase creation, given the rotation of one side
        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials[tex]);
        mesh = new THREE.Mesh(surfaceData, this.materials[tex]);
        mesh.rotation.y = Math.PI;
        mesh.position.set(0,plateHeight/2,0);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        vase.add(mesh);
        this.meshes.push(mesh);

        // Smal cylinder dirt in order to give perspective in the flowers
        const dirt = new THREE.CylinderGeometry(1.47, 1.47, 0.01, radialSegments, radialSegments);
        const dirtMesh = new THREE.Mesh(dirt, this.materials[1]);
        dirtMesh.position.set(0,6,0);
        dirtMesh.receiveShadow = true;
        dirtMesh.castShadow = true;
        vase.add(dirtMesh);

        // Clay plate for the vase
        const plate = new THREE.CylinderGeometry(platewidth, platewidth, plateHeight, radialSegments, radialSegments);
        const plateMesh = new THREE.Mesh(plate, this.materials[0]);
        plateMesh.position.set(0,plateHeight/2,0);
        plateMesh.receiveShadow = true;
        plateMesh.castShadow = true;
        vase.add(plateMesh);

        vase.position.set(positionX, 0,positionZ);
        vase.scale.set(0.25,0.25,0.25);
        this.app.scene.add(vase);
    }

}
export { MyVase };