import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
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
        this.cameras = {};

        // texture loader
        this.loader = new THREE.TextureLoader();
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

    readGlobals(globals) {
        this.backgroundColor = globals.background;
        this.ambientColor = globals.ambient;
    }

    readFog(fog) {
        for (const [name, values] of Object.entries(fog)) {
            this.fog[name] = values;
        }
    }

    readTextures(textures) {
        for (const [name, values] of Object.entries(textures)) {
            this.textures[name] = values.filepath;
        }
    }

    readMaterials(materials) {
        for (const [name, values] of Object.entries(materials)) {
            this.materials[name] = {};
            for (const [attName, attValues] of Object.entries(values)) {
                this.materials[name][attName] = attValues;
            }
        }
    }

    readCameras(cameras) {
        for (const [name, values] of Object.entries(cameras)) {
            if (name === "initial") {
                this.cameras[name] = values;
            } else {
                this.cameras[name] = {}
                for (const [attName, attValues] of Object.entries(values)) {
                    this.cameras[name][attName] = attValues;
                }
            }
        }
    }

    readGraph(graph) {
        for (const [name, values] of Object.entries(graph)) {
            if (name === "rootid") {
                this.graph[name] = values;
            } else {
                this.graph[name] = {}
                for (const [attName, attValues] of Object.entries(values)) {
                    this.graph[name][attName] = attValues;
                }
            }
        }

        console.log(graph);
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

    createAmbientLight() {
        this.ambientLightColor = new THREE.Color(this.yasf.globals.ambient.r, this.yasf.globals.ambient.g, this.yasf.globals.ambient.b);
        this.ambientLight = new THREE.AmbientLight(this.ambientLightColor);
        this.app.scene.add(this.ambientLight);
    }

    createTextures() {
        for (let [name, values] of Object.entries(this.yasf.textures)) {
            this.textures[name] = this.loader.load(values.filepath);
            this.textures[name].colorSpace = THREE.SRGBColor;
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

    onAfterSceneLoadedAndBeforeRender(data) {
        this.yasf = data.yasf;

        this.createAmbientLight();
        this.createTextures();
        this.createMaterials();

        // test materials and textures loaded
        const rectangle = new THREE.BoxGeometry(2, 2, 2);
        const rectangleMesh = new THREE.Mesh(rectangle, this.materials.tableApp);
        this.app.scene.add(rectangleMesh);

        /*const YASF = data.yasf;
        this.readGlobals(YASF.globals);
        this.readFog(YASF.fog);
        this.readTextures(YASF.textures);
        this.readMaterials(YASF.materials);
        this.readCameras(YASF.cameras);
        this.readGraph(YASF.graph);
        this.globals = YASF.globals;
        this.fog = YASF.fog;
        this.textures = YASF.textures;
        this.materials = YASF.materials;
        this.cameras = YASF.cameras;
        this.graph = YASF.graph;*/
    }

    update() {
    }
}

export { MyContents };
