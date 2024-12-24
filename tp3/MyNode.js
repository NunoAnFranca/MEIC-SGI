import * as THREE from 'three';

import { MyPointLight } from './objects/MyPointLight.js';
import { MySpotLight } from './objects/MySpotLight.js';
import { MyDirectionalLight } from './objects/MyDirectionalLight.js';

import { MyBox } from './objects/primitives/MyBox.js';
import { MyCylinder } from './objects/primitives/MyCylinder.js';
import { MyNurbs } from './objects/primitives/MyNurbs.js';
import { MyPolygon } from './objects/primitives/MyPolygon.js';
import { MyRectangle } from './objects/primitives/MyRectangle.js';
import { MySphere } from './objects/primitives/MySphere.js';
import { MyTriangle } from './objects/primitives/MyTriangle.js';

// Define a list of supported primitive types for validation.
const PRIMITIVES = [
    "box",
    "cylinder",
    "nurbs",
    "polygon",
    "rectangle",
    "sphere",
    "triangle"
];

// Assigne the list of primitive types to their respective classes.
const PRIMITIVE_CLASSES = {
    "box": MyBox,
    "cylinder": MyCylinder,
    "nurbs": MyNurbs,
    "polygon": MyPolygon,
    "rectangle": MyRectangle,
    "sphere": MySphere,
    "triangle": MyTriangle
};

class MyNode {
    constructor(name, node, material, castshadows, receiveshadows) {
        // Initialize the MyNode class with name, node data, material, and shadow properties.
        this.name = name;
        this.node = node;
        this.material = material;
        this.castshadows = castshadows;
        this.receiveshadows = receiveshadows;
        // Array for levels of detail (LODs).
        this.lods = [];
        // Array for children nodes.
        this.children = [];
        // Array for transform nodes.
        this.transforms = {};

        //Call createChildren() function
        this.createChildren();
    }

    // Method to create and store transformation data
    createTransforms(transformsValue) {
        // Iterate through each transform object
        for (let transformValue of transformsValue) {
            switch (transformValue.type) {
                case "translate":
                    // Create a translation vector if translate
                    this.transforms.translate = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
                    break;
                case "rotate":
                    // Create a rotate vector if rotate
                    this.transforms.rotate = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
                    break;
                case "scale":
                    // Create a scale vector if scale
                    this.transforms.scale = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
                    break;
                default:
                    // Check for unkwon transform type
                    console.warn(`Unknown transform type: ${transformValue.type}`);
            }
        }
    }

    // Method to create and store children data
    createChildren() {
        // Iterate over each key-value pair in the node data
        for (const [name, value] of Object.entries(this.node[this.name])) {
            // Counter to check number of direct primitives
            let primitiveCount = 0;
            if (name === "transforms") {
                // Handle transformation
                this.createTransforms(value);
            } else if (name === "materialref") {
                // Handle material
                this.material = value.materialId;
            } else if (name === "castshadows" && value) {
                // Handle cast shadows
                this.castshadows = value;
            } else if (name === "receiveshadows" && value) {
                // Handle receive shadows
                this.receiveshadows = value;
            } else if (name === "children") {
                // Process child nodes
                for (const [name, valueAttr] of Object.entries(value)) {
                    if (PRIMITIVES.includes(valueAttr.type)) {
                        // Check if node is a supported primitive
                        primitiveCount++;
                        if (primitiveCount > 1) {
                            // Print error message 
                            console.error("Only one primitive per node is allowed");
                            continue;
                        }
                    }
                    if (name === "nodesList") {
                        // Handle nodeslist
                        for (let i in valueAttr) {
                            // Push every element in te nodeslist to children
                            this.children.push(new MyNode(valueAttr[i], this.node, this.material, this.castshadows, this.receiveshadows));
                        }
                    } 
                    else if (valueAttr.type === "pointlight") {
                        // Push pointlight to children
                        this.children.push(new MyPointLight(name, valueAttr));
                    } else if (valueAttr.type === "spotlight") {
                        // Push spotlight to children
                        this.children.push(new MySpotLight(name, valueAttr));
                    } else if (valueAttr.type === "directionallight") {
                        // Push directionallight to children
                        this.children.push(new MyDirectionalLight(name, valueAttr));
                    } else if (PRIMITIVE_CLASSES[valueAttr.type]) {
                        // Push directionallight to children
                        this.children.push(new PRIMITIVE_CLASSES[valueAttr.type](valueAttr, [this.transforms, this.material, this.castshadows, this.receiveshadows]));
                    } else {
                        // Error unknown node
                        console.warn(`Unknown node type: ${valueAttr.type}`);
                    }
                }
            }
        }
    }
}

export { MyNode };