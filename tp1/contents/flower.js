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
            new THREE.MeshPhongMaterial({color: "#4CD038", specular: "#ffffff", side: THREE.DoubleSide}), // green
            new THREE.MeshPhongMaterial({color: "#FFD700", specular: "#111111"}), // Mid yellow
            new THREE.MeshPhongMaterial({color: "#1E90FF", specular: "#888888", side: THREE.DoubleSide}), // blue
            new THREE.MeshPhongMaterial({color: "#F33A6A", specular: "#888888", side: THREE.DoubleSide}), // rose
            new THREE.MeshPhongMaterial({color: "#9858C0", specular: "#888888", side: THREE.DoubleSide}), // purple
        ];
    }

    /**
     * Function that takes position x and y in order to create a flower
     */
    buildFlower(positionX, positionZ,tex){
        
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 2;
        let orderV = 3;
        const radialSegments = 32;
        const sphereRadius = 0.3;

        let flower = new THREE.Group();
        //let petals = new THREE.Object3D();
        
        let pointsSteem = [
            new THREE.Vector3(0, -0.5, 0),
            new THREE.Vector3(0.1, 0, 0),
            new THREE.Vector3(0.1, 0.25, -0.1),
            new THREE.Vector3(-0.1, 0.50, 0.1),
            new THREE.Vector3(0, 1.5, 0)
        ];

        const steem = new THREE.CatmullRomCurve3(pointsSteem);
        const points = steem.getPoints( 50 ); 
        const curvePath = new THREE.CurvePath();
        curvePath.add(new THREE.CatmullRomCurve3(points));
    
        const steemTube = new THREE.TubeGeometry(curvePath,25,0.03,radialSegments,false);
        const steemMesh = new THREE.Mesh(steemTube,this.materials[0] );
        steemMesh.rotation.y = tex * Math.PI/2;
        flower.add(steemMesh);

        const center = new THREE.SphereGeometry(sphereRadius, radialSegments, radialSegments);
        const centerMesh = new THREE.Mesh(center, this.materials[1]);
        centerMesh.position.set(0,1.5,0);
        flower.add(centerMesh);

        controlPoints = [
            // U = 0
            [ // V = 0..3
                [-0.5,0,-2,1],
                [-1.5,1.25,-1,1],
                [-0.25,0,2,1],
                [0,0,2.1,1]
            ],
            [ // V = 0..3
                [0,0.25,-2,1],
                [0,1.35,-1,1],
                [0,0,2,1],
                [0,0,2.1,1]
            ],
            // U = 1
            [ // V = 0..3
                [0.5,0,-2,1],
                [1.5,1.25,-1,1],
                [0.25,0,2,1],
                [0,0,2.1,1]
            ]
        ];
        
        let petals = new THREE.Group();

        for (let i = 0; i < 8; i++){
            const petal = new THREE.Object3D();

            surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.materials[tex]);
            mesh = new THREE.Mesh(surfaceData, this.materials[tex]);
            mesh.position.set(0,0,0.25+4.1/8);
            mesh.scale.set(0.25,0.25,0.25);
            petal.add(mesh);
            this.meshes.push(mesh);
            petals.add(petal);
            petal.rotation.y = Math.PI/4*i;
            petal.rotation.x = -Math.PI/4;
        }

        petals.position.set(0,1.5,0);
        flower.add(petals);
        flower.position.set(positionX, 1.5, positionZ);
        this.app.scene.add(flower);
    }
}
export { MyFlower };