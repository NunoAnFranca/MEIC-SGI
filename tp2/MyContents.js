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
        this.reader.open("scenes/demo/demo.json");

        this.backgroundColor = null;
        this.ambientColor = null;
        this.fog = {};

        this.textures = {};
        this.materials = {};
        this.cameras = {};
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
        console.log(this.fog)
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

    onAfterSceneLoadedAndBeforeRender(data) {
        const YASF = data.yasf
        this.readGlobals(YASF.globals);
        this.readFog(YASF.fog);
        this.readTextures(YASF.textures);
        this.readMaterials(YASF.materials);
        this.readCameras(YASF.cameras);
    }

    update() {
    }
}

export { MyContents };
