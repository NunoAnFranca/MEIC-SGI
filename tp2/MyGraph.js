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
    constructor(name, value, node, material) {
        this.name = name;
        this.nodeId = value.nodeId;
        this.node = node;
        this.children = [];
        this.transforms = {};
        this.material = material;
        this.children = [];
        this.coords = {};
        this.objectType = null;

        this.parts_x = null;
        this.parts_y = null;
        this.parts_z = null;

        //cylinder/sphere values
        this.base = null;
        this.top = null;
        this.height = null;
        this.slices = null;
        this.stacks = null;
        this.capsclose = null;
        this.thetastart = null;
        this.thetalength = null;

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
                        this.children.push(new MyNode(nameAttr, valueAttr, this.node, this.material));
                    } else if (valueAttr.type === "rectangle") {
                        this.objectType = valueAttr.type;

                        this.coords.xy1 = new THREE.Vector2(valueAttr.xy1.x, valueAttr.xy1.y);
                        this.coords.xy2 = new THREE.Vector2(valueAttr.xy2.x, valueAttr.xy2.y);

                        this.parts_x = valueAttr.parts_x;
                        this.parts_y = valueAttr.parts_y;

                    } else if (valueAttr.type === "triangle") {
                        this.objectType = valueAttr.type;

                        this.coords.xyz1 = new THREE.Vector3(valueAttr.xyz1.x, valueAttr.xyz1.y, valueAttr.xyz1.z);
                        this.coords.xyz2 = new THREE.Vector3(valueAttr.xyz2.x, valueAttr.xyz2.y, valueAttr.xyz2.z);
                        this.coords.xyz3 = new THREE.Vector3(valueAttr.xyz3.x, valueAttr.xyz3.y, valueAttr.xyz3.z);

                    } else if (valueAttr.type === "box") {
                        this.objectType = valueAttr.type;

                        this.coords.xyz1 = new THREE.Vector3(valueAttr.xyz1.x, valueAttr.xyz1.y, valueAttr.xyz1.z);
                        this.coords.xyz2 = new THREE.Vector3(valueAttr.xyz2.x, valueAttr.xyz2.y, valueAttr.xyz2.z);

                        this.parts_x = valueAttr.parts_x;
                        this.parts_y = valueAttr.parts_y;
                        this.parts_z = valueAttr.parts_z;
                        
                    } else if (valueAttr.type === "cylinder") {
                        this.objectType = valueAttr.type;

                        this.base = valueAttr.base;
                        this.top = valueAttr.top;
                        this.height = valueAttr.height;
                        this.slices = valueAttr.slices;
                        this.stacks = valueAttr.stacks;
                        this.capsclose = valueAttr.capsclose;
                        this.thetastart = valueAttr.thetastart;
                        this.thetalength = valueAttr.thetalength;

                    } else if (valueAttr.type === "sphere") {
                        this.objectType = valueAttr.type;

                        this.radius = valueAttr.radius;
                        this.slices = valueAttr.slices;
                        this.stacks = valueAttr.stacks;
                        this.thetastart = valueAttr.thetastart;
                        this.thetalength = valueAttr.thetaLength;
                        this.phistart = valueAttr.phistart;
                        this.philength = valueAttr.philength;
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

export { MyPointLight };
export { MyNode };
export { MyGraph };