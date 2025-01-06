import * as THREE from 'three';

class MyFirework {

    constructor(app, scene, posX, posY, posZ) {
        this.app = app;
        this.scene = scene;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;

        this.done = false;
        this.dest = [];
        
        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.points = null;
        this.explodedPoints = null;
        
        this.material = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthTest: false,
        });
        
        this.height = 40;
        this.speed = 60;

        this.launch(); 
    }

    launch() {
        let color = new THREE.Color();
        color.setHSL(THREE.MathUtils.randFloat(0.5, 1), THREE.MathUtils.randFloat(0.5, 1), THREE.MathUtils.randFloat(0.5, 1));
        let colors = [color.r, color.g, color.b];

        let x = THREE.MathUtils.randFloat(-2, 2);
        let y = THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1);
        let z = THREE.MathUtils.randFloat(-2, 2);
        this.dest.push(this.posX + x, this.posY + y, this.posZ + z);
        let vertices = [this.posX, this.posY, this.posZ];

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(this.geometry, new THREE.PointsMaterial({ size: 0.2, color: color, opacity: 1, vertexColors: true, transparent: true, depthTest: false }));
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.app.scene.add(this.points);
    }

    explode(origin, n) {
        let vertices = [];
        let colors = [];
        let velocities = [];
        let initialSpeeds = [];
        let color = new THREE.Color();
        color.setHSL(
            THREE.MathUtils.randFloat(0.1, 0.9),
            THREE.MathUtils.randFloat(0.6, 1.0),
            THREE.MathUtils.randFloat(0.4, 0.7)
        );
    
        this.app.scene.remove(this.points);
        this.points.geometry.dispose();
    
        const initialExplosionSpeed = 0.15;
        
        for (let i = 0; i < n; i++) {
            let theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
            let phi = THREE.MathUtils.randFloat(0, Math.PI);
            
            let x = origin[0];
            let y = origin[1];
            let z = origin[2];
    
            let dirX = Math.sin(phi) * Math.cos(theta);
            let dirY = Math.cos(phi);
            let dirZ = Math.sin(phi) * Math.sin(theta);
    
            let speedVariation = THREE.MathUtils.randFloat(0.98,1.02);
            let speed = initialExplosionSpeed * speedVariation;
    
            let velocityX = dirX * speed;
            let velocityY = dirY * speed;
            let velocityZ = dirZ * speed;
    
            vertices.push(x, y, z);
            colors.push(color.r, color.g, color.b);
            velocities.push(velocityX, velocityY, velocityZ);
            initialSpeeds.push(speed);
        }
    
        this.explodedPoints = {
            vertices,
            velocities,
            colors,
            initialSpeeds,
            gravity: -0.01,
            drag: 0.98,
        };
    
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(
            this.geometry,
            new THREE.PointsMaterial({
                size: 0.1,
                color: color,
                opacity: 1,
                vertexColors: true,
                transparent: true,
                depthTest: false
            })
        );
    
        this.app.scene.add(this.points);
    }

    reset() {
        this.app.scene.remove(this.points);
        this.dest = [];
        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.points = null;
    }

    update() {
        if (this.points && this.geometry) {
            let verticesAtribute = this.geometry.getAttribute('position');
            let vertices = verticesAtribute.array;
            let count = verticesAtribute.count;
    
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] += (this.dest[i] - vertices[i]) / this.speed;
                vertices[i + 1] += (this.dest[i + 1] - vertices[i + 1]) / this.speed;
                vertices[i + 2] += (this.dest[i + 2] - vertices[i + 2]) / this.speed;
            }
            verticesAtribute.needsUpdate = true;
    
            if (count === 1) {
                if (Math.abs(vertices[1] - this.dest[1]) < this.height * 0.05) {
                    this.explode(vertices, 250, this.height * 0.05, this.height * 0.8);
                    return;
                }
            }
    
            if (this.explodedPoints) {
                let { vertices, velocities, colors, gravity, drag } = this.explodedPoints;
                this.explodedPoints.time += 0.016;
    
                for (let i = 0; i < vertices.length; i += 3) {
                    velocities[i] *= drag;
                    velocities[i + 1] *= drag;
                    velocities[i + 2] *= drag;
    
                    velocities[i + 1] += gravity * 0.016; 

                    vertices[i] += velocities[i];
                    vertices[i + 1] += velocities[i + 1];
                    vertices[i + 2] += velocities[i + 2];
                }
    
                this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
                this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
                this.points.geometry.attributes.position.needsUpdate = true;
    
                this.material.opacity -= 0.005;
                this.material.needsUpdate = true;
            }
    
            if (this.material.opacity <= 0) {
                this.reset();
                this.done = true;
                return;
            }
        }
    }
}

export { MyFirework };
