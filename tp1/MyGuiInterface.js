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
        this.app = app;
        this.datgui =  new GUI();
        this.contents = null;
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const data = {  
            'diffuse color': this.contents.diffuseFloorColor,
            'specular color': this.contents.specularFloorColor,
        };

        // adds a folder to the gui interface for the floor
        const floorFolder = this.datgui.addFolder( 'Floor' );
        floorFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updatediffuseFloorColor(value) } );
        floorFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updatespecularFloorColor(value) } );
        floorFolder.add(this.contents, 'floorShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updateFloorShininess(value) } );
        floorFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera');
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective1', 'Perspective2', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord");
        cameraFolder.open();

        // adds a folder to the gui interface for the Lights
        const LightsFolder = this.datgui.addFolder('Lights');
        LightsFolder.add(this.contents, 'spotLightEnabled', true).name("Spotlight");
        LightsFolder.open();

        const SubFolder = LightsFolder.addFolder('Spotlight Settings');
        //SubFolder.add(this.contents.spotLight, 'color').name("Color");
        SubFolder.add(this.contents.spotLight, 'intensity', 0, 40).name("Intensity (cd)");
        SubFolder.add(this.contents.spotLight, 'distance', 0, 20).name("Distance");
        SubFolder.add(this.contents.spotLight, 'angle', 0, Math.PI/2).name("Spot angle");
        SubFolder.add(this.contents.spotLight, 'penumbra', 0, 1).name("Penumbra");
        SubFolder.add(this.contents.spotLight, 'decay', 0, 2).name("Decay");
        SubFolder.add(this.contents.spotLight.position, 'x', -12.5, 12.5).name("Position X");
        SubFolder.add(this.contents.spotLight.position, 'y', 0, 20).name("Position Y");
        SubFolder.add(this.contents.spotLight.position, 'z', -12.5, 12.5).name("Position Z");
        SubFolder.add(this.contents.targetSpot.position, 'x', -12.5, 12.5).name("Target X");
        SubFolder.add(this.contents.targetSpot.position, 'y', 0, 20).name("Target Y");
        SubFolder.add(this.contents.targetSpot.position, 'z', -12.5, 12.5).name("Target Z");
        SubFolder.open();
    }
}

export { MyGuiInterface };
