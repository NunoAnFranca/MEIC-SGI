import * as THREE from "three";

class MyRoute {
    constructor(app, initialPosition) {
        // INitilizes the app
        this.app = app;
        // Initializes the initial position to determine the route
        this.initialPosition = initialPosition;

        // Route if initial position is blue
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
        
        // Route if initial position is REd
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
            new THREE.Vector3(72, 12, 48),
            new THREE.Vector3(72, 7, -2),
            new THREE.Vector3(25, 6, -2),
            new THREE.Vector3(27, 5, -15)
        ];

        // Function to create the keyframes
        this.setupKeyFrames();
    }


    setupKeyFrames() {

        //Initializes the keyframes
        this.keyframes = [];

        //Initializes the points
        this.points = null;

        //Changes the points accordying to the initial position
        if(this.initialPosition == "BLUE"){ // IF blue keyPointsBlue are assigned
            this.points = this.keyPointsBlue;
        } else if(this.initialPosition == "RED"){ // IF RED keyPointsRed are assigned
            this.points = this.keyPointsRed;
        }

        // Assigns time and values to the points
        for (let i = 0; i < this.points.length; i++) {
            this.keyframes.push({time: 200*i, value: this.points[i]});
        }

        // Creates a path with the catmullROmCUrve3
        this.spline = new THREE.CatmullRomCurve3(this.keyframes.map(kf => kf.value));
    }

}

export { MyRoute };
