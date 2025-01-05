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
        const axisFolder = this.datgui.addFolder('Axis');
        axisFolder.add(this.contents.axis, 'visible').onChange(() => { this.contents.updateAxis() });
        axisFolder.close();

        const cameraFolder = this.datgui.addFolder('Camera');
        cameraFolder.add(this.app, 'activeCameraName', ['HumanBalloonChoice', 'AiBalloonChoice', 'InitialPositionChoice', 'Start', 'BalloonFirstPerson', 'BalloonThirdPerson', "InitialMenu", 'Perspective']).onChange((value) => { this.app.setActiveCamera(value) }).name("active camera");
        cameraFolder.close();

        const trackFolder = this.datgui.addFolder('Track');
        trackFolder.add(this.contents.track, 'showMesh').onChange(() => { this.contents.track.updateMeshVisibility() });
        trackFolder.add(this.contents.track, 'showLine').onChange(() => { this.contents.track.updateLineVisibility() });
        trackFolder.add(this.contents.track, 'showWireframe').onChange(() => { this.contents.track.updateWireframeVisibility() });
        trackFolder.add(this.contents.track, 'segments', 1, 500, 1).onChange(() => { this.contents.track.updateCurve() });
        trackFolder.add(this.contents.track, 'width', 0.1, 5).onChange(() => { this.contents.track.updateCurve() });
        trackFolder.add(this.contents.track, 'textureRepeatX', 1, 10, 1).onChange(() => { this.contents.track.updateTextureRepeat() });
        trackFolder.add(this.contents.track, 'textureRepeatY', 1, 10, 1).onChange(() => { this.contents.track.updateTextureRepeat() });
        trackFolder.add(this.contents.track, 'closedCurve').onChange(() => { this.contents.updateTrack() });
        trackFolder.close();
    }
}

export { MyGuiInterface };