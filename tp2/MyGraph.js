import * as THREE from 'three';
/**
 *  This class contains the contents of our application
 */
class MyGraph {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app, node) {
        this.app = app;
        this.node = node;
        this.rootid = node.rootid;
        this.rootNode = node[this.rootid];
        this.type = this.rootNode.type;
        this.children = [];

        this.createChildren();
    }

    createChildren() {
        for (const [name, value] of Object.entries(this.rootNode.children)) {
            if (value.type === "noderef") {
                this.children.push(new MyNode(name, value, this.node));
            } else if (value.type === "pointlight") {
                this.children.push(new MyPointLight(name, value));
            }
        }
    }

}

class MyNode {
    constructor(name, value, node) {
        this.name = name;
        this.nodeId = value.nodeId;
        this.node = node;
        this.children = [];
        this.transforms = {};
        this.material = null;
        this.children = [];
        this.coords = {};

        this.createChildren();
    }

    createTransforms(transformsValue) {
        for (let transformValue of transformsValue) {
            if (transformValue.type === "translate") {
                this.transforms.translate = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
            } else if (transformValue.type === "rotate") {
                this.transforms.rotate = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
            } else if (transformValue.type === "scale") {
                this.transforms.scale = new THREE.Vector3(transformValue.amount.x, transformValue.amount.y, transformValue.amount.z);
            }
        }
    }

    createChildren() {
        for (const [name, value] of Object.entries(this.node[this.name])) {
            if (name === "transforms") {
                this.createTransforms(value);
            } else if (name === "materialref") {
                this.material = value.materialId;
            } else if (name === "children") {
                for (const [nameAttr, valueAttr] of Object.entries(value)) {
                    if (valueAttr.type === "noderef") {
                        this.children.push(new MyNode(nameAttr, valueAttr, this.node));
                    } else if (valueAttr.type === "rectangle") {
                        this.coords.xy1 = new THREE.Vector2(valueAttr.xy1.x, valueAttr.xy1.y);
                        this.coords.xy2 = new THREE.Vector2(valueAttr.xy2.x, valueAttr.xy2.y);
                    }
                }
            }
        }
    }
}

class MyPointLight {
    constructor(name, value) {
        this.name = name;
        this.enabled = value.enabled;
        this.color = new THREE.Color(value.color.r, value.color.g, value.color.b);
        this.intensity = value.intensity;
        this.distance = value.distance;
        this.decay = value.decay;
        this.castShadow = value.castShadow;
        this.position = new THREE.Vector3(value.position.x, value.position.y, value.position.z);
    }
}

export { MyGraph };