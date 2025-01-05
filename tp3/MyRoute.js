import * as THREE from "three";

class MyRoute {
    constructor(app) {
        this.app = app;

        this.keyPointsBlue = [
            new THREE.Vector3(21, 2, -15),
            new THREE.Vector3(21, 3, -25),
            new THREE.Vector3(22, 12, -98),
            new THREE.Vector3(-9, 2, -97),
            new THREE.Vector3(-22, 14, -36),
            new THREE.Vector3(-51, 5, -42),
            new THREE.Vector3(-47, 8, -22),
            new THREE.Vector3(-18, 10, -22),
            new THREE.Vector3(-18, 10, 0),
            new THREE.Vector3(-75, 10, 0),
            new THREE.Vector3(-75, 12, 20),
            new THREE.Vector3(0, 12, 20),
            new THREE.Vector3(20, 5, 50),
            new THREE.Vector3(40, 5, 50),
            new THREE.Vector3(72, 5, 45),
            new THREE.Vector3(72, 6, 0),
            new THREE.Vector3(22, 6, 0),
            new THREE.Vector3(21, 2, -15)
        ];

        this.setupKeyFrames();
    }


    setupKeyFrames() {

        this.keyframes = [];

        for (let i = 0; i < this.keyPointsBlue.length; i++) {
            this.keyframes.push({time:5*i, value:this.keyPointsBlue[i]})
        }

        this.spline = new THREE.CatmullRomCurve3(this.keyframes.map(kf => kf.value));

        const tubeGeometry = new THREE.TubeGeometry(this.spline, 100, 0.01, 10, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff });
        this.tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        this.tubeMesh.position.set(0,0,0);

        this.app.scene.add(this.tubeMesh);

    }

}

export { MyRoute };
