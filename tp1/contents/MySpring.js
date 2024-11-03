import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';



class MySpring  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;
    }
    /**
     *
     */
    buildSpring() {

        // Multi color materials in order to create the rainbow spring
        let materials = [
            new THREE.MeshPhongMaterial({color: "#ff0000" }),
            new THREE.MeshPhongMaterial({color: "#ffa500"}),
            new THREE.MeshPhongMaterial({color: "#ffff00"}),
            new THREE.MeshPhongMaterial({color: "#008000"}),
            new THREE.MeshPhongMaterial({color: "#0000ff"}),
            new THREE.MeshPhongMaterial({color: "#4b0082"}),
            new THREE.MeshPhongMaterial({color: "#ee82ee"})
        ];

        let spring = new THREE.Group();
    
        for (let i = 0; i < 28; i++) {

            // Definition of points for two bezier curves, that can be iterated in order to create a spring
            let points = [
                new THREE.Vector3(-1, 0, 0 + 0.6 * i),
                new THREE.Vector3(-1, 4 / 3, 0.1 + 0.6 * i),
                new THREE.Vector3(1, 4 / 3, 0.2 + 0.6 * i),
                new THREE.Vector3(1, 0, 0.3 + 0.6 * i),
                new THREE.Vector3(1, -4 / 3, 0.4 + 0.6 * i),
                new THREE.Vector3(-1, -4 / 3, 0.5 + 0.6 * i),
                new THREE.Vector3(-1, 0, 0.6 + 0.6 * i),
            ];

            let colorMaterial = i%7;
            
            // Circle construction
            const topCircle = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
            const topCirclePoints = topCircle.getPoints(50);
            const topCurvePath = new THREE.CurvePath();
            topCurvePath.add(new THREE.CatmullRomCurve3(topCirclePoints));
            
            // Definition of spring as a tube, to create some width
            const topTubeGeometry = new THREE.TubeGeometry(topCurvePath, 25, 0.075, 8, false);
            const topTubeMesh = new THREE.Mesh(topTubeGeometry, materials[colorMaterial]);
            topTubeMesh.receiveShadow = true;
            topTubeMesh.castShadow = true;
            spring.add(topTubeMesh);
    
            // Circle construction
            const downCircle = new THREE.CubicBezierCurve3(points[3], points[4], points[5], points[6]);
            const downCirclePoints = downCircle.getPoints(50);
            const downCurvePath = new THREE.CurvePath();
            downCurvePath.add(new THREE.CatmullRomCurve3(downCirclePoints));
    
            // Definition of spring as a tube, to create some width
            const downTubeGeometry = new THREE.TubeGeometry(downCurvePath, 25, 0.075, 8, false);
            const downTubeMesh = new THREE.Mesh(downTubeGeometry, materials[colorMaterial]);
            downTubeMesh.receiveShadow = true;
            downTubeMesh.castShadow = true;
            spring.add(downTubeMesh);
        }
    
        spring.position.set(-2, 2.5 + 0.3 / 2, 1.5);
        spring.rotation.x = -Math.PI / 2;
        spring.scale.set(0.1, 0.1, 0.02);
        this.app.scene.add(spring);
    }

}
export { MySpring };