import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';


class MySpotCake  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.spotLight = null;
        this.spotLightHelper = null;

        this.materials = [
            new THREE.MeshPhongMaterial({color: "#000000", specular: "#AAAAAA"}), 
            new THREE.MeshPhongMaterial({color: "#FFFF9E", specular: "#000000", emissive: "#FFFF9E"}), 
        ];
    }

    /**
     * 
     */
    buildSpot(x,y,z){
        const stickWidth = 0.15;
        const stickHeight = 0.6;
        const radialSegments = 32;
        const tubeWidth = 0.2;
        const tubeHeight = 0.8;

        let spot = new THREE.Group();
        let main = new THREE.Group();

        const stick = new THREE.BoxGeometry(stickWidth,stickHeight,stickWidth);
        const stickMesh = new THREE.Mesh(stick, this.materials[0]);
        stickMesh.position.set(0,-stickHeight/2,0);
        spot.add(stickMesh);
        
        const tube = new THREE.CylinderGeometry(tubeWidth,tubeWidth,tubeHeight,radialSegments);
        const tubeMesh = new THREE.Mesh(tube, this.materials[0]);
        main.add(tubeMesh);

        const light = new THREE.SphereGeometry(3*tubeWidth/4,radialSegments,radialSegments);
        const lightMesh = new THREE.Mesh(light, this.materials[1]);
        lightMesh.position.set(0,tubeWidth/4-tubeHeight/2,0);
        main.add(lightMesh);

        main.rotation.x= Math.PI/4;
        main.position.set(0,-3*tubeHeight/4,-tubeHeight/4);
        spot.add(main);

        spot.position.set(x,y,z);
        spot.rotation.y = Math.PI/2;
        this.app.scene.add(spot);

        this.spotLight = new THREE.SpotLight(0xFFFFFF, 50);
        this.spotLight.position.set(x-tubeHeight/2,y-tubeHeight,z);
        this.spotLight.decay = 0;
        this.spotLight.penumbra = 1;
        this.spotLight.angle = 0.1; 
        this.spotLight.distance = 15;
        this.spotLight.target.position.set(0, 2.65, 0);

        this.app.scene.add(this.spotLight);
        this.app.scene.add(this.spotLight.target);

        //Spotlight Helper
        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight, 0.2);
        this.spotLightHelper.visible = false;
        this.app.scene.add(this.spotLightHelper);
    }

    toggleSpotLightHelpers(visible) {
        this.spotLightHelper.visible = visible;
    }

    updateSpotLightHelper() {
            if (this.spotLightHelper.visible) {
                this.spotLightHelper.update();
            }
        }
    
}
export { MySpotCake };