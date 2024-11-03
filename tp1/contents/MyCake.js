import * as THREE from 'three';
import { MyAxis } from '../MyAxis.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

class MyCake {
  /**
   * construct the object
   * @param {MyApp} app The application object
   */
  constructor(app, legHeight, tableThickness) {
        this.app = app;
        this.legHeight = legHeight;
        this.tableThickness = tableThickness;

        //Variable definitions
        this.candleRadius = 0.02;
        this.candleHeight = 0.25;
        this.slicePosition = 1.5;
        this.cakeRadius = 0.5;
        this.cakeThickness = 0.15;
        this.radialSegments = 32;
        this.cakeAngle = 2 * Math.PI - Math.PI / 4;
        this.plateRadius = 0.7;
        this.plateThickness = 0.04;
        this.tableHeight = this.legHeight + this.tableThickness / 2;    

        // Material definitions
        this.materials = {
            brown: new THREE.MeshPhongMaterial({ color: "#3B1D14", specular: "#000000", emissive: "#000000", shininess: 90 }),
            pink: new THREE.MeshPhongMaterial({ color: "#FFC0CB", specular: "#000000", emissive: "#000000", shininess: 90 }),
            plate: new THREE.MeshPhongMaterial({ color: "#D3D3D3", specular: "#000000", emissive: "#000000", shininess: 90 }),
            flame: new THREE.MeshPhongMaterial({ color: "#FFA500", specular: "#111111", emissive: "#FFFF00", shininess: 30, transparent: true, opacity: 0.5 }),
            smallFlame: new THREE.MeshPhongMaterial({ color: "#FF0000", specular: "#FF0000", emissive: "#000000", shininess: 30}),
            base: new THREE.MeshPhongMaterial({ color: "#FFFFFF", specular: "#000000", emissive: "#000000", shininess: 40})
        };

        this.colors = ['brown', 'pink', 'brown'];
    }

    buildCake() {
        const cakeMesh = new THREE.Group();
        
        cakeMesh.receiveShadow = true;
        cakeMesh.castShadow = true;

        cakeMesh.add(this.buildCandles());
        cakeMesh.add(this.buildCakeBase());
        cakeMesh.add(this.buildCakeEnd());
        cakeMesh.add(this.buildPlate());
        cakeMesh.add(this.buildSlice());
        cakeMesh.add(this.buildSlicePlate());

        this.app.scene.add(cakeMesh);
    }

    buildCakeBase() {
        const cake = new THREE.CylinderGeometry(this.cakeRadius, this.cakeRadius, this.cakeThickness, this.radialSegments, 1, false, 0, this.cakeAngle);
        const cakeBaseMesh = new THREE.Group();

        this.colors.forEach((color, i) => {
            const mesh = new THREE.Mesh(cake, this.materials[color]);
            mesh.position.set(0, this.tableHeight + this.plateThickness + this.cakeThickness * (1 + 2 * i) / 2, 0);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            cakeBaseMesh.add(mesh);
        });
        
        return cakeBaseMesh;
    }

    buildCakeEnd() {
		const cakeEnd = new THREE.PlaneGeometry(this.cakeRadius, this.cakeThickness);
        const cakeEndMesh = new THREE.Group();

        this.colors.forEach((color, i) => {
            const endMesh1 = new THREE.Mesh(cakeEnd, this.materials[color]);
            endMesh1.position.set(0, this.tableHeight + this.plateThickness + this.cakeThickness * (1 + 2 * i) / 2, this.cakeRadius / 2);
            endMesh1.rotation.y = -Math.PI / 2;
            cakeEndMesh.add(endMesh1);

            const endMesh2 = new THREE.Mesh(cakeEnd, this.materials[color]);
            endMesh2.position.set(- this.cakeRadius / Math.sqrt(2) / 2, this.tableHeight + this.plateThickness + this.cakeThickness * (1 + 2 * i) / 2, this.cakeRadius / Math.sqrt(2) / 2);
            endMesh2.rotation.y = Math.PI / 4;
            cakeEndMesh.add(endMesh2);
        });
        
        return cakeEndMesh;
    }

