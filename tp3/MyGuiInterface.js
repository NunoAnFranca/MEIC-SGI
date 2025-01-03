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
        cameraFolder.add(this.app, 'activeCameraName', [ 'BalloonChoice', 'Perspective', 'BalloonFirstPerson', 'BalloonThirdPerson', "InitialMenu" ] ).onChange((value) =>  { this.app.setActiveCamera(value) }).name("active camera");
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

        const boundingBoxFolder = this.datgui.addFolder('Bounding Box');
        const humanBalloonsFolder = boundingBoxFolder.addFolder('Human Balloons');
        Object.entries(this.contents.humanBalloons).forEach(([id, humanBalloon], index) => {
            humanBalloonsFolder.add(humanBalloon, 'showBoundingBox').onChange(() => { this.contents.updateBoundingBox(id, "HUMAN") }).name(`Human Balloon ${index + 1}`);
        });
        humanBalloonsFolder.close();
        const aiBalloonsFolder = boundingBoxFolder.addFolder('AI Balloons');
        Object.entries(this.contents.aiBalloons).forEach(([id, aiBalloon], index) => {
            aiBalloonsFolder.add(aiBalloon, 'showBoundingBox').onChange(() => { this.contents.updateBoundingBox(id, "AI") }).name(`AI Balloon ${index + 1}`);
        });
        aiBalloonsFolder.close();
        boundingBoxFolder.close();
    }
}

export { MyGuiInterface };