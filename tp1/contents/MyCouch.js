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
        this.samplesU = 128;
        this.samplesV = 128;

        //const leatherTexture = this.loader.load('textures/leather.jpg');              //keep the leather texture???!?!?!
        //leatherTexture.wrapS = leatherTexture.wrapT = THREE.RepeatWrapping;
        //leatherTexture.colorSpace = THREE.SRGBColorSpace;

        const goldTexture = this.loader.load('textures/gold.jpg');
        goldTexture.colorSpace = THREE.SRGBColorSpace;

        this.materials = {
            leather : new THREE.MeshPhongMaterial({color: "#FFFFFF", specular: "#ffffff", side: THREE.DoubleSide}),
            gold : new THREE.MeshPhongMaterial({color: "#FFFFFF", specular: "#AAAAAA", map: goldTexture}),

        }
    }

    buildCouch(){
        let controlPoints;
        let surfaceData;
        let mesh;
        let orderSidesU = 10;
        let orderSidesV = 3;

        let orderCenterU = 9;
        let orderCenterV = 3;
        
        const radialSegments = 32;
        const centerx = 3, centerz = 4;
        const feetTop = 0.1, feetDown = 0.05, feetHeight = 0.4;

        let couch = new THREE.Group();

        const feet = new THREE.CylinderGeometry(feetTop,feetDown,feetHeight, radialSegments);
        const feetMesh = new THREE.Mesh(feet, this.materials.gold);

        for(let i = 0; i < 2; i++){
            let feetLeft = feetMesh.clone();
            let feetRight = feetMesh.clone();

            feetLeft.position.set(-centerx/4, feetHeight/2, -centerz/4 + i*centerz/2);
            feetRight.position.set(centerx/4, feetHeight/2, -centerz/4 + i*centerz/2);

            couch.add(feetLeft,feetRight);
        }
        
        //left side points of the couch
        controlPoints = [
            [ 
                [2.25,0,-2.5,0.1],
                [2.25,0,-2.5,1],
                [-2,0,-2.5,1],
                [-2,0,-2.5,0.1],
            ],
            [ 
                [2.25,0,-2.5,0.1],
                [2.25,0,-2,5],
                [-2,0,-2,5],
                [-2,0,-2.5,0.1],
            ],                
            [ 
                [2.25,0,-2.5,0.1],
                [2.25,0,-2,1],
                [-2,0,-2,1],
                [-2,0,-2.5,0.1],
            ],
            [ 
                [2.25,2.25,-2.5,0.1],
                [2.25,2.25,-2,1],
                [-2,2.25,-2,1],
                [-2,2.25,-2.5,0.1],
            ],
            [ 
                [2.25,2.25,-2.5,0.1],
                [2.25,2.25,-2,8],
                [-2,2.25,-2,8],
                [-2,2.25,-2.5,0.1],
            ],
            [ 
                [2.25,8,-2.5,0],
                [2.25,8,-2.5,1],
                [-2,8,-2.5,1],
                [-2,8,-2.5,0],
            ],
            [ 
                [2.25,2.25,-2.5,0.1],
                [2.25,2.25,-3,6],
                [-2,2.25,-3,6],
                [-2,2.25,-2.5,0.1],
            ],
            [ 
                [2.25,2.25,-2.5,0.1],
                [2.25,2.25,-3,1],
                [-2,2.25,-3,1],
                [-2,2.25,-2.5,0.1],
            ],                
            [ 
                [2.25,0,-2.5,0.1],
                [2.25,0,-3,1],
                [-2,0,-3,1],
                [-2,0,-2.5,0.1],
            ],
            [ 
                [2.25,0,-2.5,0.1],
                [2.25,0,-3,5],
                [-2,0,-3,5],
                [-2,0,-2.5,0.1],
            ],           
            [
                [2.25,0,-2.5,0.1],
                [2.25,0,-2.5,1],
                [-2,0,-2.5,1],
                [-2,0,-2.5,0.1],
            ],

        ];

        //Surface for left side of the couch
        surfaceData = this.builder.build(controlPoints, orderSidesU, orderSidesV, this.samplesU, this.samplesV, this.materials.leather);
        mesh = new THREE.Mesh(surfaceData, this.materials.leather);
        mesh.position.set(0,0,0.1);
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        couch.add(mesh);
        this.meshes.push(mesh);

        //right side points of the couch
        controlPoints = [
            [ 
                [2.25,0,2.5,0.1],
                [2.25,0,2.5,1],
                [-2,0,2.5,1],
                [-2,0,2.5,0.1],
            ],
            [ 
                [2.25,0,2.5,0.1],
                [2.25,0,2,5],
                [-2,0,2,5],
                [-2,0,2.5,0.1],
            ],                
            [ 
                [2.25,0,2.5,0.1],
                [2.25,0,2,1],
                [-2,0,2,1],
                [-2,0,2.5,0.1],
            ],
            [ 
                [2.25,2.25,2.5,0.1],
                [2.25,2.25,2,1],
                [-2,2.25,2,1],
                [-2,2.25,2.5,0.1],
            ],
            [ 
                [2.25,2.25,2.5,0.1],
                [2.25,2.25,2,8],
                [-2,2.25,2,8],
                [-2,2.25,2.5,0.1],
            ],
            [ 
                [2.25,8,2.5,0],
                [2.25,8,2.5,1],
                [-2,8,2.5,1],
                [-2,8,2.5,0],
            ],
            [ 
                [2.25,2.25,2.5,0.1],
                [2.25,2.25,3,6],
                [-2,2.25,3,6],
                [-2,2.25,2.5,0.1],
            ],
            [ 
                [2.25,2.25,2.5,0.1],
                [2.25,2.25,3,1],
                [-2,2.25,3,1],
                [-2,2.25,2.5,0.1],
            ],                
            [ 
                [2.25,0,2.5,0.1],
                [2.25,0,3,1],
                [-2,0,3,1],
                [-2,0,2.5,0.1],
            ],
            [ 
                [2.25,0,2.5,0.1],
                [2.25,0,3,5],
                [-2,0,3,5],
                [-2,0,2.5,0.1],
            ],           
            [
                [2.25,0,2.5,0.1],
                [2.25,0,2.5,1],
                [-2,0,2.5,1],
                [-2,0,2.5,0.1],
            ],

        ];

        //Surface for right side of the couch
        surfaceData = this.builder.build(controlPoints, orderSidesU, orderSidesV, this.samplesU, this.samplesV, this.materials.leather);
        mesh = new THREE.Mesh(surfaceData, this.materials.leather);
        mesh.position.set(0,0,-0.1);
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        couch.add(mesh);
        this.meshes.push(mesh);


        //middle points of the couch
        controlPoints = [
            [
                [1.5,0,0,0.1],
                [1.5,0,0,1],
                [-1.5,0,0,1],
                [-1.5,0,0,0.1],

            ],
            [
                [1.5,0,0,0.1],
                [1.5,0,2,6],
                [-1.5,0,2,6],
                [-1.5,0,0,0.1],

            ],
            [
                [1.5,0,0,0.1],
                [1.5,0,2,1],
                [-1.5,0,2,1],
                [-1.5,0,0,0.1],
            ],
            [
                [1.5,1.5,0,0.1],
                [1.5,1.5,2,20],
                [-1.5,1.5,2,20],
                [-1.5,1.5,0,0.1],

            ],
            [
                [1.5,1.5,0,0.1],
                [1.5,1.5,2,1],
                [-1.5,1.5,2,1],
                [-1.5,1.5,0,0.1]

            ],
            [
                [1.5,1.5,0,0.1],
                [1.5,1.5,-2,1],
                [-1.5,1.5,-2,1],
                [-1.5,1.5,0,0.1],

            ],
            [
                [1.5,1.5,0,0.1],
                [1.5,1.5,-2,20],
                [-1.5,1.5,-2,20],
                [-1.5,1.5,0,0.1],
            ],
            [
                [1.5,0,0,0.1],
                [1.5,0,-2,1],
                [-1.5,0,-2,1],
                [-1.5,0,0,0.1],
            ],
            [
                [1.5,0,0,0.1],
                [1.5,0,-2,6],
                [-1.5,0,-2,6],
                [-1.5,0,0,0.1],

            ],
            [
                [1.5,0,0,0.1],
                [1.5,0,0,1],
                [-1.5,0,0,1],
                [-1.5,0,0,0.1],
            ],

        ];

        //middle side of the couch
        surfaceData = this.builder.build(controlPoints, orderCenterU, orderCenterV, this.samplesU, this.samplesV, this.materials.leather);
        mesh = new THREE.Mesh(surfaceData, this.materials.leather);
        mesh.position.set(0,feetHeight,0);
        mesh.scale.set(1.1,1.1,1.1);
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        couch.add(mesh);
        this.meshes.push(mesh);
    
        couch.position.set(-this.roomWidth*0.35,0,0);
        this.app.scene.add(couch);
    }
}
export { MyCouch };