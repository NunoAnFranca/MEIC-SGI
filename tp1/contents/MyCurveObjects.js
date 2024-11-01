import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';



class MyCurveObjects  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app,roomWidth) {
        this.app = app;
        this.roomWidth = roomWidth;
    }

    buildBeetle(){
        const materialBeetle = new THREE.LineBasicMaterial({color: "#000000"});

        for(let i = 0; i<30;i++){

            let beetle = new THREE.Group();
            let points = [
                new THREE.Vector3(-2,0,0),                                      // Left wheel & Left hull
                new THREE.Vector3(-2,0.75*(4/3),0),                             // Left wheel
                new THREE.Vector3(-0.5,0.75*(4/3),0),                           // Left wheel
                new THREE.Vector3(-0.5,0,0),                                    // Left wheel
                new THREE.Vector3(-2,2*(4/3)*(Math.sqrt(2)-1),0),               // Left hull
                new THREE.Vector3(-2*(4/3)*(Math.sqrt(2)-1),2,0),               // Left hull
                new THREE.Vector3(0,2,0),                                       // Left hull & Right top hull
                new THREE.Vector3((4/3)*(Math.sqrt(2)-1),2,0),                  // Right top hull
                new THREE.Vector3(1,1+(4/3)*(Math.sqrt(2)-1),0),                // Right top hull
                new THREE.Vector3(1,1,0),                                       // Right top hull & Right bottom hull
                new THREE.Vector3(1+(4/3)*(Math.sqrt(2)-1),1,0),                // Right bottom hull
                new THREE.Vector3(2,(4/3)*(Math.sqrt(2)-1),0),                  // Right bottom hull
                new THREE.Vector3(2,0,0),                                       // Right bottom hull & Right wheel
                new THREE.Vector3(2,0.75*(4/3),0),                              // Right wheel
                new THREE.Vector3(0.5,0.75*(4/3),0),                            // Right wheel
                new THREE.Vector3(0.5,0,0)                                      // Right wheel
            ]
    
            //Left wheel
            const curve1 = new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3]);
            const geometry1 = new THREE.BufferGeometry().setFromPoints(curve1.getPoints(50));
            const curve1Mesh = new THREE.Line(geometry1, materialBeetle);
            beetle.add(curve1Mesh);
    
            //Left hull
            const curve2 = new THREE.CubicBezierCurve3(points[0],points[4], points[5], points[6]);
            const geometry2 = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50));
            const curve2Mesh = new THREE.Line(geometry2, materialBeetle);
            beetle.add(curve2Mesh);
    
            // Right top hull
            const curve3 = new THREE.CubicBezierCurve3(points[6],points[7], points[8], points[9]);
            const geometry3 = new THREE.BufferGeometry().setFromPoints(curve3.getPoints(50)); 
            const curve3Mesh = new THREE.Line(geometry3, materialBeetle);
            beetle.add(curve3Mesh);
    
            // Right bottom hull
            const curve4 = new THREE.CubicBezierCurve3(points[9],points[10], points[11], points[12]);
            const geometry4 = new THREE.BufferGeometry().setFromPoints(curve4.getPoints(50)); 
            const curve4Mesh = new THREE.Line(geometry4, materialBeetle);
            beetle.add(curve4Mesh);
    
            // Right wheel
            const curve5 = new THREE.CubicBezierCurve3(points[12],points[13], points[14], points[15]);
            const geometry5 = new THREE.BufferGeometry().setFromPoints(curve5.getPoints(50)); 
            const curve5Mesh = new THREE.Line(geometry5, materialBeetle);
            beetle.add(curve5Mesh);
    
            beetle.scale.set(0.5,0.5,0.5);
            beetle.position.set(5,5.5-i*0.002,this.roomWidth/2-0.15);
            beetle.rotation.y = Math.PI;
            this.app.scene.add(beetle);

        }
    }

    // 
    buildFlower(){
        const materials = {
            center: new THREE.LineBasicMaterial({color: "#4CF038"}),
            petals: new THREE.LineBasicMaterial({color: "#FF1D8D"})
        }
        
        for(let num = 0; num < 30; num++){
            let flower = new THREE.Group();
        
            let pointsCircle = [
                new THREE.Vector3(-1, 0,  0),
                new THREE.Vector3(-1, (4/3), 0),
                new THREE.Vector3(1, (4/3), 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(-1, -(4/3), 0),
                new THREE.Vector3(1, -(4/3), 0)
            ];
            
            const topCircle = new THREE.CubicBezierCurve3(pointsCircle[0], pointsCircle[1], pointsCircle[2], pointsCircle[3]);
            const topCircleGeometry = new THREE.BufferGeometry().setFromPoints(topCircle.getPoints(50));
            const topCircleMesh = new THREE.Line(topCircleGeometry, materials.center);
            flower.add(topCircleMesh);

            const downCircle = new THREE.CubicBezierCurve3(pointsCircle[0],pointsCircle[4],pointsCircle[5], pointsCircle[3]);
            const downCircleGeometry = new THREE.BufferGeometry().setFromPoints(downCircle.getPoints(50));
            const downCircleMesh = new THREE.Line(downCircleGeometry, materials.center);
            flower.add(downCircleMesh);
            
            //draw petals
            for(let i = 0; i < 12; i++){
                
                let angle = i*Math.PI/6;
                
                let points = [
                    new THREE.Vector3(Math.cos(Math.PI/2 - angle),Math.sin(Math.PI/2 + angle),0), // DONE
                    new THREE.Vector3(Math.cos(Math.PI/2 - angle)+0.2*Math.cos(Math.PI/2- angle),Math.sin(Math.PI/2+ angle)+0.2*Math.sin(Math.PI/2+ angle),0), // DONE
                    new THREE.Vector3(-3*Math.cos(5*(Math.PI/12) + angle),3*Math.sin(5*(Math.PI/12) +angle ),0), // DONE
                    new THREE.Vector3(-3*Math.cos(5*(Math.PI/12) + angle)+(Math.cos(Math.PI/6+angle)),3*Math.sin(5*(Math.PI/12)+ angle)-(Math.sin(Math.PI/6+angle)),0), // DONE
                    new THREE.Vector3(-Math.cos(Math.PI/3+angle),Math.sin(Math.PI/3+angle),0),
                    new THREE.Vector3(-Math.cos(Math.PI/3+angle)-0.2*Math.sin(Math.PI/6+angle),Math.sin(Math.PI/3+angle)-0.2*Math.cos(Math.PI/6+angle),0),
                    new THREE.Vector3(-3*Math.cos(5*(Math.PI/12)+ angle)-Math.sin(Math.PI/6+ angle),3*Math.sin(5*(Math.PI/12)+ angle)-Math.cos(Math.PI/6+ angle),0)
                ];
                
                const topPetal = new THREE.CubicBezierCurve3(points[0], points[1], points[3], points[2]);
                const topPetalGeometry = new THREE.BufferGeometry().setFromPoints(topPetal.getPoints(50));
                const topPetalMesh = new THREE.Line(topPetalGeometry, materials.petals);
                flower.add(topPetalMesh);

                const bottomPetal = new THREE.CubicBezierCurve3(points[4], points[5], points[6], points[2]);
                const bottomPetalGeometry = new THREE.BufferGeometry().setFromPoints(bottomPetal.getPoints(50));
                const bottomPetalMesh = new THREE.Line(bottomPetalGeometry, materials.petals);
                flower.add(bottomPetalMesh);
            }

            //draw Steem
            let pointsSteem = [
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(1,-2,0),
                new THREE.Vector3(-1,-4,0),
                new THREE.Vector3(0,-6,0),
            ];

            const steem = new THREE.CubicBezierCurve3(pointsSteem[0], pointsSteem[1], pointsSteem[2], pointsSteem[3]);
            const steemGeometry = new THREE.BufferGeometry().setFromPoints(steem.getPoints(50));
            const steemMesh = new THREE.Line(steemGeometry, materials.center);
            flower.add(steemMesh);

            flower.position.set(-5-num*0.001, 6.5,this.roomWidth/2-0.15);
            flower.scale.set(0.25,0.25,0.25);
            this.app.scene.add(flower);
        }
        
    }
}
export { MyCurveObjects };