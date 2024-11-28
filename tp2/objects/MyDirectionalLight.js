import * as THREE from 'three';

class MyDirectionalLight {
    constructor(name, value) {
        this.type = "DirectionalLight";
        this.name = name;
        this.enabled = value.enabled === false ? false : true;
        this.color = new THREE.Color(value.color.r, value.color.g, value.color.b);
        this.intensity = value.intensity ? value.intensity : 1;
        this.position = new THREE.Vector3(value.position.x, value.position.y, value.position.z);
        this.castShadow = value.castshadow ? value.castshadow : false;
        this.shadowLeft = value.shadowleft ? value.shadowleft : -5;
        this.shadowRight = value.shadowright ? value.shadowright : 5;
        this.shadowBottom = value.shadowbottom ? value.shadowbottom : -5;
        this.shadowTop = value.shadowtop ? value.shadowtop : 5;
        this.shadowFar = value.shadowfar ? value.shadowfar : 500;
        this.shadowMapSize = value.shadowmapsize ? value.shadowmapsize : 512;

        this.light = null;
        this.lightHelper = null;
    }

    setLight(light) {
        this.light = light;
    }

    setLightHelper(lightHelper) {
        this.lightHelper = lightHelper;
    }

    updateLightHelper() {
        this.lightHelper.update();
    }
}

export { MyDirectionalLight };