    buildCandles() {
        const coneFlame = new THREE.ConeGeometry(this.candleRadius / 2, this.candleHeight / 5, this.radialSegments);
        const candleBase = new THREE.CylinderGeometry(this.candleRadius, this.candleRadius, this.candleHeight, this.radialSegments);
        const candleRope = new THREE.CylinderGeometry(this.candleRadius / 8 ,this.candleRadius / 8, this.candleHeight / 5, this.radialSegments);
        const candleMesh = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({color: "#FFA500", specular: "#111111", emissive: "#000000", shininess: 30});
        const flameSphere = new THREE.SphereGeometry(0.004, 32, 32);

        for (let i = 0; i < 5; i += 1) {
            const candle = new THREE.Object3D();

            let cFlame = new THREE.Mesh(coneFlame, this.materials.flame);
            cFlame.position.set(3 * this.cakeRadius / 5, this.tableHeight + this.plateThickness + this.cakeThickness * 3.5 + this.candleHeight / 1.5, 0);
            cFlame.receiveShadow = true;
            cFlame.castShadow = true;
            candle.add(cFlame);

            let flameLight = new THREE.PointLight(0xffff00, 1, 0);
            flameLight.position.set(3 * this.cakeRadius / 5, this.tableHeight + this.plateThickness + this.cakeThickness * 3.5 + this.candleHeight / 1.5, 0);
            candle.add(flameLight);

            let sphereMesh = new THREE.Mesh(flameSphere, material);
            sphereMesh.position.set(3 * this.cakeRadius / 5, this.tableHeight + this.plateThickness + this.cakeThickness * 3.5 + this.candleHeight / 1.5, 0);
            candle.add(sphereMesh);

            let cSmallFlame = new THREE.Mesh(coneFlame, this.materials.smallFlame);
            cSmallFlame.position.set(3 * this.cakeRadius / 5, this.tableHeight + this.plateThickness + this.cakeThickness * 3.5 + this.candleHeight / 1.5 - this.candleHeight / 20, 0);
            cSmallFlame.scale.set(0.5, 0.5, 0.5);
            candle.add(cSmallFlame);

            let cBase = new THREE.Mesh(candleBase, this.materials.base);
            cBase.position.set(3 * this.cakeRadius / 5, this.tableHeight + this.plateThickness + this.cakeThickness * 3.5, 0);
            cBase.receiveShadow = true;
            cBase.castShadow = true;
            candle.add(cBase);

            let cRope = new THREE.Mesh(candleRope, this.materials.base);
            cRope.position.set(3 * this.cakeRadius / 5, this.tableHeight + this.plateThickness + this.cakeThickness * 3.5 + this.candleHeight / 2, 0);
            cRope.receiveShadow = true;
            cRope.castShadow = true;
            candle.add(cRope);

            candle.rotation.y = -Math.PI/3 + i*(Math.PI/3);

            candleMesh.add(candle);
        }

        return candleMesh;
    }

    buildSlice() {
        const sliceCake = new THREE.CylinderGeometry(this.cakeRadius, this.cakeRadius, this.cakeThickness, this.radialSegments, 1, false, 0, Math.PI / 4);
        const sliceCakeMesh = new THREE.Group();
		const sliceCakeEnd = new THREE.PlaneGeometry(this.cakeRadius, this.cakeThickness);

        this.colors.forEach((color, i) => {
            const sliceMesh = new THREE.Mesh(sliceCake, this.materials[color]);
            sliceMesh.position.set(0,this.cakeThickness * (1 + 2 * i) / 2, 0);
            sliceMesh.receiveShadow = true;
            sliceMesh.castShadow = true;
            sliceCakeMesh.add(sliceMesh);

            const firstEndSliceMesh = new THREE.Mesh(sliceCakeEnd, this.materials[color]);
            firstEndSliceMesh.position.set(0,this.cakeThickness * (1 + 2 * i) / 2, this.cakeRadius / 2);
            firstEndSliceMesh.rotation.y = -Math.PI / 2;
            firstEndSliceMesh.receiveShadow = true;
            firstEndSliceMesh.castShadow = true;
            sliceCakeMesh.add(firstEndSliceMesh);

            const secondEndSliceMesh = new THREE.Mesh(sliceCakeEnd, this.materials[color]);
            secondEndSliceMesh.position.set(this.cakeRadius / Math.sqrt(2) / 2,this.cakeThickness * (1 + 2 * i) / 2, this.cakeRadius / Math.sqrt(2) / 2);
            secondEndSliceMesh.rotation.y = (3*Math.PI) / 4;
            secondEndSliceMesh.receiveShadow = true;
            secondEndSliceMesh.castShadow = true;
            sliceCakeMesh.add(secondEndSliceMesh);
        });

        sliceCakeMesh.position.set(this.slicePosition - this.cakeRadius / 2, this.tableHeight + this.plateThickness, this.slicePosition / 2 - this.cakeRadius / 2);
        sliceCakeMesh.rotation.z = Math.PI / 2;
        sliceCakeMesh.rotation.y = Math.PI / 2;
        sliceCakeMesh.receiveShadow = true;
        sliceCakeMesh.castShadow = true;

        return sliceCakeMesh;
    }

    buildPlate() {
        const plate = new THREE.CylinderGeometry(this.plateRadius, this.plateRadius, this.plateThickness, this.radialSegments);
        const plateMesh = new THREE.Mesh(plate, this.materials.plate);

        plateMesh.position.set(0, this.tableHeight + this.plateThickness / 2, 0);
        
        return plateMesh;
    }

    buildSlicePlate() {
        const slicePlate = new THREE.CylinderGeometry(3 * this.plateRadius / 5, 3 * this.plateRadius / 5, this.plateThickness, this.radialSegments);
        const slicePlateMesh = new THREE.Mesh(slicePlate, this.materials.plate);

        slicePlateMesh.position.set(this.slicePosition, this.tableHeight + this.plateThickness / 2, this.slicePosition / 2);
        
        return slicePlateMesh;
    }
}

export { MyCake };