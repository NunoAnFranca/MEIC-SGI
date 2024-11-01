import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';

class MyLamp  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.loader = new THREE.TextureLoader();
        
        // add another point light on the lamp
        const lampLight = new THREE.PointLight(0xffff00, 100, 0);
        lampLight.position.set(9, 3.8, -9);
        this.app.scene.add(lampLight);
    }

    buildLampSticks(angleX, angleZ, x, z) {
        const lampStick = new THREE.CylinderGeometry(0.1, 0.1, 1.6, 32, 32);
        const lampStickMaterial = new THREE.MeshPhongMaterial({color: "#d9af25"});
        const lampStickMesh = new THREE.Mesh(lampStick, lampStickMaterial);
        lampStickMesh.position.set(x, 2.5, z);
        lampStickMesh.rotation.set(angleX, 0, angleZ);
        lampStickMesh.receiveShadow = true;
        lampStickMesh.castShadow = true;
        
        return lampStickMesh;
    }

    buildLamp() {
        const lamp = new THREE.Group();
        const outerPart = new THREE.CylinderGeometry(0.8, 2.1, 2, 32, 32, true);
        const innerPart = new THREE.CylinderGeometry(0.7, 2, 2, 32, 32, true);
        const topRing = new THREE.RingGeometry(0.7, 0.8, 32);
        const bottomRing = new THREE.RingGeometry(2, 2.1, 32);
        const lampSupport = new THREE.CylinderGeometry(0.2, 0.2, 3, 32, 32);
        const outerLampMaterial = new THREE.MeshPhongMaterial({color: "#993240", side: THREE.FrontSide});
        const innerLampMaterial = new THREE.MeshPhongMaterial({color: "#993240", side: THREE.BackSide});
        const lampSupportMaterial = new THREE.MeshPhongMaterial({color: "#8f6b1d"});
        const outerPartMesh = new THREE.Mesh(outerPart, outerLampMaterial);
        const innerPartMesh = new THREE.Mesh(innerPart, innerLampMaterial);
        const topRingMesh = new THREE.Mesh(topRing, innerLampMaterial);
        const bottomRingMesh = new THREE.Mesh(bottomRing, outerLampMaterial);
        const lampSupportMesh = new THREE.Mesh(lampSupport, lampSupportMaterial);

        outerPartMesh.position.set(0, 3, 0);
        innerPartMesh.position.set(0, 3, 0);
        topRingMesh.position.set(0, 4, 0);
        topRingMesh.rotation.set(Math.PI / 2, 0, 0);
        bottomRingMesh.position.set(0, 2, 0);
        bottomRingMesh.rotation.set(Math.PI / 2, 0, 0);
        lampSupportMesh.position.set(0, 1.5, 0);

        outerPartMesh.receiveShadow = true;
        outerPartMesh.castShadow = true;
        innerPartMesh.receiveShadow = true;
        innerPartMesh.castShadow = true;
        topRingMesh.receiveShadow = true;
        topRingMesh.castShadow = true;
        bottomRingMesh.receiveShadow = true;
        bottomRingMesh.castShadow = true;
        lampSupportMesh.receiveShadow = true;
        lampSupportMesh.castShadow = true;

        lamp.add(outerPartMesh);
        lamp.add(innerPartMesh);
        lamp.add(topRingMesh);
        lamp.add(bottomRingMesh);
        lamp.add(lampSupportMesh);
        lamp.add(this.buildLampSticks(0, - Math.PI / 4, 0.7, 0));
        lamp.add(this.buildLampSticks(0, Math.PI / 4, -0.7, 0));
        lamp.add(this.buildLampSticks(Math.PI / 4, 0, 0, 0.7));
        lamp.add(this.buildLampSticks(- Math.PI / 4, 0, 0, -0.7));

        lamp.position.set(9, 0, -9);
        this.app.scene.add(lamp);
    }
}
export { MyLamp };