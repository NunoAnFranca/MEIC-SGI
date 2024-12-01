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

const PRIMITIVES = [
    "box",
    "cylinder",
    "nurbs",
    "polygon",
    "rectangle",
    "sphere",
    "triangle"
];

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
        this.name = name;
        this.node = node;
        this.material = material;
        this.castshadows = castshadows;
        this.receiveshadows = receiveshadows;
        this.lods = [];
        this.children = [];
        this.transforms = {};

        this.createChildren();
    }

    createTransforms(transformsValue) {
        for (let transformValue of transformsValue) {
            switch (transformValue.type) {
                case "translate":
                    this.transforms.translate = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
                    break;
                case "rotate":
                    this.transforms.rotate = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
                    break;
                case "scale":
                    this.transforms.scale = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
                    break;
                default:
                    console.warn(`Unknown transform type: ${transformValue.type}`);
            }
        }
    }

    createChildren() {
        for (const [name, value] of Object.entries(this.node[this.name])) {
            let primitiveCount = 0;
            if (name === "transforms") {
                this.createTransforms(value);
            } else if (name === "materialref") {
                this.material = value.materialId;
            } else if (name === "castshadows" && value) {
                this.castshadows = value;
            } else if (name === "receiveshadows" && value) {
                this.receiveshadows = value;
            } else if (name === "children") {
                for (const [name, valueAttr] of Object.entries(value)) {
                    if (PRIMITIVES.includes(valueAttr.type)) {
                        primitiveCount++;
                        if (primitiveCount > 1) {
                            console.error("Only one primitive per node is allowed");
                            continue;
                        }
                    }
                    if (name === "nodesList") {
                        for(let i in valueAttr){
                            this.children.push(new MyNode(valueAttr[i], this.node, this.material, this.castshadows, this.receiveshadows));
                        }
                    } 
                    //else if (name === "lodsList") {
                    //    for(let i in valueAttr){
                    //        this.children.push(new MyNode(valueAttr[i], this.node, this.material, this.castshadows, this.receiveshadows));
                    //    }
                    //} 
                    //else if(valueAttr === "lodNodes"){
                    //    console.log(valueAttr);
                    //}
                    else if (valueAttr.type === "pointlight") {
                        this.children.push(new MyPointLight(name, valueAttr));
                    } else if (valueAttr.type === "spotlight") {
                        this.children.push(new MySpotLight(name, valueAttr));
                    } else if (valueAttr.type === "directionallight") {
                        this.children.push(new MyDirectionalLight(name, valueAttr));
                    } else if (PRIMITIVE_CLASSES[valueAttr.type]) {
                        this.children.push(new PRIMITIVE_CLASSES[valueAttr.type](valueAttr, [this.transforms, this.material, this.castshadows, this.receiveshadows]));
                    } else {
                        console.warn(`Unknown node type: ${valueAttr.type}`);
                    }
                }
            }
        }
    }
}

export { MyNode };