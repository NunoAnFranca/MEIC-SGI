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
            'diffuse color': this.contents.room.diffuseFloorColor,
            'specular color': this.contents.room.specularFloorColor,
        };

        const data2 = {  
            'diffuse color': this.contents.room.diffuseWallColor,
            'specular color': this.contents.room.specularWallColor,
        };

        
        // adds a folder to the gui interface for the floor
        const floorWallsFolder = this.datgui.addFolder( 'Floor / Walls' );
        floorWallsFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.room.updatediffuseFloorColor(value) } ).name('Floor diffuse color');
        floorWallsFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.room.updatespecularFloorColor(value) } ).name('Floor specular color');
        floorWallsFolder.add(this.contents.room, 'floorShininess', 0, 1000).onChange( (value) => { this.contents.room.updateFloorShininess(value) } ).name('Floor Shininess');
        //Walls
        floorWallsFolder.addColor( data2, 'diffuse color' ).onChange( (value) => { this.contents.room.updatediffuseWallColor(value) } ).name('Walls diffuse color');
        floorWallsFolder.addColor( data2, 'specular color' ).onChange( (value) => { this.contents.room.updatespecularWallColor(value) } ).name('Walls specular color');
        floorWallsFolder.add(this.contents.room, 'wallShininess', 0, 1000).onChange( (value) => { this.contents.room.updateWallShininess(value) } ).name('Walls Shininess');
        floorWallsFolder.open();

        // Adds a folder to the gui interface for some objects in the scene
        const tableFolder = this.datgui.addFolder('Scene');
        tableFolder.add(this.contents, 'tableEnabled').onChange((value) => { this.contents.updateTable(value); }).name('Table visible');
        tableFolder.add({ 'Show Couch': true }, 'Show Couch').onChange((value) => { this.contents.couch.toggleCouch(value); }).name('Couch visible');
        tableFolder.add({couchRotationY: Math.PI/6}, 'couchRotationY', 0, 2*Math.PI).onChange(value => {this.contents.couch.CouchRotationY(value);}).name('Couch rotation Y');        
        tableFolder.add({ 'Show Chairs': true }, 'Show Chairs').onChange((value) => {this.contents.chair.toggleChairs(value);}).name('Chairs visible');
        tableFolder.add({ 'Show Radio': true }, 'Show Radio').onChange((value) => {this.contents.radio.toggleRadio(value);}).name('Radio visible');
        tableFolder.add({radioRotation: 0}, 'radioRotation', 0, 2*Math.PI).onChange(value => {this.contents.radio.RadioRotationY(value);}).name('Radio rotation Y');        
        tableFolder.open();

        // Axis for the gui interface
        const axisFolder = this.datgui.addFolder('Axis');
        axisFolder.add(this.contents, 'axisVisible').onChange((value) => { this.contents.toggleAxis(value); }).name('visible');
        axisFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera');
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective1', 'Perspective2', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera");
        cameraFolder.open();

        // adds a folder to the gui interface for the Lights
        const LightsFolder = this.datgui.addFolder('Lights');

        // Interface for Cake Spotlight
        const SpotCakeFolder = LightsFolder.addFolder('Spotlight Cake');
        SpotCakeFolder.add(this.contents.spotCake.spotLight, 'visible').name("Spotlight Cake");
        SpotCakeFolder.add(this.contents.spotCake.spotLight, 'intensity', 0, 100).name("Intensity (cd)");
        SpotCakeFolder.add(this.contents.spotCake.spotLight, 'distance', 0, 16).name("Distance").onChange(() => {
            this.contents.spotCake.updateSpotLightHelper();
        });
        SpotCakeFolder.add(this.contents.spotCake.spotLight, 'angle', 0, Math.PI/2).name("Spot angle").onChange(() => {
            this.contents.spotCake.updateSpotLightHelper();
        });
        SpotCakeFolder.add(this.contents.spotCake.spotLight, 'penumbra', 0, 1).name("Penumbra");
        SpotCakeFolder.add(this.contents.spotCake.spotLight, 'decay', 0, 2).name("Decay");
        SpotCakeFolder.add({ 'Show Helper': false }, 'Show Helper').onChange((value) => { this.contents.spotCake.toggleSpotLightHelpers(value); }).name('visible');
        SpotCakeFolder.close();

        // Interface for Students Spotlights
        const spotLightFolder = LightsFolder.addFolder('Spotlights Students');
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

        // adds a folder to the gui interface for the Spring guy
        const SpringGuyFolder = this.datgui.addFolder('Spring Guy');
        SpringGuyFolder.add({springGuyScale: 0.75}, 'springGuyScale', 0.1, 5.0).name('Spring Guy Scale').onChange(value => {this.contents.springGuy.SpringGuyScale(value);});        
        SpringGuyFolder.add({ 'Show Spring Guy Legs': true }, 'Show Spring Guy Legs').onChange((value) => { this.contents.springGuy.toggleSpringGuy(this.contents.springGuy.SpringGuyLegs, value); }).name('Show Spring Guy Legs');
        SpringGuyFolder.add({ 'Show Spring Guy Body': true }, 'Show Spring Guy Body').onChange((value) => { this.contents.springGuy.toggleSpringGuy(this.contents.springGuy.SpringGuyBody, value); }).name('Show Spring Guy Body');
        SpringGuyFolder.add({ 'Show Spring Guy Head': true }, 'Show Spring Guy Head').onChange((value) => { this.contents.springGuy.toggleSpringGuy(this.contents.springGuy.SpringGuyHead, value); }).name('Show Spring Guy Head');
        SpringGuyFolder.add({ 'Show Gifts': true }, 'Show Gifts').onChange((value) => { this.contents.springGuy.toggleSpringGuy(this.contents.springGuy.presents, value); }).name('Show Gifts');
        SpringGuyFolder.open();
    }
        
}

export { MyGuiInterface };
