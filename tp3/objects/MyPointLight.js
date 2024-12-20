import * as THREE from 'three';

// Class for Point light
class MyPointLight {
    constructor(name, value) {
        this.type = "PointLight";
        // assign name
        this.name = name;
        this.enabled = value.enabled === false ? false : true;
        // assign color
        this.color = new THREE.Color(value.color.r, value.color.g, value.color.b);
        // assign intensity
        this.intensity = value.intensity ? value.intensity : 1;
        // assign distance
        this.distance = value.distance ? value.distance : 1000;
        // assign decay
        this.decay = value.decay ? value.decay : 2;
        // assign position
        this.position = new THREE.Vector3(value.position.x, value.position.y, value.position.z);
        // assign castShadow
        this.castShadow = value.castshadow ? value.castshadow : false;
        // assign shadowFar
        this.shadowFar = value.shadowfar ? value.shadowfar : 500;
        // assign shadowMapSize
        this.shadowMapSize = value.shadowmapsize ? value.shadowmapsize : 512;

        this.light = null;
        this.lightHelper = null;
    }
    //light
    setLight(light) {
        this.light = light;
    }
    //light helper
    setLightHelper(lightHelper) {
        this.lightHelper = lightHelper;
    }
    //update light helper
    updateLightHelper() {
        this.lightHelper.update();
    }
}

export { MyPointLight };