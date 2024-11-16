import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyGraph, MyNode, MyPointLight } from './MyGraph.js';
/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
        this.axis = null;

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scenes/demo.json");

        this.backgroundColor = null;
        this.ambientColor = null;
        this.fog = {};

        this.textures = {};
        this.materials = {};
        // this.cameras = [];

        // texture loader
        this.loader = new THREE.TextureLoader();

        // graph loader
        this.graph = null;
        this.graphGroup = new THREE.Group();
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
    }

    /**
     * Called when the scene JSON file load is completed
     * @param {Object} data with the entire scene object
     */
    onSceneLoaded(data) {
        console.info("YASF loaded.")
        this.onAfterSceneLoadedAndBeforeRender(data);
    }

    printYASF(data, indent = '') {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printYASF(data[key], indent + '\t');
            } else {
                console.log(`${indent}${key}: ${data[key]}`);
            }
        }
    }

    createGlobals() {
        this.app.scene.background = new THREE.Color(this.yasf.globals.background.r, this.yasf.globals.background.g, this.yasf.globals.background.b);
        this.ambientLightColor = new THREE.Color(this.yasf.globals.ambient.r, this.yasf.globals.ambient.g, this.yasf.globals.ambient.b);
        this.ambientLight = new THREE.AmbientLight(this.ambientLightColor, this.yasf.globals.ambient.intensity);
        this.app.scene.add(this.ambientLight);
    }

    createFog() {
        this.app.scene.fog = new THREE.Fog(new THREE.Color(this.yasf.fog.color.r, this.yasf.fog.color.g, this.yasf.fog.color.b), this.yasf.fog.near, this.yasf.fog.far);
    }

    createTextures() {
        for (let [name, values] of Object.entries(this.yasf.textures)) {
            if(values.isVideo === false){
                this.textures[name] = this.loader.load(values.filepath);
                this.textures[name].colorSpace = THREE.SRGBColor;
            }
            else{
                const video = document.createElement('video');
                video.src = values.filepath;
                video.loop = true;
                video.muted = true;
                video.play();
                
                this.textures[name] = new THREE.VideoTexture(video);
                this.textures[name].colorSpace = THREE.SRGBColorSpace;
                this.textures[name].minFilter = THREE.LinearFilter;
                this.textures[name].magFilter = THREE.LinearFilter;
            }
        }
    }

    createMaterials() {
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            this.materials[name] = new THREE.MeshPhongMaterial({
                color: new THREE.Color(values.color.r, values.color.g, values.color.b),
                emissive: new THREE.Color(values.emissive.r, values.emissive.g, values.emissive.b),
                specular: new THREE.Color(values.specular.r, values.specular.g, values.specular.b),
                shininess: values.shininess, transparent: values.transparent,
                opacity: values.opacity, map: this.textures[values.textureref],
                side: values.twosided ? THREE.DoubleSide : THREE.FrontSide,
            });
        }
    }

    /*
    createCameras() {
        this.initialCamera = this.yasf.cameras.initial;
        for (let [name, values] of Object.entries(this.yasf.cameras)) {
            if (name !== "initial") {
                if (values.type === "perspective") {
                    this.cameras[name] = new THREE.PerspectiveCamera(20, 20, values.near, values.far);
                    this.cameras[name].position.set(values.location.x, values.location.y, values.location.z);
                    this.cameras[name].lookAt(values.target.x, values.target.y, values.target.z);
                    this.app.cameras[name] = this.cameras[name];
                } else if (values.type === "orthographic") {
                
                }
            }
        }
        this.app.camera = this.cameras[this.yasf.globals.camera];
    }
    */

    createSkybox() {
        const skyboxGeometry = new THREE.BoxGeometry(this.yasf.skybox.size.x, this.yasf.skybox.size.y, this.yasf.skybox.size.z);
        const skyBoxMaterials = [
            this.materials[this.yasf.skybox.right],
            this.materials[this.yasf.skybox.left],
            this.materials[this.yasf.skybox.up],
            this.materials[this.yasf.skybox.down],
            this.materials[this.yasf.skybox.back],
            this.materials[this.yasf.skybox.front],
        ]
        const skybox = new THREE.Mesh(skyboxGeometry, skyBoxMaterials);
        this.app.scene.add(skybox);
    }

    transforms(object, group) {
        for (const [key, value] of Object.entries(object.transforms)) {
            if (key === "translate") {
                group.position.set(value.x, value.y, value.z);
            } else if (key === "rotate") {
                group.rotation.set(value.x * Math.PI / 180, value.y * Math.PI / 180, value.z * Math.PI / 180);
            } else if (key === "scale") {
                group.scale.set(value.x, value.y, value.z);
            }
        }
    }

    createPointLight(object) {
        const pointLight = new THREE.PointLight(object.color, object.intensity, object.distance, object.decay);
        pointLight.castShadow = object.castShadow;
        pointLight.position.set(object.position.x, object.position.y, object.position.z);
        this.app.scene.add(pointLight);

        // helper
        const pointLightHelper = new THREE.PointLightHelper(pointLight);
        this.app.scene.add(pointLightHelper);
    }

    createRectangle(object){
        const rectangle = new THREE.PlaneGeometry(object.coords.xy2.x - object.coords.xy1.x, object.coords.xy2.y - object.coords.xy1.y);
        const rectangleMesh = new THREE.Mesh(rectangle, this.materials[object.material]);
        this.transforms(object, rectangleMesh);

        return rectangleMesh;
    }

    createTriangle(object){
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0.0,  1.0, 0.0,  // Vertex 1
           -1.0, -1.0, 0.0,  // Vertex 2
            1.0, -1.0, 0.0   // Vertex 3
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
        console.log(object);
        const triangle = new THREE.Triangle((object.coords.xyz1.x,object.coords.xyz1.y,object.coords.xyz1.z), object.coords.xyz2, object.coords.xyz3);
        const triangleMesh = new THREE.Mesh(geometry, this.materials[object.material]);
        this.transforms(object, triangleMesh);
        
        return triangleMesh;
    }
    
    createGraph(nodes, group) {
        for (let [_, object] of Object.entries(nodes.children)) {
            if (object instanceof MyNode) {
                if (object.children.length === 0) {
                    let addObject = null;
                    if (object.objectType === "rectangle"){
                        addObject = this.createRectangle(object);
                    }
                    else if(object.objectType === "triangle"){
                        addObject = this.createTriangle(object);
                    }
                    group.add(addObject);

                } else {
                    let temp = new THREE.Group();
                    this.createGraph(object, temp);
                    this.transforms(object, temp);
                    group.add(temp);
                }
            } else if (object instanceof MyPointLight) {
                this.createPointLight(object);
            }
        }
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        this.yasf = data.yasf;
        this.graph = new MyGraph(this.app, this.yasf.graph);

        this.createGlobals();
        this.createFog();
        this.createTextures();
        this.createMaterials();
        this.createSkybox();
        this.createGraph(this.graph, this.graphGroup);

        this.app.scene.add(this.graphGroup);
    }

    update() {
    }
}

export { MyContents };
