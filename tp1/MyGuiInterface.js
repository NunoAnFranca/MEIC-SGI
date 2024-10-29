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

        const SubFolder = LightsFolder.addFolder('Spotlight Cake');
        SubFolder.add(this.contents.spotLight, 'intensity', 0, 40).name("Intensity (cd)");
        SubFolder.add(this.contents.spotLight, 'distance', 0, 20).name("Distance");
        SubFolder.add(this.contents.spotLight, 'angle', 0, Math.PI/2).name("Spot angle");
        SubFolder.add(this.contents.spotLight, 'penumbra', 0, 1).name("Penumbra");
        SubFolder.add(this.contents.spotLight, 'decay', 0, 2).name("Decay");
        SubFolder.open();

        // Interface for Students Spotlights
        const spotLightFolder = this.datgui.addFolder('Spotlights Students');
        spotLightFolder.add(this.contents.spotStudent.spotLights[0], 'visible').name("Spotlight Stu0");
        spotLightFolder.add(this.contents.spotStudent.spotLights[0], 'distance', 0.1, 100).name("Distance Stu0").onChange(() => {
            this.contents.spotStudent.updateSpotLightHelper();
        });
        spotLightFolder.add(this.contents.spotStudent.spotLights[0], 'intensity', 1, 1000).name("Intensity Stu0");
        spotLightFolder.add(this.contents.spotStudent.spotLights[0], 'angle', 0, Math.PI/2).name("Angle Stu0").onChange(() => {
            this.contents.spotStudent.updateSpotLightHelper();
        });
        spotLightFolder.add(this.contents.spotStudent.spotLights[0], 'penumbra', 0, 1).name("Penumbra Stu0");
        spotLightFolder.add(this.contents.spotStudent.spotLights[0], 'decay', 0, 5).name("Decay Stu0");
        spotLightFolder.add(this.contents.spotStudent.spotLights[1], 'visible').name("Spotlight Stu1");
        spotLightFolder.add(this.contents.spotStudent.spotLights[1], 'distance', 1, 100).name("Distance Stu1").onChange(() => {
            this.contents.spotStudent.updateSpotLightHelper();
        });
        spotLightFolder.add(this.contents.spotStudent.spotLights[1], 'intensity', 1, 1000).name("Intensity Stu1");
        spotLightFolder.add(this.contents.spotStudent.spotLights[1], 'angle', 0, Math.PI/2).name("Angle Stu1").onChange(() => {
            this.contents.spotStudent.updateSpotLightHelper();
        });
        spotLightFolder.add(this.contents.spotStudent.spotLights[1], 'penumbra', 0, 1).name("Penumbra Stu1");
        spotLightFolder.add(this.contents.spotStudent.spotLights[1], 'decay', 0, 5).name("Decay Stu1");
        spotLightFolder.add({ 'Show Helpers': false }, 'Show Helpers').onChange((value) => {this.contents.spotStudent.toggleSpotLightHelpers(value);});
        spotLightFolder.close();
    }
}

export { MyGuiInterface };
