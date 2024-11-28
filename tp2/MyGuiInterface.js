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
        lights.forEach(light => {
            console.log(light);
            const lightFolder = lightsFolder.addFolder(light.name);
            lightFolder.add(light, 'visible').onChange((value) => { light.visible = value; }).name("visible");
            lightFolder.add(light, 'intensity', 0, 1000).onChange((value) => { light.intensity = value; }).name('intensity');
            lightFolder.addColor(light, 'color').onChange((value) => { light.color.set(value); }).name('color');
            lightFolder.add(light, 'castShadow').onChange((value) => { light.castShadow = value; }).name('castShadow');
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