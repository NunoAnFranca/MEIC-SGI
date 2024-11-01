import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';


class MyJournal  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;

        const map = new THREE.TextureLoader().load('textures/newspaper.png');
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;
        this.material = new THREE.MeshLambertMaterial({ map: map, side: THREE.DoubleSide});
        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 64;
        this.samplesV = 64;
    }

    buildJournal() {  
        // are there any meshes to remove?
        if (this.meshes !== null) {
            // traverse mesh array
            for (let i=0; i<this.meshes.length; i++) {
                // remove all meshes from the scene
                this.app.scene.remove(this.meshes[i]);
            }
            this.meshes = []; // empty the array  
        }

        // declare local variables
        let firstControlPoints, secondControlPoints;
        let firstSurfaceData, secondSurfaceData;
        let firstMesh, secondMesh;
        let offset = 0.2; // offset for each surface

        for (let n = 0; n < 5; n++) {
            firstControlPoints = [
                [
                    [1.5, -2.0, 0.0, 1],
                    [1.5, 2.0, 0.0, 1]
                ],
                [
                    [0.0, -2.0, 0.0, 1],
                    [0.0, 2.0, 0.0, 1]
                ],
                [
                    [-2.0 + n * offset * 2, -2.0, -2.0 + n * offset, 1],
                    [-2.0 + n * offset * 2, 2.0, -2.0 + n * offset, 1]
                ],
                [
                    [-2.0, -2.0, 2.0 - n * offset, 1],
                    [-2.0, 2.0, 2.0 - n * offset, 1]
                ],
                [
                    [2.0 - n * offset, -2.0, 2.0 - n * offset, 1],
                    [2.0 - n * offset, 2.0, 2.0 - n * offset, 1]
                ],
                [
                    [2.0, -2.0, 0.0 + n * offset, 1],
                    [2.0, 2.0, 0.0 + n * offset, 1]
                ],
                [
                    [0.0, -2.0, -0.1, 1],
                    [0.0, 2.0, -0.1, 1]
                ],
            ];

            let firstOrderU = firstControlPoints.length - 1;
            let firstOrderV = firstControlPoints[0].length - 1;

            firstSurfaceData = this.builder.build(firstControlPoints, firstOrderU, firstOrderV, this.samplesU, this.samplesV, this.material);
            firstMesh = new THREE.Mesh(firstSurfaceData, this.material);
            
            secondControlPoints = [
                [
                    [4.0, -2.0, 0.0 + n * offset * 0.2, 1],
                    [4.0, 2.0, 0.0 + n * offset * 0.2, 1]
                ],
                [
                    [1.5, -2.0, 0.25 + n * offset * 0.1, 1],
                    [1.5, 2.0, 0.25 + n * offset * 0.1, 1]
                ],
                [
                    [0.0, -2.0, -0.1, 1],
                    [0.0, 2.0, -0.1, 1]
                ]
            ]

            let secondOrderU = secondControlPoints.length - 1;
            let secondOrderV = secondControlPoints[0].length - 1;

            secondSurfaceData = this.builder.build(secondControlPoints, secondOrderU, secondOrderV, this.samplesU, this.samplesV, this.material);
            secondMesh = new THREE.Mesh(secondSurfaceData, this.material);

            firstMesh.rotation.set(- Math.PI / 2, Math.PI / 30, 0);
            secondMesh.rotation.set(- Math.PI / 2, Math.PI / 30, 0);
            firstMesh.scale.set(0.5, 0.5, 0.5);
            secondMesh.scale.set(0.5, 0.5, 0.5);
            firstMesh.position.set(-3, 2.85, -0.2);
            secondMesh.position.set(-3, 2.85, -0.2);
            firstMesh.receiveShadow = true;
            firstMesh.castShadow = true;
            secondMesh.receiveShadow = true;
            secondMesh.castShadow = true;
            this.app.scene.add(firstMesh);
            this.app.scene.add(secondMesh);
            this.meshes.push(firstMesh);
            this.meshes.push(secondMesh);
        }
    }
    
}
export { MyJournal };