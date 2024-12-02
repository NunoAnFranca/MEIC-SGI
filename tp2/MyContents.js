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

        // Initializes the file reader
        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        // Initializes the json
        this.reader.open("scenes/super_mario.json");

        // Initializes backgroundcolor
        this.backgroundColor = null;
        // Initializes ambientColor
        this.ambientColor = null;
        // Initializes fog
        this.fog = {};

        // Initializes textures
        this.textures = {};
        // Initializes materials
        this.materials = {};
        // Initializes cameras
        this.cameras = [];
        // Initializes lights
        this.lights = [];
        // Initializes wireframes
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

    // function to create global values
    createGlobals() {
        // Initializes background color
        this.app.scene.background = new THREE.Color(this.yasf.globals.background.r, this.yasf.globals.background.g, this.yasf.globals.background.b);
        // Initializes ambientLightColor
        this.ambientLightColor = new THREE.Color(this.yasf.globals.ambient.r, this.yasf.globals.ambient.g, this.yasf.globals.ambient.b);
        // Initializes ambientLight
        this.ambientLight = new THREE.AmbientLight(this.ambientLightColor, this.yasf.globals.ambient.intensity);
        // add ambient light to the scene
        this.app.scene.add(this.ambientLight);
    }

    // function to create fog
    createFog() {
        // Initializes fog
        this.app.scene.fog = new THREE.Fog(new THREE.Color(this.yasf.globals.fog.color.r, this.yasf.globals.fog.color.g, this.yasf.globals.fog.color.b), this.yasf.globals.fog.near, this.yasf.globals.fog.far);
    }
    
    // function to change textures for bump/specular values
    getTextureType(object, value){
        // Initialize texture values with json values
        const textureValues = this.yasf.textures[value];

        // check if texture as attribute isvideo as true
        if (textureValues.isVideo) {
            // Create video var
            const video = document.createElement('video');
            // Assign texture filepath to video
            video.src = textureValues.filepath;
            video.loop = true;
            video.muted = true;
            //play video
            video.play();
            
            // Assign object to the video texture
            object = new THREE.VideoTexture(video);
            object.colorSpace = THREE.SRGBColorSpace;
            object.minFilter = THREE.LinearFilter;
            object.magFilter = THREE.LinearFilter;
        } else {
            // Assign object to normal texture
            object = this.loader.load(textureValues.filepath);
            object.generateMipmaps = false;
            object.repeat.set(1,1);
            object.wrapS = object.wrapT = THREE.RepeatWrapping;
        }
        return object;
    }

    // Function to create materials and textures
    createMaterialsAndTexture() {
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            //initializes texture
            let texture = null;
            //initializes texture path
            const textureRef = values.textureref;

            //initializes texture bump 
            let textureBump = null;
            //initializes texture bump  path
            const textureBumpRef = values.bumpref;

            //initializes texture specular 
            let textureSpecular = null;
            //initializes texture specular  path
            const textureSpecularRef = values.specularref;

            //Check if texture ref exists and it filepath is json
            if (textureRef && this.yasf.textures[textureRef]) {
                //Assign texture values to constant
                const textureValues = this.yasf.textures[textureRef];

                if (textureValues.isVideo) {
                    // Create video var
                    const video = document.createElement('video');
                    // Assign texture filepath to video
                    video.src = textureValues.filepath;
                    video.loop = true;
                    video.muted = true;
                    //play video
                    video.play();
                    
                    // Assign texture to the video texture
                    texture = new THREE.VideoTexture(video);
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                } else {
                    // Assign texture to normal texture
                    texture = this.loader.load(textureValues.filepath);
                    // Mipmaps for texture
                    texture.generateMipmaps = false;

                    if (textureValues.mipmap0) {
                        for (let i = 0; i <= 7; i++) {
                            if (textureValues[`mipmap${i}`]) {
                                this.loadMipmap(texture, i, textureValues[`mipmap${i}`]);
                            }
                        }
                    } else {
                        texture.magFilter = THREE.NearestFilter;
                        texture.minFilter = THREE.LinearMipMapLinearFilter; 
                    }

                    texture.needsUpdate = true;

                    //colorSpace for texture
                    texture.colorSpace = THREE.SRGBColorSpace;
                    //texture wrapping
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(values.texlength_s || 1, values.texlength_t || 1);
                }
            }

            //Change texture values if texture bump exists
            if (textureBumpRef && this.yasf.textures[textureBumpRef]) {
                textureBump =  this.getTextureType(textureBump,textureBumpRef);
            }

            //Change texture values if texture specular exists
            if (textureSpecularRef && this.yasf.textures[textureSpecularRef]) {
                textureSpecular =  this.getTextureType(textureSpecular,textureSpecularRef);
            }

            // Assign material variable to the new material
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

    /**
     * load an image and create a mipmap to be added to a texture at the defined level.
     * In between, add the image some text and control squares. These items become part of the picture
     * 
     * @param {*} parentTexture the texture to which the mipmap is added
     * @param {*} level the level of the mipmap
     * @param {*} path the path for the mipmap image
    // * @param {*} size if size not null inscribe the value in the mipmap. null by default
    // * @param {*} color a color to be used for demo
     */
    loadMipmap(parentTexture, level, path)
    {
        // load texture. On loaded call the function to create the mipmap for the specified level 
        new THREE.TextureLoader().load(path, 
            function(mipmapTexture)  // onLoad callback
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                ctx.scale(1, 1);
                
                // const fontSize = 48
                const img = mipmapTexture.image         
                canvas.width = img.width;
                canvas.height = img.height

                // first draw the image
                ctx.drawImage(img, 0, 0 )
                             
                // set the mipmap image in the parent texture in the appropriate level
                parentTexture.mipmaps[level] = canvas
            },
            undefined, // onProgress callback currently not supported
            function(err) {
                console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
            }
        )
    }

    /**
     * load an image and create a mipmap to be added to a texture at the defined level.
     * In between, add the image some text and control squares. These items become part of the picture
     * 
     * @param {*} parentTexture the texture to which the mipmap is added
     * @param {*} level the level of the mipmap
     * @param {*} path the path for the mipmap image
    // * @param {*} size if size not null inscribe the value in the mipmap. null by default
    // * @param {*} color a color to be used for demo
     */
    loadMipmap(parentTexture, level, path)
    {
        // load texture. On loaded call the function to create the mipmap for the specified level 
        new THREE.TextureLoader().load(path, 
            function(mipmapTexture)  // onLoad callback
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                ctx.scale(1, 1);
                
                // const fontSize = 48
                const img = mipmapTexture.image         
                canvas.width = img.width;
                canvas.height = img.height

                // first draw the image
                ctx.drawImage(img, 0, 0 )
                             
                // set the mipmap image in the parent texture in the appropriate level
                parentTexture.mipmaps[level] = canvas
            },
            undefined, // onProgress callback currently not supported
            function(err) {
                console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
            }
        )
    }

    // function to create cameras
    createCameras() {
        // aspect ratio for the cameras
        const aspect = window.innerWidth / window.innerHeight;

        // default intial camera when json is loaded
        this.initialCamera = this.yasf.cameras.initial;
        for (let [name, values] of Object.entries(this.yasf.cameras)) {
            // Iteration of camera values present in the json files
            if (name !== "initial") {
                //create perspective camera
                if (values.type === "perspective") {
                    this.cameras[name] = new THREE.PerspectiveCamera(values.angle, aspect, values.near, values.far);
                } 
                //create orthogonal camera
                else if (values.type === "orthogonal") {
                    this.cameras[name] = new THREE.OrthographicCamera(values.left, values.right, values.top, values.bottom, values.near, values.far);
                }
                // set camera position
                this.cameras[name].position.set(values.location.x, values.location.y, values.location.z);
                // set camera targer
                this.cameras[name].lookAt(new THREE.Vector3(values.target.x, values.target.y, values.target.z));
                // add acamera to the camera array
                this.app.cameras[name] = this.cameras[name];
            } else {
                // set default intial camera
                this.app.setActiveCamera(values);
            }
        }
    }

    // function to create skybox
    createSkybox() {
        //Initialize skybox geometry
        const skyboxGeometry = new THREE.BoxGeometry(this.yasf.globals.skybox.size.x, this.yasf.globals.skybox.size.y, this.yasf.globals.skybox.size.z);
        //Initialize skybox emissiveColor
        const emissiveColor = new THREE.Color(this.yasf.globals.skybox.emissive.r, this.yasf.globals.skybox.emissive.g, this.yasf.globals.skybox.emissive.b);
        //Initialize skybox intesitylevel
        const intensityLevel = this.yasf.globals.skybox.intensity;

        //Initialize skybox textures
        const skyBoxTextures = [
            this.loader.load(this.yasf.globals.skybox.right),
            this.loader.load(this.yasf.globals.skybox.left),
            this.loader.load(this.yasf.globals.skybox.up),
            this.loader.load(this.yasf.globals.skybox.down),
            this.loader.load(this.yasf.globals.skybox.back),
            this.loader.load(this.yasf.globals.skybox.front),
        ];

        // Load SRGBColorSpace for each skybox texture
        skyBoxTextures.forEach(texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
        });

        // Create materials for each texture
        const skyBoxMaterials = skyBoxTextures.map(texture => 
            new THREE.MeshPhongMaterial({
                emissive: emissiveColor,
                emissiveIntensity: intensityLevel,
                map: texture,
                side: THREE.BackSide
            })
        );

        // create mesh skybox
        const skybox = new THREE.Mesh(skyboxGeometry, skyBoxMaterials);
        // skybox y adjustment
        skybox.translateY(this.yasf.globals.skybox.size.y / 2);
        // set skybox position
        skybox.position.set(this.yasf.globals.skybox.center.x,this.yasf.globals.skybox.center.y,this.yasf.globals.skybox.center.z);
        //skybox cast shadow
        skybox.castShadow = true;
        //skybox receive shadow
        skybox.receiveShadow = true;

        // add skybox to the scene
        this.app.scene.add(skybox);
    }

    // Apply transformations to the group
    transforms(object, group) {
        for (const [key, value] of Object.entries(object.transforms)) {
            if (key === "translate") {
                // Set position of the group
                group.position.set(value.x, value.y, value.z);
            } else if (key === "rotate") {
                // Set rotation of the group after changing to radians
                group.rotation.set(value.x * Math.PI / 180, value.y * Math.PI / 180, value.z * Math.PI / 180);
            } else if (key === "scale") {
                // Set scale of the group
                group.scale.set(value.x, value.y, value.z);
            }
        }
    }

    // Create point light
    createPointLight(object) {
        // Initialize point light with properties
        const pointLight = new THREE.PointLight(object.color, object.intensity, object.distance, object.decay);
        // Set light name
        pointLight.name = object.name;
        // Set light visibility
        pointLight.visible = object.enabled;
        // Set light position
        pointLight.position.set(object.position.x, object.position.y, object.position.z);
        // Enable or disable shadows
        pointLight.castShadow = object.castShadow;

        if (object.castShadow) {
            // Set shadow map size
            pointLight.shadow.mapSize.width = object.shadowMapSize;
            pointLight.shadow.mapSize.height = object.shadowMapSize;
            // Set shadow camera far distance
            pointLight.shadow.camera.far = object.shadowFar;
            // Set shadow camera near distance
            pointLight.shadow.camera.near = 0.5;
        }

        // Create helper to visualize point light
        const pointLightHelper = new THREE.PointLightHelper(pointLight);
        // Set helper name
        pointLightHelper.name = object.name;
        // Hide helper by default
        pointLightHelper.visible = false;

        // Link light and helper to object
        object.setLight(pointLight);
        object.setLightHelper(pointLightHelper);

        // Add light to internal array
        this.lights.push(object);
        // Add light and helper to scene
        this.app.scene.add(pointLight);
        this.app.scene.add(pointLightHelper);
    }

    // Create spot light
    createSpotLight(object) {
        // Initialize spot light with properties
        const spotLight = new THREE.SpotLight(object.color, object.intensity, object.distance, object.angle, object.penumbra, object.decay);
        // Set light name
        spotLight.name = object.name;
        // Set light visibility
        spotLight.visible = object.enabled;
        // Set light position
        spotLight.position.set(object.position.x, object.position.y, object.position.z);
        // Set light target position
        spotLight.target.position.set(object.target.x, object.target.y, object.target.z);
        // Enable or disable shadows
        spotLight.castShadow = object.castShadow;

        if (object.castShadow) {
            // Set shadow map size
            spotLight.shadow.mapSize.width = object.shadowMapSize;
            spotLight.shadow.mapSize.height = object.shadowMapSize;
            // Set shadow camera far distance
            spotLight.shadow.camera.far = object.shadowFar;
            // Set shadow camera near distance
            spotLight.shadow.camera.near = 0.5;
        }

        // Create helper to visualize spot light
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        // Set helper name
        spotLightHelper.name = object.name;
        // Hide helper by default
        spotLightHelper.visible = false;

        // Link light and helper to object
        object.setLight(spotLight);
        object.setLightHelper(spotLightHelper);

        // Add light to internal array
        this.lights.push(object);
        // Add light and helper to scene
        this.app.scene.add(spotLight);
        this.app.scene.add(spotLightHelper);
    }

    // Create directional light
    createDirectionalLight(object) {
        // Initialize directional light with color and intensity
        const directionalLight = new THREE.DirectionalLight(object.color, object.intensity);
        // Set light name
        directionalLight.name = object.name;
        // Set light visibility
        directionalLight.visible = object.enabled;
        // Set light position
        directionalLight.position.set(object.position.x, object.position.y, object.position.z);
        // Enable or disable shadows
        directionalLight.castShadow = object.castShadow;

        if (object.castShadow) {
            // Set shadow camera boundaries
            directionalLight.shadow.camera.left = object.shadowLeft;
            directionalLight.shadow.camera.right = object.shadowRight;
            directionalLight.shadow.camera.top = object.shadowTop;
            directionalLight.shadow.camera.bottom = object.shadowBottom;
            // Set shadow camera far distance
            directionalLight.shadow.camera.far = object.shadowFar;
            // Set shadow map size
            directionalLight.shadow.mapSize.width = object.shadowMapSize;
            directionalLight.shadow.mapSize.height = object.shadowMapSize;
        }

        // Create helper to visualize directional light
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        // Set helper name
        directionalLightHelper.name = object.name;
        // Hide helper by default
        directionalLightHelper.visible = false;

        // Link light and helper to object
        object.setLight(directionalLight);
        object.setLightHelper(directionalLightHelper);

        // Add light to internal array
        this.lights.push(object);
        // Add light and helper to scene
        this.app.scene.add(directionalLight);
        this.app.scene.add(directionalLightHelper);
    }

    // Get material texture lengths (s and t)
    getmaterialLenSLenT(object) {
        // Iterate over materials to find matching object
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            if (object === name) {
                // Return texture lengths
                return {s: values.texlength_s, t: values.texlength_t};
            }
        }
    }

    // Get material wireframe property
    getMaterialWireframe(object) {
        // Iterate over materials to find matching object
        for (let [name, values] of Object.entries(this.yasf.materials)) {
            if (object === name) {
                // Return wireframe value
                return values.wireframe;
            }
        }
    }

    // Create rectangle geometry
    createRectangle(object) {
        // Calculate rectangle width and height
        const width = object.xy2.x - object.xy1.x;
        const height = object.xy2.y - object.xy1.y;

        // Get texture length values for material
        const texValues = this.getmaterialLenSLenT(object.material);

        // Clone material for the rectangle
        let objectMaterial = null;

        if (this.materials[object.material]) {
            objectMaterial = this.materials[object.material].clone();
        } else {
            objectMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 1, 1) });
        }

        if (objectMaterial && objectMaterial.map) {
            // Set texture repeat values based on width and height
            objectMaterial.map.repeat.set(Math.abs(width) / (texValues.s || 1), Math.abs(height) / (texValues.t || 1));
            // Set texture wrapping
            objectMaterial.map.wrapS = THREE.RepeatWrapping;
            objectMaterial.map.wrapT = THREE.RepeatWrapping;
        }

        // Create rectangle plane geometry
        const rectangle = new THREE.PlaneGeometry(Math.abs(width), Math.abs(height), object.parts_x, object.parts_y);
        // Create mesh with geometry and material
        const rectangleMesh = new THREE.Mesh(rectangle, objectMaterial);

        // Set mesh position
        rectangleMesh.position.set(object.xy1.x + width / 2, object.xy1.y + height / 2, object.xy1.z);
        // Enable shadow casting
        rectangleMesh.castShadow = object.castShadow;
        // Enable shadow receiving
        rectangleMesh.receiveShadow = object.receiveShadow;

        // Return the rectangle mesh
        return rectangleMesh;
    }

    // Create wireframe rectangle
    createWireframeRectangle(object) {
        // Calculate rectangle width and height
        const width = object.xy2.x - object.xy1.x;
        const height = object.xy2.y - object.xy1.y;
        // Create plane geometry for rectangle
        const rectangle = new THREE.PlaneGeometry(Math.abs(width), Math.abs(height), object.parts_x, object.parts_y);

        // Create wireframe geometry from rectangle
        const wireframe = new THREE.WireframeGeometry(rectangle);
        // Create line segments from wireframe
        const line = new THREE.LineSegments(wireframe);
        // Disable depth testing for wireframe
        line.material.depthTest = false;
        // Set wireframe opacity
        line.material.opacity = 0.25;
        // Enable transparency for wireframe
        line.material.transparent = true;

        // Set wireframe position
        line.position.set(object.xy1.x + width / 2, object.xy1.y + height / 2, object.xy1.z);

        // Return the wireframe line
        return line;
    }

    // Create box geometry
    createBox(object) {
        // Calculate box width, height, and depth
        const width = object.xyz2.x - object.xyz1.x;
        const height = object.xyz2.y - object.xyz1.y;
        const depth = object.xyz2.z - object.xyz1.z;

        // Get texture length values for material
        const texValues = this.getmaterialLenSLenT(object.material);

        let objectMaterial = null;
        
        if (this.materials[object.material]) {
            objectMaterial = this.materials[object.material].clone();
        } else {
            objectMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 1, 1) });
        }

        const box = new THREE.BoxGeometry(Math.abs(width), Math.abs(height), Math.abs(depth), object.parts_x, object.parts_y, object.parts_z);
        let boxMesh = null;

        if (objectMaterial && objectMaterial.map) {
            // Clone and set texture map
            let originalMap = objectMaterial.map.clone();
            originalMap.mipmaps = objectMaterial.map.mipmaps;
            originalMap.wrapS = THREE.RepeatWrapping;
            originalMap.wrapT = THREE.RepeatWrapping;

            // Create materials array for each face
            const materials = [];

            // Define dimensions for each face
            const dimensions = [
                { u: Math.abs(depth), v: Math.abs(height) },
                { u: Math.abs(depth), v: Math.abs(height) },
                { u: Math.abs(width), v: Math.abs(depth) },
                { u: Math.abs(width), v: Math.abs(depth) },
                { u: Math.abs(width), v: Math.abs(height) },
                { u: Math.abs(width), v: Math.abs(height) },
            ];

            // Iterate over dimensions and create materials
            dimensions.forEach(({ u, v }) => {
                let tempMaterial = objectMaterial.clone();
                tempMaterial.map = originalMap.clone();
                tempMaterial.map.mipmaps = originalMap.mipmaps;
                tempMaterial.map.repeat.set(u / (texValues.s || 1), v / (texValues.t || 1));

                if (tempMaterial.bumpMap) {
                    // Clone and set bump map
                    let originalBumpMap = objectMaterial.bumpMap.clone();
                    originalBumpMap.wrapS = THREE.RepeatWrapping;
                    originalBumpMap.wrapT = THREE.RepeatWrapping;
                    tempMaterial.bumpMap = originalBumpMap.clone();
                    tempMaterial.bumpMap.repeat.set(u / (texValues.s || 1), v / (texValues.t || 1));
                }

                if (tempMaterial.specularMap) {
                    // Clone and set specular map
                    let originalSpecularMap = objectMaterial.specularMap.clone();
                    originalSpecularMap.wrapS = THREE.RepeatWrapping;
                    originalSpecularMap.wrapT = THREE.RepeatWrapping;
                    tempMaterial.specularMap = originalSpecularMap.clone();
                    tempMaterial.specularMap.repeat.set(u / (texValues.s || 1), v / (texValues.t || 1));
                }

                materials.push(tempMaterial);
            });

            // Create mesh with box geometry and materials
            boxMesh = new THREE.Mesh(box, materials);
            boxMesh.position.set(object.xyz1.x + width / 2, object.xyz1.y + height / 2, object.xyz1.z + depth / 2);
        } else {
            // Create mesh with single material
            boxMesh = new THREE.Mesh(box, this.materials[object.material]);
        }

        // Set position for box mesh
        boxMesh.position.set(object.xyz1.x + width / 2, object.xyz1.y + height / 2, object.xyz1.z + depth / 2);
        // Enable shadow casting
        boxMesh.castShadow = object.castShadow;
        // Enable shadow receiving
        boxMesh.receiveShadow = object.receiveShadow;

        // Return the box mesh
        return boxMesh;
    }

    // Create wireframe box
    createWireframeBox(object) {
        // Calculate box width, height, and depth
        const width = object.xyz2.x - object.xyz1.x;
        const height = object.xyz2.y - object.xyz1.y;
        const depth = object.xyz2.z - object.xyz1.z;

        // Create box geometry
        const box = new THREE.BoxGeometry(Math.abs(width), Math.abs(height), Math.abs(depth), object.parts_x, object.parts_y, object.parts_z);

        // Create wireframe geometry from box
        const wireframe = new THREE.WireframeGeometry(box);
        // Create line segments from wireframe
        const line = new THREE.LineSegments(wireframe);
        // Disable depth testing for wireframe
        line.material.depthTest = false;
        // Set wireframe opacity
        line.material.opacity = 0.25;
        // Enable transparency for wireframe
        line.material.transparent = true;

        // Set wireframe position
        line.position.set(object.xyz1.x + width / 2, object.xyz1.y + height / 2, object.xyz1.z + depth / 2);

        // Return the wireframe line
        return line;
    }

    // Create cylinder geometry
    createCylinder(object) {
        // Calculate theta start and length in radians
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;

        // Create cylinder geometry
        const cylinder = new THREE.CylinderGeometry(object.top, object.base, object.height, object.slices, object.stacks, object.capsclose, thetaStart, thetaLength);
        // Create mesh with cylinder geometry and material
        const cylinderMesh = new THREE.Mesh(cylinder, this.materials[object.material]);

        // Enable shadow casting
        cylinderMesh.castShadow = object.castShadow;
        // Enable shadow receiving
        cylinderMesh.receiveShadow = object.receiveShadow;

        // Return the cylinder mesh
        return cylinderMesh;
    }

    // Create wireframe cylinder
    createWireframeCylinder(object) {
        // Calculate theta start and length in radians
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;

        // Create cylinder geometry
        const cylinder = new THREE.CylinderGeometry(object.top, object.base, object.height, object.slices, object.stacks, object.capsclose, thetaStart, thetaLength);

        // Create wireframe geometry from cylinder
        const wireframe = new THREE.WireframeGeometry(cylinder);
        // Create line segments from wireframe
        const line = new THREE.LineSegments(wireframe);
        // Disable depth testing for wireframe
        line.material.depthTest = false;
        // Set wireframe opacity
        line.material.opacity = 0.25;
        // Enable transparency for wireframe
        line.material.transparent = true;

        // Return the wireframe line
        return line;
    }

    // Create a solid sphere mesh
    createSphere(object) {
        // Convert angles from degrees to radians
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;
        let phiStart = (object.phistart ?? 0) * Math.PI / 180;
        let phiLength = (object.philength ?? 360) * Math.PI / 180;

        // Create sphere geometry
        const sphere = new THREE.SphereGeometry(object.radius, object.slices, object.stacks, phiStart, phiLength, thetaStart, thetaLength);
        
        // Create sphere mesh using material
        const sphereMesh = new THREE.Mesh(sphere, this.materials[object.material]);

        // Set shadow properties
        sphereMesh.castShadow = object.castShadow;
        sphereMesh.receiveShadow = object.receiveShadow;

        return sphereMesh;
    }

    // Create a wireframe sphere
    createWireframeSphere(object) {
        // Convert angles from degrees to radians
        let thetaStart = (object.thetastart ?? 0) * Math.PI / 180;
        let thetaLength = (object.thetalength ?? 360) * Math.PI / 180;
        let phiStart = (object.phistart ?? 0) * Math.PI / 180;
        let phiLength = (object.philength ?? 360) * Math.PI / 180;

        // Create sphere geometry
        const sphere = new THREE.SphereGeometry(object.radius, object.slices, object.stacks, phiStart, phiLength, thetaStart, thetaLength);

        // Create wireframe geometry from sphere
        const wireframe = new THREE.WireframeGeometry(sphere);
        const line = new THREE.LineSegments(wireframe);

        // Set wireframe material properties
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        return line;
    }

    // Create a solid triangle mesh
    createTriangle(object) {
        // Create buffer geometry for the triangle
        const geometry = new THREE.BufferGeometry();
        
        // Define vertices for the triangle
        const vertices = new Float32Array([
            object.coords.xyz1.x, object.coords.xyz1.y, object.coords.xyz1.z,  // Vertex 1
            object.coords.xyz2.x, object.coords.xyz2.y, object.coords.xyz2.z,  // Vertex 2
            object.coords.xyz3.x, object.coords.xyz3.y, object.coords.xyz3.z   // Vertex 3
        ]);

        // Set vertex positions in geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Create mesh using geometry and material
        const triangleMesh = new THREE.Mesh(geometry, this.materials[object.material]);

        // Set shadow properties
        triangleMesh.castShadow = object.castShadow;
        triangleMesh.receiveShadow = object.receiveShadow;

        return triangleMesh;
    }

    // Create a wireframe triangle
    createWireframeTriangle(object) {
        // Create buffer geometry for the triangle
        const geometry = new THREE.BufferGeometry();
        
        // Define vertices for the triangle
        const vertices = new Float32Array([
            object.coords.xyz1.x, object.coords.xyz1.y, object.coords.xyz1.z,  // Vertex 1
            object.coords.xyz2.x, object.coords.xyz2.y, object.coords.xyz2.z,  // Vertex 2
            object.coords.xyz3.x, object.coords.xyz3.y, object.coords.xyz3.z   // Vertex 3
        ]);

        // Set vertex positions in geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Create wireframe geometry from triangle
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);

        // Set wireframe material properties
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        return line;
    }

    // Convert control points for NURBS surface
    convertControlPoints(controlPoints, degree_u, degree_v) {
        let convertedControlPoints = [];
        let idx = 0; // Track current control point index

        // Iterate over degrees to create rows
        for (let u = 0; u <= degree_u; u++) {
            let row = [];
            for (let v = 0; v <= degree_v; v++) {
                let point = controlPoints[idx]; // Get current point
                let x = point.x;
                let y = point.y;
                let z = point.z;

                // Add point with default w = 1
                row.push([x, y, z, 1]);

                idx++; // Move to next point
            }
            convertedControlPoints.push(row); // Add row to result
        }

        return convertedControlPoints;
    }

    // Create a solid NURBS surface
    createNurbs(object) {
        this.builder = new MyNurbsBuilder();

        // Convert control points
        const controlPoints = this.convertControlPoints(object.controlpoints, object.degree_u, object.degree_v);
        const surfaceData = this.builder.build(controlPoints, object.degree_u, object.degree_v, object.parts_u, object.parts_v, this.materials[object.material]);
        
        // Create mesh using NURBS data and material
        const mesh = new THREE.Mesh(surfaceData, this.materials[object.material]);

        // Set shadow properties
        mesh.castShadow = object.castShadow;
        mesh.receiveShadow = object.receiveShadow;

        return mesh;
    }

    // Create a wireframe NURBS surface
    createWireframeNurbs(object) {
        // Convert control points
        const controlPoints = this.convertControlPoints(object.controlpoints, object.degree_u, object.degree_v);
        const surfaceData = this.builder.build(controlPoints, object.degree_u, object.degree_v, object.parts_u, object.parts_v, this.materials[object.material]);

        // Create wireframe geometry from surface
        const wireframe = new THREE.WireframeGeometry(surfaceData);
        const line = new THREE.LineSegments(wireframe);

        // Set wireframe material properties
        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        return line;
    }

    // Create a solid and wireframe polygon
    createPolygon(object) {
        const radius = object.radius;
        const stacks = object.stacks;
        const slices = object.slices;

        // Create colors for center and periphery
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

                vertices.push(x, y, 0); // Vertex position
                normals.push(0, 0, 1);  // Normal vector

                // Interpolate colors
                const interpolatedColor = colorCenter.clone().lerp(colorPeriphery, i / stacks);
                colors.push(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b);
            }
        }

        // Generate indices for triangles
        for (let i = 0; i < stacks; i++) {
            for (let j = 0; j < slices; j++) {
                const current = i * (slices + 1) + j;
                const next = current + slices + 1;

                indices.push(current, next, current + 1);
                indices.push(current + 1, next, next + 1);
            }
        }

        // Create buffer geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setIndex(indices);

        // Create material with vertex colors
        const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);

        // Set shadow properties
        mesh.castShadow = object.castShadow;
        mesh.receiveShadow = object.receiveShadow;

        // Create wireframe from geometry
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);

        line.material.depthTest = false;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        return { m: mesh, l: line }; // Return both mesh and wireframe
    }
    
