import * as THREE from "three";

class MyRoute {
    constructor(app, initialPosition) {
        this.app = app;
        this.initialPosition = initialPosition;

        this.keyPointsBlue = [
            new THREE.Vector3(21, 5, -15),
            new THREE.Vector3(21, 6, -25),
            new THREE.Vector3(22, 15, -98),
            new THREE.Vector3(-9, 5, -97),
            new THREE.Vector3(-22, 17, -36),
            new THREE.Vector3(-51, 8, -42),
            new THREE.Vector3(-47, 11, -22),
            new THREE.Vector3(-18, 13, -22),
            new THREE.Vector3(-18, 13, 0),
            new THREE.Vector3(-75, 13, 0),
            new THREE.Vector3(-75, 15, 20),
            new THREE.Vector3(0, 15, 20),
            new THREE.Vector3(20, 8, 50),
            new THREE.Vector3(40, 8, 50),
            new THREE.Vector3(72, 8, 45),
            new THREE.Vector3(72, 9, 0),
            new THREE.Vector3(22, 9, 0),
            new THREE.Vector3(21, 5, -15)
        ];
        
        this.keyPointsRed = [
            new THREE.Vector3(27, 5, -15),
            new THREE.Vector3(27, 12, -25),
            new THREE.Vector3(25, 17, -98),
            new THREE.Vector3(-9, 11, -97),
            new THREE.Vector3(-22, 14, -36),
            new THREE.Vector3(-51, 11, -42),
            new THREE.Vector3(-47, 13, -22),
            new THREE.Vector3(-18, 15, -22),
            new THREE.Vector3(-18, 7, 0),
            new THREE.Vector3(-75, 8, 0),
            new THREE.Vector3(-75, 9, 20),
            new THREE.Vector3(0, 15, 20),
            new THREE.Vector3(20, 16, 50),
            new THREE.Vector3(40, 18, 50),
            new THREE.Vector3(72, 12, 45),
            new THREE.Vector3(72, 7, -5),
            new THREE.Vector3(25, 6, -5),
            new THREE.Vector3(27, 5, -15)
        ];

        this.setupKeyFrames();
    }


    setupKeyFrames() {

        this.keyframes = [];

        this.points = null;

        if(this.initialPosition == "BLUE"){
            this.points = this.keyPointsBlue;
        } else if(this.initialPosition == "RED"){
            this.points = this.keyPointsRed;
        }

        for (let i = 0; i < this.points.length; i++) {
            this.keyframes.push({time: 200*i, value: this.points[i]});
        }

        this.spline = new THREE.CatmullRomCurve3(this.keyframes.map(kf => kf.value));
    }

}

export { MyRoute };
