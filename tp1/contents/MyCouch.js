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
            color1 : new THREE.MeshPhongMaterial({color: "#FFFFFF", specular: "#111111", side: THREE.DoubleSide}),
            color2 : new THREE.MeshPhongMaterial({color: "#AAAAFF", specular: "#111111", side: THREE.DoubleSide}),
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

        let orderBackU = 10;
        let orderBackV = 3;

        let orderPillowU = 3;
        let orderPillowV = 4;
        
        const radialSegments = 32;
        const centerx = 3, centerz = 4;
        const feetTop = 0.1, feetDown = 0.05, feetHeight = 0.4;

        let couch = new THREE.Group();
        let pillow = new THREE.Group();

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
        surfaceData = this.builder.build(controlPoints, orderSidesU, orderSidesV, this.samplesU, this.samplesV, this.materials.color1);
        mesh = new THREE.Mesh(surfaceData, this.materials.color1);
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
        surfaceData = this.builder.build(controlPoints, orderSidesU, orderSidesV, this.samplesU, this.samplesV, this.materials.color1);
        mesh = new THREE.Mesh(surfaceData, this.materials.color1);
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
        surfaceData = this.builder.build(controlPoints, orderCenterU, orderCenterV, this.samplesU, this.samplesV, this.materials.color1);
        mesh = new THREE.Mesh(surfaceData, this.materials.color1);
        mesh.position.set(0,feetHeight,0);
        mesh.scale.set(1.1,1.1,1.1);
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        couch.add(mesh);
        this.meshes.push(mesh);
    
        couch.position.set(-this.roomWidth*0.35,0,0);
        this.app.scene.add(couch);


        //Back points of the couch
        controlPoints = [
            [
                [-0.5,0,2,0.1],
                [-0.5,0,2,1],
                [-0.5,0,-2,1],
                [-0.5,0,-2,0.1]
            ],
            [                   
                [-0.5,0,2,0.1],
                [0,0,2,6],
                [0,0,-2,6],
                [-0.5,0,-2,0.1],
            ],
            [
                [-0.5,0,2,0.1],
                [0,0,2,1],
                [0,0,-2,1],
                [-0.5,0,-2,0.1],
            ],
            [
                [-0.5,4.5,2.2,0.1],
                [0,4.5,2.2,1],
                [0,4.5,-2.2,1],
                [-0.5,4.5,-2.2,0.1],

            ],
            [
                [-0.5,4.5,2.2,0],
                [0,4.5,2.2,10],
                [0,4.5,-2.2,10],
                [-0.5,4.5,-2.2,0],
            ],
            [
                [-0.5,5.5,2.4,0.1],
                [-0.5,5.5,2.4,2],
                [-0.5,5.5,-2.4,2],
                [-0.5,5.5,-2.4,0.1],
            ],
            [
                [-0.5,4.5,2.2,0],
                [-1,4.5,2.2,6],
                [-1,4.5,-2.2,6],
                [-0.5,4.5,-2.2,0],
            ],
            [
                [-0.5,4.5,2.2,0.1],
                [-1,4.5,2.2,1],
                [-1,4.5,-2.2,1],
                [-0.5,4.5,-2.2,0.1]
            ],
            [
                [-0.5,0,2,0.1],
                [-1,0,2,1],
                [-1,0,-2,1],
                [-0.5,0,-2,0.1]
            ],
            [
                [-0.5,0,2,0.1],
                [-1,0,2,6],
                [-1,0,-2,6],
                [-0.5,0,-2,0.1]
            ],
            [
                [-0.5,0,2,0.1],
                [-0.5,0,2,1],
                [-0.5,0,-2,1],
                [-0.5,0,-2,0.1],
            ],
        ];

        //Back side of the couch
        surfaceData = this.builder.build(controlPoints, orderBackU, orderBackV, this.samplesU, this.samplesV, this.materials.color1);
        mesh = new THREE.Mesh(surfaceData, this.materials.color1);
        mesh.position.set(-centerx/2,0,0);
        mesh.scale.set(1.05,1.05,1.05);
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        couch.add(mesh);
        this.meshes.push(mesh);

        
        //Pillow points of the couch
        controlPoints = [
            [                   
                [-0.5,-0.20,-1.20,0.1],
                [-0.5,-0.20,-1.20,1],
                [-0.5,0,0,1],
                [-0.5,-0.20, 1.20,1],
                [-0.5,-0.20, 1.20,0.1],

            ],
            [ 
                [-0.5,0,-1,0.1],
                [0,0,-1,5],
                [-0.2,0,0,5],
                [0,0, 1,5],
                [-0.5,0,1,0.1],

            ],
            [
                [-0.5,1,-1,0.1],
                [0,1,-1,5],
                [-0.25,1,0,5],
                [0,1,1,5],
                [-0.5,1,1,0.1],
            ],
            [ 
                [-0.5,1.20,-1.20,0.1],
                [-0.5,1.20,-1.20,1],
                [-0.5,1,0,1],
                [-0.5,1.20, 1.20,1],
                [-0.5,1.20, 1.20,0.1],

            ],
        ];

        //Pillow of the couch
        surfaceData = this.builder.build(controlPoints, orderPillowU, orderPillowV, this.samplesU, this.samplesV, this.materials.color2);
        mesh = new THREE.Mesh(surfaceData, this.materials.color2);
        mesh.position.set(0,0,0);
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        pillow.add(mesh);
        this.meshes.push(mesh);

        //Pillow of the couch
        mesh = new THREE.Mesh(surfaceData, this.materials.color2);
        mesh.position.set(-1,0,0);
        mesh.rotation.y=Math.PI;
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        pillow.add(mesh);
        this.meshes.push(mesh);

        pillow.scale.set(1.5,1.5,1.5);
        pillow.rotation.z=Math.PI/6;
        pillow.position.set(-centerx/2 + 2*Math.cos(Math.PI/6),2.1+Math.sin(Math.PI/6),0);

        couch.add(pillow);
        couch.scale.set(0.9,0.9,0.9);
        couch.position.set(-this.roomWidth*0.35,0,this.roomWidth*0.2);
        this.app.scene.add(couch);
    }
}
export { MyCouch };