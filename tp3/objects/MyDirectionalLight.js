import * as THREE from 'three';

// Class for Directional light
class MyDirectionalLight {
    constructor(name, value) {
        // assign type
        this.type = "DirectionalLight";
        // assign name
        this.name = name;
        this.enabled = value.enabled === false ? false : true;
        // assign color
        this.color = new THREE.Color(value.color.r, value.color.g, value.color.b);
        // assign intensity
        this.intensity = value.intensity ? value.intensity : 1;
        // assign position
        this.position = new THREE.Vector3(value.position.x, value.position.y, value.position.z);
        // assign castShadow
        this.castShadow = value.castshadow ? value.castshadow : false;
        // assign shadowLeft
        this.shadowLeft = value.shadowleft ? value.shadowleft : -5;
        // assign shadowRight
        this.shadowRight = value.shadowright ? value.shadowright : 5;
        // assign shadowBottom
        this.shadowBottom = value.shadowbottom ? value.shadowbottom : -5;
        // assign shadowTop
        this.shadowTop = value.shadowtop ? value.shadowtop : 5;
        // assign shadowTop
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

export { MyDirectionalLight };