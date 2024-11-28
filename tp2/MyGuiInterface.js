import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    setCamerasAndLightsInterface(cameras, lights) {

        // Cameras folder
        const camerasFolder = this.datgui.addFolder('Cameras');
        camerasFolder.add(this.app, 'activeCameraName', cameras).onChange((value) => { this.app.setActiveCamera(value); }).name('active');
        camerasFolder.open();

        // Lights folder
        const lightsFolder = this.datgui.addFolder('Lights');
        lights.forEach(object => {
            const light = object.light;
            const lightHelper = object.lightHelper;

            const updateShadowCamera = () => {
                light.shadow.camera.updateProjectionMatrix();
            };

            const lightFolder = lightsFolder.addFolder(light.name);
            
            lightFolder.add(light, 'visible').onChange((value) => { light.visible = value; }).name("visible");
            lightFolder.add(lightHelper, 'visible').onChange((value) => { lightHelper.visible = value; }).name("helper");
            lightFolder.addColor(light, 'color').onChange((value) => { light.color.set(value); }).name('color');
            lightFolder.add(light, 'intensity', 0, 1000).onChange((value) => { light.intensity = value; }).name('intensity');

            if (light.type === "PointLight" || light.type === "SpotLight") {
                lightFolder.add(light, 'distance', 1, 100).onChange(() => { object.updateLightHelper(); }).name('distance');
                lightFolder.add(light, 'decay', 0, 5).onChange((value) => { light.decay = value; }).name('decay');

                // shadows
                const shadowsFolder = lightFolder.addFolder('shadows');
                shadowsFolder.add(light, 'castShadow').onChange((value) => { light.castShadow = value; }).name('castShadow');
                shadowsFolder.add(light.shadow.mapSize, 'width', 0, 2048).onChange((value) => { light.shadow.mapSize.width = value; light.shadow.mapSize.height = value; }).name('mapSize');
                shadowsFolder.add(light.shadow.camera, 'far', 0, 1000).onChange((value) => { light.shadow.camera.far = value; updateShadowCamera(); }).name('camera.far');
                shadowsFolder.close();
            }

            // positions
            const positionFolder = lightFolder.addFolder('position');
            positionFolder.add(light.position, 'x', -30, 30).onChange((value) => { light.position.x = value; }).name('x');
            positionFolder.add(light.position, 'y', 0, 70).onChange((value) => { light.position.y = value; }).name('y');
            positionFolder.add(light.position, 'z', -30, 30).onChange((value) => { light.position.z = value; }).name('z');
            positionFolder.close();

            if (light.type === "SpotLight") {
                lightFolder.add(light, 'angle', 0, Math.PI).onChange(() => {
                    object.updateLightHelper();
                }).name('angle');
                lightFolder.add(light, 'penumbra', 0, 1).onChange((value) => { light.penumbra = value; }).name('penumbra');
                // targets
                const targetFolder = lightFolder.addFolder('target');
                targetFolder.add(light.target.position, 'x', -30, 30).onChange(() => { object.updateLightHelper(); }).name('x');
                targetFolder.add(light.target.position, 'y', 0, 70).onChange(() => { object.updateLightHelper(); }).name('y');
                targetFolder.add(light.target.position, 'z', -30, 30).onChange(() => { object.updateLightHelper(); }).name('z');
                targetFolder.close();
            } else if (light.type === "DirectionalLight") {
                // shadows
                const shadowsFolder = lightFolder.addFolder('shadows');
                shadowsFolder.add(light, 'castShadow').onChange((value) => { light.castShadow = value; }).name('castShadow');
                shadowsFolder.add(light.shadow.mapSize, 'width', 0, 2048).onChange((value) => { light.shadow.mapSize.width = value; light.shadow.mapSize.height = value; updateShadowCamera(); }).name('mapSize');
                shadowsFolder.add(light.shadow.camera, 'left', -25, 25).onChange((value) => { light.shadow.camera.left = value; updateShadowCamera(); }).name('camera.left');
                shadowsFolder.add(light.shadow.camera, 'right', -25, 25).onChange((value) => { light.shadow.camera.right = value; updateShadowCamera(); }).name('camera.right');
                shadowsFolder.add(light.shadow.camera, 'top', -25, 25).onChange((value) => { light.shadow.camera.top = value; updateShadowCamera(); }).name('camera.top');
                shadowsFolder.add(light.shadow.camera, 'bottom', -25, 25).onChange((value) => { light.shadow.camera.bottom = value; updateShadowCamera(); }).name('camera.bottom');
                shadowsFolder.add(light.shadow.camera, 'far', 0, 1000).onChange((value) => { light.shadow.camera.far = value; updateShadowCamera(); }).name('camera.far');
                shadowsFolder.close();
            }

            lightFolder.close();
        });
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // Axis folder
        const axisFolder = this.datgui.addFolder('Axis');
        axisFolder.add(this.contents, 'axisVisible').onChange((value) => { this.contents.toggleAxis(value); }).name('visible');
        axisFolder.open();
    }
}

export { MyGuiInterface };