import * as THREE from "three";
import { MyObstacle } from "./MyObstacle.js";

class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {
		super();
		this.scale = scale;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t;
		const ty = 1;
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
	}
}

class MyTrack {
    constructor(app) {
        this.app = app;

        // curve related attributes
        this.closedCurve = false;
        this.segments = 250;
        this.showLine = true;
        this.showMesh = true;
        this.showWireframe = false;
        this.textureRepeatX = 10;
        this.textureRepeatY = 1;
        this.width = 1.2;
        this.trackSize = 5;

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

        this.obstacles = [];
        
        this.buildCurve();
        this.createObstacles();
    }

    createObstacles() {
        const obstacleCount = 10;
        const obstacleSize = { width: 2, height: 2, depth: 2 };
        const obstacleColor = 0xff0000;

        for (let i = 0; i < obstacleCount; i++) {
            const t = i / (obstacleCount - 1);
            const position = this.path.getPointAt(t);

            position.multiplyScalar(this.trackSize);
            position.y -= 2;

            position.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
            
            this.obstacles.push(new MyObstacle(this.app, position, obstacleSize, obstacleColor));
        }
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

        this.material = new THREE.MeshBasicMaterial({ map: texture });
        this.material.name = "track";
        this.material.map.repeat.set(this.textureRepeatX, this.textureRepeatY);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;

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

        this.mesh.visible = this.showMesh;
        this.wireframe.visible = this.showWireframe;
        this.line.visible = this.showLine;

        this.curve.add(this.mesh);
        this.curve.add(this.wireframe);
        this.curve.add(this.line);

        this.curve.rotateZ(Math.PI);
        this.curve.scale.set(this.trackSize, 1, this.trackSize);
        this.curve.position.set(0, -1, 0);
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
}

export { MyTrack };
