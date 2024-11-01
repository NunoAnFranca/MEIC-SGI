import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';


class MyBillboard  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.builder = new MyNurbsBuilder();
        this.loader = new THREE.TextureLoader();
        this.meshes = [];
        this.samplesU = 64;
        this.samplesV = 64;

        const lieTexture = this.loader.load('textures/cakelie.jpg');
        lieTexture.colorSpace = THREE.SRGBColorSpace;

        this.materials = [
            new THREE.MeshPhongMaterial({color: "#111111", specular: "#ffffff", side: THREE.DoubleSide}),// rivets
            new THREE.MeshBasicMaterial({color: "#ffffff", specular: "#ffffff", side: THREE.DoubleSide, map: lieTexture}), 
        ];

    }

    /**
     * Function that takes position x and y in order to create a billboard
     */
    buildBillboard(positionX, positionY, positionZ){
        
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 2;
        let orderV = 3;
        const radialSegments = 32;
        const cylinderRadius = 0.05;
        const cylinderHeight = 0.3;
        const sphereRadius = 0.075;

        let billboard = new THREE.Group();
        let rivet = new THREE.Group();


        controlPoints = [
            // U = 0
            [ // V = 0..3
                [-2,-2,0,1],
                [-2.5,-1,0,1],
                [-1.5,1,0,1],
                [-2,2,0,1]
            ],
            [ // V = 0..3
                [0,-1.5,0,1],
                [0,-0.5,0,1],
                [0,1.5,0,1],
                [0,2.5,0,1]
            ],
            [ // V = 0..3
                [2,-2,0,1],
                [1.5,-1,0,1],
                [2.5,1,0,1],
                [2,2,0,1]
            ]
            // U = 1
        ];

        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials[1]);
        mesh = new THREE.Mesh(surfaceData, this.materials[1]);
        mesh.rotation.y = -Math.PI/2;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        billboard.add(mesh);
        this.meshes.push(mesh);

        const cylinder = new THREE.CylinderGeometry(cylinderRadius,cylinderRadius,cylinderHeight,radialSegments);
        const cylinderMesh = new THREE.Mesh(cylinder, this.materials[0]);
        rivet.add(cylinderMesh);

        const sphere = new THREE.SphereGeometry(sphereRadius,radialSegments,radialSegments,0, Math.PI);
        sphere.phiLength = Math.PI;
        const sphereMesh = new THREE.Mesh(sphere, this.materials[0]);
        sphereMesh.position.set(0,cylinderHeight/2,0);
        sphereMesh.rotation.x = -Math.PI/2;
        rivet.add(sphereMesh);
        rivet.rotation.z=Math.PI/2;

        for(let i= 0; i< 2; i++){
            const rivet1Clone = rivet.clone();
            const rivet2Clone = rivet.clone();
            rivet1Clone.position.set(cylinderHeight/2, -1.6, i*3-1.5);
            rivet2Clone.position.set(cylinderHeight/2, 1.6, i*3-1.5);
            billboard.add(rivet1Clone,rivet2Clone);
        }

        billboard.position.set(positionX/2-0.3, 3*positionY/4, positionZ/3);
        this.app.scene.add(billboard);
    }
}
export { MyBillboard };