// Function to recursively create and add objects and their wireframes to the scene graph
    createGraph(nodes, group) {
        // Loop through all child objects in the node
        for (let [_, object] of Object.entries(nodes.children)) {
            let addObject = null;  // Placeholder for the main object
            let addWireframe = null;  // Placeholder for the wireframe object

            // Check the type of the object and call appropriate creation methods
            if (object instanceof MyPointLight) {
                this.createPointLight(object);  // Create a point light
            } else if (object instanceof MySpotLight) {
                this.createSpotLight(object);  // Create a spot light
            } else if (object instanceof MyDirectionalLight) {
                this.createDirectionalLight(object);  // Create a directional light
            } else if (object instanceof MyBox) {
                addObject = this.createBox(object);  // Create a box geometry
                addWireframe = this.createWireframeBox(object);  // Create a wireframe for the box
            } else if (object instanceof MyCylinder) {
                addObject = this.createCylinder(object);  // Create a cylinder geometry
                addWireframe = this.createWireframeCylinder(object);  // Create a wireframe for the cylinder
            } else if (object instanceof MyNurbs) {
                addObject = this.createNurbs(object);  // Create a NURBS surface
                addWireframe = this.createWireframeNurbs(object);  // Create a wireframe for the NURBS surface
            } else if (object instanceof MyPolygon) {
                let polygon = this.createPolygon(object);  // Create a polygon with both mesh and wireframe
                addObject = polygon.m;  // Extract the polygon mesh
                addWireframe = polygon.l;  // Extract the polygon wireframe
            } else if (object instanceof MyRectangle) {
                addObject = this.createRectangle(object);  // Create a rectangle geometry
                addWireframe = this.createWireframeRectangle(object);  // Create a wireframe for the rectangle
            } else if (object instanceof MySphere) {
                addObject = this.createSphere(object);  // Create a sphere geometry
                addWireframe = this.createWireframeSphere(object);  // Create a wireframe for the sphere
            } else if (object instanceof MyTriangle) {
                addObject = this.createTriangle(object);  // Create a triangle geometry
                addWireframe = this.createWireframeTriangle(object);  // Create a wireframe for the triangle
            } else if (object instanceof MyNode) {
                // For a node, create a new group and recursively process its children
                let temp = new THREE.Group();
                this.createGraph(object, temp);  // Recursively add child objects
                this.transforms(object, temp);  // Apply any transformations to the group
                group.add(temp);  // Add the group to the parent
            }

            // Add the main object to the group if it was created
            if (addObject) group.add(addObject);

            // Add the wireframe and handle its visibility and settings
            if (addWireframe) {
                group.add(addWireframe);  // Add the wireframe to the group

                // Get wireframe property
                let wireframeVisible = this.getMaterialWireframe(object.material);
                    addWireframe.visible = wireframeVisible;

                // Push wireframe to the wireframes array
                this.wireframes.push(addWireframe);

                // Set wireframe visibility 
                if (wireframeVisible) {
                    addWireframe.visible = true;
                } else {
                    addWireframe.visible = false;
                }
            }
        }

        this.transforms(nodes, group);
    }

        // Toggle visibility of wireframes based on user interaction
        toggleWireframe(index, visible) {
            if (this.wireframes[index]) {  // Check if the wireframe exists
                this.wireframes[index].visible = visible;  // Set its visibility
            }
        }

    // Function responsible for initializing various elements
    onAfterSceneLoadedAndBeforeRender(data) {
        this.yasf = data.yasf;  // Initialize yasf
        this.graph = new MyGraph(this.app, this.yasf.graph);  // Initialize the graph

        this.createGlobals();  // Set up global elements
        this.createFog();  // Add fog to the scene
        this.createMaterialsAndTexture();  // Load and set up materials and textures
        this.createCameras();  // Set up cameras
        this.createSkybox();  // Add a skybox to the scene
        this.createGraph(this.graph.rootNode, this.graphGroup);  // Create the scene graph

        // Update GUI with available cameras and lights
        this.app.gui.setCamerasAndLightsInterface(Object.keys(this.cameras), this.lights);
        this.app.gui.setWireframeInterface();  // Add wireframe toggling interface
        this.app.scene.add(this.graphGroup);  // Add the entire graph to the scene
    }

    // Toggle the visibility of the axis helper
    toggleAxis() {
        this.axis.visible = !this.axis.visible;  // Toggle between visible and hidden
    }

    update() {
    }
}

export { MyContents };