import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';



class MyRoomLights  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app, mapSize) {
        this.app = app;
        this.mapSize = mapSize;

        this.radio = new THREE.Group();
        this.stool = new THREE.Group();

    }

    buildLights(){

        // add a general ambient light
        this.ambientLightColor = 0x555555;
        this.ambientLightIntensity = 5;
        this.ambientLight = new THREE.AmbientLight(this.ambientLightColor, 5);
        this.app.scene.add(this.ambientLight);

        // creates a directional light - ambient light
        this.roomAmbientLightColor = "#ffffff";
        this.roomAmbientLight = new THREE.DirectionalLight(this.roomAmbientLightColor, 1.5);
        this.roomAmbientLight.position.set(0, 25, 0);
        this.roomAmbientLight.castShadow = true;
        this.roomAmbientLight.shadow.mapSize.width = this.mapSize;
        this.roomAmbientLight.shadow.mapSize.height = this.mapSize;
        this.roomAmbientLight.shadow.camera.near = 0.5;
        this.roomAmbientLight.shadow.camera.far = 100;
        this.roomAmbientLight.shadow.camera.left = -15;
        this.roomAmbientLight.shadow.camera.right = 15;
        this.roomAmbientLight.shadow.camera.bottom = -15;
        this.roomAmbientLight.shadow.camera.top = 15;

        this.app.scene.add(this.roomAmbientLight);
        
        // Helper for directional light 
        this.helperRoomAmbientLight = new THREE.DirectionalLightHelper( this.roomAmbientLight, 1 );
        this.helperRoomAmbientLight.visible = false;
        this.app.scene.add(this.helperRoomAmbientLight);

        // creates a point light
        this.roomLight1Color = "#484a2c";
        this.roomLight1 = new THREE.PointLight(this.roomLight1Color, 100, 0, 0);
        this.roomLight1.position.set(10, 15, 10);
        this.roomLight1.castShadow = true;
        this.roomLight1.shadow.mapSize.width = this.mapSize;
        this.roomLight1.shadow.mapSize.height = this.mapSize;
        this.roomLight1.shadow.camera.near = 0.5;
        this.roomLight1.shadow.camera.far = 100;

        this.app.scene.add(this.roomLight1);

        // Helper for point light  
        this.helperRoomLight1 = new THREE.PointLightHelper( this.roomLight1, 1 , "#FFFFFF" );
        this.helperRoomLight1.visible = false;
        this.app.scene.add(this.helperRoomLight1);

        // creates a second point light
        this.roomLight2Color = "#484a2c";
        this.roomLight2 = new THREE.PointLight(this.roomLight2Color, 100, 0, 0);
        this.roomLight2.position.set(-10, 15, 10);
        this.roomLight2.castShadow = true;
        this.roomLight2.shadow.mapSize.width = this.mapSize;
        this.roomLight2.shadow.mapSize.height = this.mapSize;
        this.roomLight2.shadow.camera.near = 0.5;
        this.roomLight2.shadow.camera.far = 100;

        this.app.scene.add(this.roomLight2);

        // Helper for second point light  
        this.helperRoomLight2 = new THREE.PointLightHelper( this.roomLight2, 1 , "#FFFFFF");
        this.helperRoomLight2.visible = false;
        this.app.scene.add(this.helperRoomLight2);
    }

    toggleAmbientLightColor(value) {
        this.ambientLightColor = value;
        this.ambientLight.color.set(this.ambientLightColor);
    }

    toggleDirectionalLightColor(value) {
        this.roomAmbientLightColor = value;
        this.roomAmbientLight.color.set(this.roomAmbientLightColor);
    }

    togglePointLight1Color(value) {
        this.roomLight1Color = value;
        this.roomLight1.color.set(this.roomLight1Color);
    }

    togglePointLight2Color(value) {
        this.roomLight2Color = value;
        this.roomLight2.color.set(this.roomLight2Color);
    }

    updatePointLight1Helper() {
        this.helperRoomLight1.update();
    }

    updatePointLight2Helper() {
        this.helperRoomLight2.update();
    }
}
export { MyRoomLights };