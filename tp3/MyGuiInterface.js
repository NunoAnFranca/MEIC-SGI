import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui = new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // Option to enable the Axis
        const axisFolder = this.datgui.addFolder('Axis');
        axisFolder.add(this.contents.axis, 'visible').onChange(() => { this.contents.updateAxis() });
        axisFolder.close();

        // Option to enable change the current camera
        const cameraFolder = this.datgui.addFolder('Camera');
        // Lists the possible camerras to change
        cameraFolder.add(this.app, 'activeCameraName', ['BalloonAndInitialPositionChoice', 'Start', 'BalloonFirstPerson', 'BalloonThirdPerson', "InitialMenu", 'Perspective']).onChange((value) => { this.app.setActiveCamera(value) }).name("active camera");
        cameraFolder.close();

        // Options to change the track on the scene
        const trackFolder = this.datgui.addFolder('Track');
        // Toggles the visibility of the mesh
        trackFolder.add(this.contents.track, 'showMesh').onChange(() => { this.contents.track.updateMeshVisibility() });
        // Toggles the visibility of the line
        trackFolder.add(this.contents.track, 'showLine').onChange(() => { this.contents.track.updateLineVisibility() });
        // Toggles the visibility of the wireframe
        trackFolder.add(this.contents.track, 'showWireframe').onChange(() => { this.contents.track.updateWireframeVisibility() });
        // Changes the number of segments
        trackFolder.add(this.contents.track, 'segments', 1, 500, 1).onChange(() => { this.contents.track.updateCurve() });
        // Changes the width
        trackFolder.add(this.contents.track, 'width', 0.1, 5).onChange(() => { this.contents.track.updateCurve() });
        // Changes the textureRepeatX
        trackFolder.add(this.contents.track, 'textureRepeatX', 1, 10, 1).onChange(() => { this.contents.track.updateTextureRepeat() });
        // Changes the textureRepeatY
        trackFolder.add(this.contents.track, 'textureRepeatY', 1, 10, 1).onChange(() => { this.contents.track.updateTextureRepeat() });
        // CLoses the curve
        trackFolder.add(this.contents.track, 'closedCurve').onChange(() => { this.contents.updateTrack() });
        trackFolder.close();
    }
}

export { MyGuiInterface };