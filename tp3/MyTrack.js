import * as THREE from "three";
import { MyObstacle } from "./MyObstacle.js";
import { MyPowerUp } from "./MyPowerUp.js"

class CustomSinCurve extends THREE.Curve {

    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = t;
        const ty = 1;
        const tz = 0;

        return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
    }
}

// Class to create MyTrack
class MyTrack {
    constructor(app) {
        this.app = app;

        // curve related attributes
        this.closedCurve = false;
        // number of segments
        this.segments = 250;
        // shows line by default
        this.showLine = false;
        // shows mesh by default
        this.showMesh = true;
        // show wireframe by default
        this.showWireframe = false;
        // Textrue repeat for x
        this.textureRepeatX = 10;
        // texture repeat for y
        this.textureRepeatY = 1;
        // width value
        this.width = 1.2;
        // multipler for track
        this.trackSize = 5;

        // points for the path
        this.path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-5, 0, -5),
            new THREE.Vector3(-5, 0, -20),
            new THREE.Vector3(2, 0, -20),
            new THREE.Vector3(4, 0, -8),
            new THREE.Vector3(10, 0, -8),
            new THREE.Vector3(10, 0, -4),
            new THREE.Vector3(4, 0, -4),
            new THREE.Vector3(4, 0, 0),
            new THREE.Vector3(15, 0, 0),
            new THREE.Vector3(15, 0, 4),
            new THREE.Vector3(0, 0, 4),
            new THREE.Vector3(-4, 0, 10),
            new THREE.Vector3(-8, 0, 10),
            new THREE.Vector3(-15, 0, 10),
            new THREE.Vector3(-15, 0, 0),
            new THREE.Vector3(-5, 0, 0),
            new THREE.Vector3(-5, 0, -5),
        ]);

        // definesn obstacles
        this.obstacles = [];
        // defines powerUps
        this.powerUps = [];
        // defines basReliefGroup
        this.basReliefGroup = new THREE.Group();

        // function to create curve
        this.buildCurve();
        // function to create obstacles
        this.createObstacles();
        // function to create powerups 
        this.createPowerUps();
        // function to create BasRelief
        this.createBasRelief();
    }

    // function to create obstacles
    createObstacles() {
        // number of obstacles
        const obstacleCount = 6;
        // obstacle attributes
        const obstacleSize = { radius: 1, slices: 32, stacks: 32 };

        // creates the multiple  obstacles
        for (let i = 0; i < obstacleCount; i++) {
            const t = ((i / obstacleCount) + 0.2) % 1;
            const position = this.path.getPointAt(t);
            
            //multiples by the tracksize
            position.multiplyScalar(this.trackSize);
            position.y -= 2;

            //applies the rotation as the track
            position.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

            // pushes the obstacle to the array
            this.obstacles.push(new MyObstacle(this.app, `${i}`, position, obstacleSize));
        }
    }

    // function to create powerups
    createPowerUps() {
        // number of powerups
        const powerUpCount = 9;
        // powerup attributes
        const powerUpSize = { radius: 1, slices: 512, stacks: 512 };

        // creates the multiple  powerup
        for (let i = 0; i < powerUpCount; i++) {
            const t = (i / powerUpCount) % 1;
            const position = this.path.getPointAt(t);

            //multiples by the tracksize
            position.multiplyScalar(this.trackSize);
            position.y -= 7;

            //applies the rotation as the track
            position.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

            // pushes the powerUps to the array
            this.powerUps.push(new MyPowerUp(this.app, `${i}`, position, powerUpSize, i%2));
        }
    }

    createBasRelief() {
        // Define the size of the bas-relief and its offset position in the scene.
        const size = { x: 24, y: 36 }; // Width and height of the bas-relief.
        const offset = { x: 70, y: -56, z: -65 }; // Position offset for the bas-relief group.
    
        // Create the geometry and material for the bas-relief plane.
        this.basReliefGeometry = new THREE.PlaneGeometry(size.x, size.y, 1000, 1000); // A detailed plane with subdivisions.
        this.basReliefMaterial = new THREE.MeshBasicMaterial(); // Basic material for the bas-relief (modifiable later).
        this.basRelief = new THREE.Mesh(this.basReliefGeometry, this.basReliefMaterial); // Combine geometry and material into a mesh.
    
        // Add the bas-relief mesh to the group that will hold the bas-relief and its frame.
        this.basReliefGroup.add(this.basRelief);
    
        // Load a wood texture for the frame material.
        const woodTexture = new THREE.TextureLoader().load("./images/textures/wood.jpg");
        this.basReliefFrameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x996d4e, // A wood-like color.
            map: woodTexture // Apply the loaded wood texture to the frame.
        });
    
        // Create the top frame geometry and mesh, then position it above the bas-relief.
        this.basReliefFrameGeometry1 = new THREE.BoxGeometry(size.x + 2, 2, 1); // A rectangular frame slightly larger than the bas-relief.
        this.basReliefFrame1 = new THREE.Mesh(this.basReliefFrameGeometry1, this.basReliefFrameMaterial);
        this.basReliefFrame1.position.set(0, size.y * 0.5, 0.5); // Position the top frame above the plane.
        this.basReliefGroup.add(this.basReliefFrame1); // Add the top frame to the group.
    
        // Create the bottom frame geometry and mesh, then position it below the bas-relief.
        this.basReliefFrameGeometry2 = new THREE.BoxGeometry(size.x + 2, 2, 1);
        this.basReliefFrame2 = new THREE.Mesh(this.basReliefFrameGeometry2, this.basReliefFrameMaterial);
        this.basReliefFrame2.position.set(0, -size.y * 0.5, 0.5); // Position the bottom frame below the plane.
        this.basReliefGroup.add(this.basReliefFrame2);
    
        // Create the right frame geometry and mesh, then position it to the right of the bas-relief.
        this.basReliefFrameGeometry3 = new THREE.BoxGeometry(2, size.y, 1); // A vertical frame matching the height of the bas-relief.
        this.basReliefFrame3 = new THREE.Mesh(this.basReliefFrameGeometry3, this.basReliefFrameMaterial);
        this.basReliefFrame3.position.set(size.x * 0.5, 0, 0.5); // Position the right frame next to the plane.
        this.basReliefGroup.add(this.basReliefFrame3);
    
        // Create the left frame geometry and mesh, then position it to the left of the bas-relief.
        this.basReliefFrameGeometry4 = new THREE.BoxGeometry(2, size.y, 1);
        this.basReliefFrame4 = new THREE.Mesh(this.basReliefFrameGeometry4, this.basReliefFrameMaterial);
        this.basReliefFrame4.position.set(-size.x * 0.5, 0, 0.5); // Position the left frame next to the plane.
        this.basReliefGroup.add(this.basReliefFrame4);
    
        // Set the position, scale, and rotation of the entire bas-relief group.
        this.basReliefGroup.position.set(offset.x, offset.y, offset.z); // Offset the group in the scene.
        this.basReliefGroup.scale.set(0.45, 0.45, 0.45); // Scale down the group for a smaller appearance.
        this.basReliefGroup.rotation.set(0, -Math.PI / 2, 0); // Rotate the group to face the correct direction.
    
        // Add the bas-relief group to the scene.
        this.app.scene.add(this.basReliefGroup);
    }    

    /**
     * Creates the necessary elements for the curve
     */
    buildCurve() {
        this.createCurveMaterialsTextures();
        this.createCurveObjects();
    }

    /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
    createCurveMaterialsTextures() {
        const texture = new THREE.TextureLoader().load("./images/textures/track.jpg");
        texture.wrapS = THREE.RepeatWrapping;

        // creates basic material
        this.material = new THREE.MeshBasicMaterial({ map: texture , transparent:true, opacity: 0.7});
        this.material.name = "track";
        this.material.map.repeat.set(this.textureRepeatX, this.textureRepeatY);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;

        // creates wireframe material
        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            opacity: 0.3,
            wireframe: true,
            transparent: true,
        });

        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    }

    /**
     * Creates the mesh, the line and the wireframe used to visualize the curve
     */
    createCurveObjects() {
        let geometry = new THREE.TubeGeometry(this.path, this.segments, this.width, 3, this.closedCurve);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);

        let points = this.path.getPoints(this.segments);
        let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        this.line = new THREE.Line(bGeometry, this.lineMaterial);

        this.curve = new THREE.Group();

        //toggles mesh visibility
        this.mesh.visible = this.showMesh;
        //toggles wireframe visibility
        this.wireframe.visible = this.showWireframe;
        //toggles line visibility
        this.line.visible = this.showLine;

        this.curve.add(this.mesh);
        this.curve.add(this.wireframe);
        this.curve.add(this.line);

        //rotates the curve
        this.curve.rotateZ(Math.PI);
        //changes scale
        this.curve.scale.set(this.trackSize, 1, this.trackSize);
        // changes position
        this.curve.position.set(0, -1, 0);
        // adds curve to the scene
        this.app.scene.add(this.curve);
    }

    /**
     * Called when user changes mesh visibility. Shows/hides mesh object.
     */
    updateMeshVisibility() {
        this.mesh.visible = this.showMesh;
    }

    /**
     * Called when user changes line visibility. Shows/hides line object.
     */
    updateLineVisibility() {
        this.line.visible = this.showLine;
    }

    /**
     * Called when user changes wireframe visibility. Shows/hides wireframe object.
     */
    updateWireframeVisibility() {
        this.wireframe.visible = this.showWireframe;
    }

    /**
     * Called when user changes number of segments in UI. Recreates the curve's objects accordingly.
     */
    updateCurve() {
        if (this.curve !== undefined && this.curve !== null) {
            this.app.scene.remove(this.curve);
        }

        this.buildCurve();
    }

    /**
     * Called when user curve's closed parameter in the UI. Recreates the curve's objects accordingly.
     */
    updateCurveClosing() {
        if (this.curve !== undefined && this.curve !== null) {
            this.app.scene.remove(this.curve);
        }

        this.buildCurve();
    }

    /**
     * Called when user changes number of texture repeats in UI. Updates the repeat vector for the curve's texture.
     */
    updateTextureRepeat() {
        this.material.map.repeat.set(this.textureRepeatX, this.textureRepeatY);
    }

    update() {
        this.animatePowerUps();
    }
}

export { MyTrack };
