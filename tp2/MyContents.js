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
        this.cameras = {};

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

    createGraph(nodes, group) {
        for (let [_, object] of Object.entries(nodes.children)) {
            if (object instanceof MyNode) {
                if (object.children.length === 0) {
                    const rectangle = new THREE.PlaneGeometry(object.coords.xy2.x - object.coords.xy1.x, object.coords.xy2.y - object.coords.xy1.y);
                    const rectangleMesh = new THREE.Mesh(rectangle, this.materials[object.material]);
                    this.transforms(object, rectangleMesh);
                    group.add(rectangleMesh);
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

        this.createAmbientLight();
        this.createTextures();
        this.createMaterials();
        this.createGraph(this.graph, this.graphGroup);

        this.app.scene.add(this.graphGroup);
    }

    update() {
    }
}

export { MyContents };
