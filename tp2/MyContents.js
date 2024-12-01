import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyGraph } from './MyGraph.js';
import { MyNode } from './MyNode.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

import { MyPointLight } from './objects/MyPointLight.js';
import { MySpotLight } from './objects/MySpotLight.js';
import { MyDirectionalLight } from './objects/MyDirectionalLight.js';

import { MyBox } from './objects/primitives/MyBox.js';
import { MyCylinder } from './objects/primitives/MyCylinder.js';
import { MyNurbs } from './objects/primitives/MyNurbs.js';
import { MyRectangle } from './objects/primitives/MyRectangle.js';
import { MySphere } from './objects/primitives/MySphere.js';
import { MyPolygon } from './objects/primitives/MyPolygon.js';
import { MyTriangle } from './objects/primitives/MyTriangle.js';

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
        this.axisVisible = false;

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scenes/super_mario.json");

        this.backgroundColor = null;
        this.ambientColor = null;
        this.fog = {};

        this.textures = {};
        this.materials = {};
        this.cameras = [];
        this.lights = [];
        this.wireframes = [];

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
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
            this.axis.visible = this.axisVisible;
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
        this.app.scene.fog = new THREE.Fog(new THREE.Color(this.yasf.globals.fog.color.r, this.yasf.globals.fog.color.g, this.yasf.globals.fog.color.b), this.yasf.globals.fog.near, this.yasf.globals.fog.far);
    }
    
    getTextureType(object, value){
        const textureValues = this.yasf.textures[value];

        if (textureValues.isVideo) {
            const video = document.createElement('video');
            video.src = textureValues.filepath;
            video.loop = true;
            video.muted = true;
            video.play();
            
            object = new THREE.VideoTexture(video);
            object.colorSpace = THREE.SRGBColorSpace;
            object.minFilter = THREE.LinearFilter;
            object.magFilter = THREE.LinearFilter;
        } else {
            object = this.loader.load(textureValues.filepath);
            object.generateMipmaps = false;
            object.repeat.set(1,1);
            object.wrapS = object.wrapT = THREE.RepeatWrapping;
        }
        return object;
    }

    createMaterialsAndTexture() {
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            let texture = null;
            const textureRef = values.textureref;

            let textureBump = null;
            const textureBumpRef = values.bumpref;

            let textureSpecular = null;
            const textureSpecularRef = values.specularref;

            if (textureRef && this.yasf.textures[textureRef]) {
                const textureValues = this.yasf.textures[textureRef];

                if (textureValues.isVideo) {
                    const video = document.createElement('video');
                    video.src = textureValues.filepath;
                    video.loop = true;
                    video.muted = true;
                    video.play();
                    
                    texture = new THREE.VideoTexture(video);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                } else {
                    texture = this.loader.load(textureValues.filepath);

                    texture.generateMipmaps = true;
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.LinearMipMapLinearFilter; 
                    texture.needsUpdate = true;

                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(values.texlength_s || 1, values.texlength_t || 1);
                }
            }

            if (textureBumpRef && this.yasf.textures[textureBumpRef]) {
                textureBump =  this.getTextureType(textureBump,textureBumpRef);
            }

            if (textureSpecularRef && this.yasf.textures[textureSpecularRef]) {
                textureSpecular =  this.getTextureType(textureSpecular,textureSpecularRef);
            }

            this.materials[name] = new THREE.MeshPhongMaterial({
                color: new THREE.Color(values.color.r, values.color.g, values.color.b),
                emissive: new THREE.Color(values.emissive.r, values.emissive.g, values.emissive.b),
                specular: new THREE.Color(values.specular.r, values.specular.g, values.specular.b),
                shininess: values.shininess, transparent: values.transparent,
                opacity: values.opacity, 
                map: texture,
                bumpMap: textureBump,
                bumpScale: values.bumpscale ?? 1.0,
                specularMap: textureSpecular,
                side: values.twosided ? THREE.DoubleSide : THREE.FrontSide
            });
        }
    }

    createCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        this.initialCamera = this.yasf.cameras.initial;
        for (let [name, values] of Object.entries(this.yasf.cameras)) {
            if (name !== "initial") {
                if (values.type === "perspective") {
                    this.cameras[name] = new THREE.PerspectiveCamera(values.angle, aspect, values.near, values.far);
                } else if (values.type === "orthogonal") {
                    this.cameras[name] = new THREE.OrthographicCamera(values.left, values.right, values.top, values.bottom, values.near, values.far);
                }
                this.cameras[name].position.set(values.location.x, values.location.y, values.location.z);
                this.cameras[name].lookAt(new THREE.Vector3(values.target.x, values.target.y, values.target.z));
                this.app.cameras[name] = this.cameras[name];
            } else {
                this.app.setActiveCamera(values);
            }
        }
    }

    createSkybox() {
        const skyboxGeometry = new THREE.BoxGeometry(this.yasf.globals.skybox.size.x, this.yasf.globals.skybox.size.y, this.yasf.globals.skybox.size.z);
        const emissiveColor = new THREE.Color(this.yasf.globals.skybox.emissive.r, this.yasf.globals.skybox.emissive.g, this.yasf.globals.skybox.emissive.b);
        const intensityLevel = this.yasf.globals.skybox.intensity;

        const skyBoxTextures = [
            this.loader.load(this.yasf.globals.skybox.right),
            this.loader.load(this.yasf.globals.skybox.left),
            this.loader.load(this.yasf.globals.skybox.up),
            this.loader.load(this.yasf.globals.skybox.down),
            this.loader.load(this.yasf.globals.skybox.back),
            this.loader.load(this.yasf.globals.skybox.front),
        ];

        skyBoxTextures.forEach(texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
        });

        const skyBoxMaterials = skyBoxTextures.map(texture => 
            new THREE.MeshPhongMaterial({
                emissive: emissiveColor,
                emissiveIntensity: intensityLevel,
                map: texture,
                side: THREE.BackSide
            })
        );

        const skybox = new THREE.Mesh(skyboxGeometry, skyBoxMaterials);
        skybox.translateY(this.yasf.globals.skybox.size.y / 2);
        skybox.position.set(this.yasf.globals.skybox.center.x,this.yasf.globals.skybox.center.y,this.yasf.globals.skybox.center.z);
        skybox.castShadow = true;
        skybox.receiveShadow = true;

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
        pointLight.name = object.name;
        pointLight.visible = object.enabled;
        pointLight.position.set(object.position.x, object.position.y, object.position.z);
        pointLight.castShadow = object.castShadow;

        if (object.castShadow) {
            pointLight.shadow.mapSize.width = object.shadowMapSize;
            pointLight.shadow.mapSize.height = object.shadowMapSize;
            pointLight.shadow.camera.far = object.shadowFar;
            pointLight.shadow.camera.near = 0.5;
        }

        const pointLightHelper = new THREE.PointLightHelper(pointLight);
        pointLightHelper.name = object.name;
        pointLightHelper.visible = false;

        object.setLight(pointLight);
        object.setLightHelper(pointLightHelper);

        this.lights.push(object);

        this.app.scene.add(pointLight);
        this.app.scene.add(pointLightHelper);
    }

    createSpotLight(object) {
        const spotLight = new THREE.SpotLight(object.color, object.intensity, object.distance, object.angle, object.penumbra, object.decay);
        spotLight.name = object.name;
        spotLight.visible = object.enabled;
        spotLight.position.set(object.position.x, object.position.y, object.position.z);
        spotLight.target.position.set(object.target.x, object.target.y, object.target.z);
        spotLight.castShadow = object.castShadow;

        if (object.castShadow) {
            spotLight.shadow.mapSize.width = object.shadowMapSize;
            spotLight.shadow.mapSize.height = object.shadowMapSize;
            spotLight.shadow.camera.far = object.shadowFar;
            spotLight.shadow.camera.near = 0.5;
        }

        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        spotLightHelper.name = object.name;
        spotLightHelper.visible = false;

        object.setLight(spotLight);
        object.setLightHelper(spotLightHelper);

        this.lights.push(object);
        
        this.app.scene.add(spotLight);
        this.app.scene.add(spotLightHelper);
    }

    createDirectionalLight(object) {
        const directionalLight = new THREE.DirectionalLight(object.color, object.intensity);
        directionalLight.name = object.name;
        directionalLight.visible = object.enabled;
        directionalLight.position.set(object.position.x, object.position.y, object.position.z);
        directionalLight.castShadow = object.castShadow;
        
        if (object.castShadow) {    
            directionalLight.shadow.camera.left = object.shadowLeft;
            directionalLight.shadow.camera.right = object.shadowRight;
            directionalLight.shadow.camera.top = object.shadowTop;
            directionalLight.shadow.camera.bottom = object.shadowBottom;
            directionalLight.shadow.camera.far = object.shadowFar;
            directionalLight.shadow.mapSize.width = object.shadowMapSize;
            directionalLight.shadow.mapSize.height = object.shadowMapSize;
        }

        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        directionalLightHelper.name = object.name;
        directionalLightHelper.visible = false;

        object.setLight(directionalLight);
        object.setLightHelper(directionalLightHelper);

        this.lights.push(object);

        this.app.scene.add(directionalLight);
        this.app.scene.add(directionalLightHelper);
    }

    getmaterialLenSLenT(object) {
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            if (object === name) {
                return {s: values.texlength_s, t: values.texlength_t};
            }
        }
    }

    getMaterialWireframe(object) {
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            if (object === name) {
                return values.wireframe;
            }
        }
    }

    createRectangle(object) {
        const width = object.xy2.x - object.xy1.x;
        const height = object.xy2.y - object.xy1.y;

        const texValues = this.getmaterialLenSLenT(object.material);
        let objectMaterial = this.materials[object.material].clone();

        if (objectMaterial && objectMaterial.map) {
            objectMaterial.map = objectMaterial.map.clone();
            objectMaterial.map.repeat.set(Math.abs(width) / (texValues.s || 1), Math.abs(height) / (texValues.t || 1));
            objectMaterial.map.wrapS = THREE.RepeatWrapping;
            objectMaterial.map.wrapT = THREE.RepeatWrapping;
        }
        const rectangle = new THREE.PlaneGeometry(Math.abs(width), Math.abs(height), object.parts_x, object.parts_y);
        const rectangleMesh = new THREE.Mesh(rectangle, objectMaterial);
       
        rectangleMesh.position.set(object.xy1.x + width / 2, object.xy1.y + height / 2, object.xy1.z);
        rectangleMesh.castShadow = object.castShadow;
        rectangleMesh.receiveShadow = object.receiveShadow;

        return rectangleMesh;
    }

    createWireframeRectangle(object){
        const width = object.xy2.x - object.xy1.x;
        const height = object.xy2.y - object.xy1.y;
        const rectangle = new THREE.PlaneGeometry(Math.abs(width), Math.abs(height), object.parts_x, object.parts_y);

        const wireframe = new THREE.WireframeGeometry( rectangle );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 

        line.position.set(object.xy1.x + width / 2, object.xy1.y + height / 2, object.xy1.z);

        return line;
    }

    createBox(object) {
        const width = object.xyz2.x - object.xyz1.x;
        const height = object.xyz2.y - object.xyz1.y;
        const depth = object.xyz2.z - object.xyz1.z;
    
        const texValues = this.getmaterialLenSLenT(object.material);
        let objectMaterial = this.materials[object.material].clone();
    
        const box = new THREE.BoxGeometry(Math.abs(width), Math.abs(height), Math.abs(depth), object.parts_x, object.parts_y, object.parts_z);
        let boxMesh = null;
        
        if (objectMaterial && objectMaterial.map) {
            let originalMap = objectMaterial.map.clone();
            originalMap.wrapS = THREE.RepeatWrapping;
            originalMap.wrapT = THREE.RepeatWrapping;
    
            const materials = [];
    
            const dimensions = [
                { u: Math.abs(depth), v: Math.abs(height) },
                { u: Math.abs(depth), v: Math.abs(height) },
                { u: Math.abs(width), v: Math.abs(depth) },
                { u: Math.abs(width), v: Math.abs(depth) },
                { u: Math.abs(width), v: Math.abs(height) },
                { u: Math.abs(width), v: Math.abs(height) },
            ];
            
            dimensions.forEach(({ u, v }) => {
                let tempMaterial = objectMaterial.clone();
                tempMaterial.map = originalMap.clone();
                tempMaterial.map.repeat.set(u / (texValues.s || 1), v / (texValues.t || 1));

                if(tempMaterial.bumpMap){
                    let originalBumpMap = objectMaterial.bumpMap.clone();
                    originalBumpMap.wrapS = THREE.RepeatWrapping;
                    originalBumpMap.wrapT = THREE.RepeatWrapping;

                    tempMaterial.bumpMap = originalBumpMap.clone();
                    tempMaterial.bumpMap.repeat.set(u / (texValues.s || 1), v / (texValues.t || 1));
                }
                
                if(tempMaterial.specularMap){
                    let originalspecularMap = objectMaterial.specularMap.clone();
                    originalspecularMap.wrapS = THREE.RepeatWrapping;
                    originalspecularMap.wrapT = THREE.RepeatWrapping;

                    tempMaterial.specularMap = originalspecularMap.clone();
                    tempMaterial.specularMap.repeat.set(u / (texValues.s || 1), v / (texValues.t || 1));                
                }

                materials.push(tempMaterial);
            });
    
            boxMesh = new THREE.Mesh(box, materials);
            boxMesh.position.set(object.xyz1.x + width / 2, object.xyz1.y + height / 2, object.xyz1.z + depth / 2);
        
        }
        else {
            boxMesh = new THREE.Mesh(box, this.materials[object.material]);
        }

        boxMesh.position.set(object.xyz1.x + width / 2, object.xyz1.y + height / 2, object.xyz1.z + depth / 2);
        boxMesh.castShadow = object.castShadow;
        boxMesh.receiveShadow = object.receiveShadow;

        return boxMesh;
    }

    createWireframeBox(object){
        const width = object.xyz2.x - object.xyz1.x;
        const height = object.xyz2.y - object.xyz1.y;
        const depth = object.xyz2.z - object.xyz1.z;

        const box = new THREE.BoxGeometry(Math.abs(width), Math.abs(height), Math.abs(depth), object.parts_x, object.parts_y, object.parts_z);

        const wireframe = new THREE.WireframeGeometry( box );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 
        line.position.set(object.xyz1.x + width / 2, object.xyz1.y + height / 2, object.xyz1.z + depth / 2);

        return line;
    }

    createCylinder(object) {
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;

        const cylinder = new THREE.CylinderGeometry(object.top, object.base, object.height, object.slices, object.stacks, object.capsclose, thetaStart, thetaLength);
        const cylinderMesh = new THREE.Mesh(cylinder, this.materials[object.material]);

        cylinderMesh.castShadow = object.castShadow;
        cylinderMesh.receiveShadow = object.receiveShadow;

        return cylinderMesh;
    }

    createWireframeCylinder(object){
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;

        const cylinder = new THREE.CylinderGeometry(object.top, object.base, object.height, object.slices, object.stacks, object.capsclose, thetaStart, thetaLength);

        const wireframe = new THREE.WireframeGeometry( cylinder );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 

        return line;
    }

    createSphere(object) {
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;
        let phiStart = (object.phistart ?? 0) * Math.PI / 180;
        let phiLength = (object.philength ?? 360) * Math.PI / 180;

        const sphere = new THREE.SphereGeometry(object.radius, object.slices, object.stacks, phiStart, phiLength, thetaStart, thetaLength);
        const sphereMesh = new THREE.Mesh(sphere, this.materials[object.material]);

        sphereMesh.castShadow = object.castShadow;
        sphereMesh.receiveShadow = object.receiveShadow;

        return sphereMesh;
    }

    createWireframeSphere(object){
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;
        let phiStart = (object.phistart ?? 0) * Math.PI / 180;
        let phiLength = (object.philength ?? 360) * Math.PI / 180;

        const sphere = new THREE.SphereGeometry(object.radius, object.slices, object.stacks, phiStart, phiLength, thetaStart, thetaLength);

        const wireframe = new THREE.WireframeGeometry( sphere );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 

        return line;
    }

    createTriangle(object) {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            object.coords.xyz1.x, object.coords.xyz1.y, object.coords.xyz1.z,  // Vertex 1
            object.coords.xyz2.x, object.coords.xyz2.y, object.coords.xyz2.z,  // Vertex 2
            object.coords.xyz3.x, object.coords.xyz3.y, object.coords.xyz3.z   // Vertex 3
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const triangleMesh = new THREE.Mesh(geometry, this.materials[object.material]);

        triangleMesh.castShadow = object.castShadow;
        triangleMesh.receiveShadow = object.receiveShadow;

        return triangleMesh;
    }

    createWireframeTriangle(object){
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            object.coords.xyz1.x, object.coords.xyz1.y, object.coords.xyz1.z,  // Vertex 1
            object.coords.xyz2.x, object.coords.xyz2.y, object.coords.xyz2.z,  // Vertex 2
            object.coords.xyz3.x, object.coords.xyz3.y, object.coords.xyz3.z   // Vertex 3
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const wireframe = new THREE.WireframeGeometry( geometry );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 

        return line;
    }

    convertControlPoints(controlPoints, degree_u, degree_v) {
        let convertedControlPoints = [];
    
        let idx = 0; // Index to track which point in the grid we are on
        for (let u = 0; u <= degree_u; u++) {
            let row = [];
            for (let v = 0; v <= degree_v; v++) {
                let point = controlPoints[idx]; // Get the current point
                let x = point.x;
                let y = point.y;
                let z = point.z;
    
                // Ensure there is a 4th value (w) which defaults to 1
                row.push([x, y, z, 1]);
    
                idx++; // Move to the next control point
            }
            convertedControlPoints.push(row); // Add the row to the final result
        }
    
        return convertedControlPoints;
    }

    createNurbs(object) {
        this.builder = new MyNurbsBuilder();

        const controlPoints = this.convertControlPoints(object.controlpoints, object.degree_u, object.degree_v);
        const surfaceData = this.builder.build(controlPoints, object.degree_u, object.degree_v, object.parts_u, object.parts_v, this.materials[object.material]);
        const mesh = new THREE.Mesh(surfaceData, this.materials[object.material]);

        mesh.castShadow = object.castShadow;
        mesh.receiveShadow = object.receiveShadow;

        return mesh;
    }

    createWireframeNurbs(object){
        const controlPoints = this.convertControlPoints(object.controlpoints, object.degree_u, object.degree_v);
        const surfaceData = this.builder.build(controlPoints, object.degree_u, object.degree_v, object.parts_u, object.parts_v, this.materials[object.material]);

        const wireframe = new THREE.WireframeGeometry( surfaceData );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 

        return line;
    }
    
    createPolygon(object) {
        const radius = object.radius;
        const stacks = object.stacks;
        const slices = object.slices;
    
        const colorCenter = new THREE.Color(object.color_c.r, object.color_c.g, object.color_c.b);
        const colorPeriphery = new THREE.Color(object.color_p.r, object.color_p.g, object.color_p.b);

        const vertices = [];
        const indices = [];
        const colors = [];
        const normals = [];
    
        // Generate vertices, normals, and colors
        for (let i = 0; i <= stacks; i++) {
            const stackRadius = (radius * i) / stacks;
    
            for (let j = 0; j <= slices; j++) {
                const angle = (2 * Math.PI * j) / slices;
                const x = Math.cos(angle) * stackRadius;
                const y = Math.sin(angle) * stackRadius;
    
                // Position vertex
                vertices.push(x, y, 0);
    
                // Normal vector (facing Z+ direction for flat surface)
                normals.push(0, 0, 1);
    
                // Interpolate colors between center and periphery
                const interpolatedColor = colorCenter.clone().lerp(colorPeriphery, i / stacks);
                colors.push(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b);
            }
        }
    
        // Generate indices for triangles
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < slices; j++) {
                const current = i * (slices + 1) + j;
                const next = current + slices + 1;
    
                // First triangle (current, next, current + 1)
                indices.push(current, next, current + 1);
    
                // Second triangle (current + 1, next, next + 1)
                indices.push(current + 1, next, next + 1);
            }
        }
    
        // Create buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setIndex(indices);
    
        const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = object.castShadow;
        mesh.receiveShadow = object.receiveShadow;
    
        const wireframe = new THREE.WireframeGeometry( geometry );
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = false; 
        line.material.opacity = 0.25; 
        line.material.transparent = true; 

        return {m:mesh, l:line};
    }
    
    createGraph(nodes, group) {
        for (let [_, object] of Object.entries(nodes.children)) {
            let addObject = null;
            let addWireframe = null;
            if (object instanceof MyPointLight) {
                this.createPointLight(object);
            } else if (object instanceof MySpotLight) {
                this.createSpotLight(object);
            } else if (object instanceof MyDirectionalLight) {
                this.createDirectionalLight(object);
            } else if (object instanceof MyBox) {
                addObject = this.createBox(object);
                addWireframe = this.createWireframeBox(object);
            } else if (object instanceof MyCylinder) {
                addObject = this.createCylinder(object);
                addWireframe = this.createWireframeCylinder(object);
            } else if (object instanceof MyNurbs) {
                addObject = this.createNurbs(object);
                addWireframe = this.createWireframeNurbs(object);
            } else if (object instanceof MyPolygon) {
                let polygon = this.createPolygon(object);
                addObject = polygon.m;
                addWireframe = polygon.l;
            } else if (object instanceof MyRectangle) {
                addObject = this.createRectangle(object);
                addWireframe = this.createWireframeRectangle(object);
            } else if (object instanceof MySphere) {
                addObject = this.createSphere(object);
                addWireframe = this.createWireframeSphere(object);
            } else if (object instanceof MyTriangle) {
                addObject = this.createTriangle(object);
                addWireframe = this.createWireframeTriangle(object);
            }  else if(object.type === "lod"){
                console.log(object);
            } else if (object instanceof MyNode) {
                let temp = new THREE.Group();
                this.createGraph(object, temp);
                this.transforms(object, temp);
                group.add(temp);
            }

            if (addObject) group.add(addObject);
            if (addWireframe) {
                group.add(addWireframe);

                let wireframeVisible = this.getMaterialWireframe(object.material);
                addWireframe.visible = wireframeVisible;

                this.wireframes.push(addWireframe);

                if (wireframeVisible) {
                    addWireframe.visible = true;
                } else {
                    addWireframe.visible = false;
                }
            }
        }

        this.transforms(nodes, group);
    }

    toggleWireframe(index, visible) {
        if (this.wireframes[index]) {
            this.wireframes[index].visible = visible;
        }
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        this.yasf = data.yasf;
        this.graph = new MyGraph(this.app, this.yasf.graph);

        this.createGlobals();
        this.createFog();
        this.createMaterialsAndTexture();
        this.createCameras();
        this.createSkybox();
        this.createGraph(this.graph.rootNode, this.graphGroup);

        this.app.gui.setCamerasAndLightsInterface(Object.keys(this.cameras), this.lights);
        this.app.gui.setWireframeInterface();
        this.app.scene.add(this.graphGroup);
    }

    toggleAxis() {
        this.axis.visible = !this.axis.visible;
    }

    update() {
    }
}

export { MyContents };