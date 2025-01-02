
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { MyMinimap } from './MyMinimap.js';
import Stats from 'three/addons/libs/stats.module.js'

/**
 * This class contains the application object
 */
class MyApp {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.miniScene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null
        this.cameras = []
        this.frustumSize = 20

        // other attributes
        this.renderer = null
        this.controls = null
        this.gui = null
        this.axis = null
        this.contents = null
    }
    /**
     * initializes the application
     */
    init() {
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.minimap = new MyMinimap();
        this.initCameras();
        this.minimap.initMinimapCamera();
        this.minimap.initMinimapRenderer();
        this.setActiveCamera('InitialMenu');

        this.minimap.createMinimap();

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor("#000000");

        // Configure renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false);
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Create a basic perspective camera
        const perspective1 = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
        perspective1.position.set(0, 75, 0)
        this.cameras['Perspective'] = perspective1

        // create a balloon perspective camera
        const balloonFirstPerson = new THREE.PerspectiveCamera(100, aspect, 0.1, 1000)
        balloonFirstPerson.position.set(0, 0, 0)
        balloonFirstPerson.target = new THREE.Vector3(0, 0, 0)
        balloonFirstPerson.lookAt(balloonFirstPerson.target)
        this.cameras['BalloonFirstPerson'] = balloonFirstPerson

        // create a balloon perspective camera
        const balloonThirdPerson = new THREE.PerspectiveCamera(100, aspect, 0.1, 1000)
        balloonThirdPerson.position.set(0, 0, 0)
        balloonThirdPerson.target = new THREE.Vector3(0, 0, 0)
        balloonThirdPerson.lookAt(balloonThirdPerson.target)
        this.cameras['BalloonThirdPerson'] = balloonThirdPerson
        
        //create a initial menu perspective camera
        const initMenu = new THREE.PerspectiveCamera(90, aspect, 0.1, 1000);
        initMenu.position.set(-56.911910092428265,18.53264621864038,-83.07926277580806);
        initMenu.target =  new THREE.Vector3(-71.5,18.53264621864038,-91.50558);
        initMenu.lookAt(initMenu.target);
        this.cameras['InitialMenu'] = initMenu;
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {
        if (cameraName === 'BalloonFirstPerson' || cameraName === 'BalloonThirdPerson') {
            this.contents.setCamera(cameraName);
        }

        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName]
    }

    getActiveCamera() {
        return this.cameras[this.activeCameraName]
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {

        // camera changed? 
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName

            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
                this.controls.enableZoom = true;
                this.controls.update();
                this.updateCameraMenu();
            } else {
                this.controls.object = this.activeCamera;
                this.updateCameraMenu();
            }
        }
    }

    updateCameraTarget() {
        if (this.activeCameraName === 'BalloonFirstPerson' || this.activeCameraName === 'BalloonThirdPerson') {
            this.controls.target.copy(this.activeCamera.target);
            this.controls.update();
        }
    }

    updateCameraMenu() {
        if (this.activeCameraName === 'InitialMenu') {
            this.controls.target.copy(this.activeCamera.target);
            this.controls.update();
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }



    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;

        //get mouse position
        window.addEventListener('pointermove', this.onPointerMove)
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {
        this.gui = gui
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render() {
        this.stats.begin();
        this.updateCameraIfRequired();
    
        // Update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update();
        }
    
        // Update player position for minimap (assuming player is in this.contents)
        this.updateMinimap();
        // Update the controls for the main camera
        this.controls.update();
    
        // Render the main scene
        this.renderer.render(this.scene, this.activeCamera);
    
        // Render the minimap scene
        this.minimap.minimapRenderer.render(this.minimap.miniScene, this.minimap.minimapCamera);
    
        // Call the next frame
        requestAnimationFrame(this.render.bind(this));
    
        this.stats.end();
    }

    updateMinimap() {
        if (this.contents && this.contents.player) {
            const player = this.contents.player; // The balloon or player object
            this.minimap.minimapMarker.position.set(0, player.yPos - 3, 0);
        }
    } 
}


export { MyApp };