import * as THREE from 'three';

class MyFirework {
    // Constructor for the MyFirework class
    constructor(app, scene, posX, posY, posZ) {
        this.app = app; // Reference to the main application.
        this.scene = scene; // Reference to the Three.js scene.
        this.posX = posX; // Initial x-coordinate position of the firework.
        this.posY = posY; // Initial y-coordinate position of the firework.
        this.posZ = posZ; // Initial z-coordinate position of the firework.

        this.done = false; // Indicates if the firework has completed its lifecycle.
        this.dest = []; // Array to store the destination coordinates for the firework.

        this.vertices = null; // Stores the vertices of the geometry.
        this.colors = null; // Stores the color data for the points.
        this.geometry = null; // Geometry for the firework points.
        this.points = null; // Points object representing the firework.
        this.explodedPoints = null; // Data for exploded firework particles.

        // Material settings for the firework points.
        this.material = new THREE.PointsMaterial({
            size: 0.1, // Size of each point.
            color: 0xffffff, // Default white color.
            opacity: 1, // Full opacity initially.
            vertexColors: true, // Use vertex colors for the points.
            transparent: true, // Enable transparency.
            depthTest: false, // Disable depth testing for the points.
        });

        this.height = 40; // Target height for the firework before it explodes.
        this.speed = 60; // Speed of the firework's ascent.

        this.launch(); // Launch the firework.
    }

    // Launches the firework to a target destination.
    launch() {
        let color = new THREE.Color(); // Create a new color object.
        // Set a random color with varying hue, saturation, and lightness.
        color.setHSL(
            THREE.MathUtils.randFloat(0.5, 1),
            THREE.MathUtils.randFloat(0.5, 1),
            THREE.MathUtils.randFloat(0.5, 1)
        );
        let colors = [color.r, color.g, color.b]; // Convert color to an array of RGB values.

        // Randomize the destination point near the initial position.
        let x = THREE.MathUtils.randFloat(-2, 2);
        let y = THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1);
        let z = THREE.MathUtils.randFloat(-2, 2);
        this.dest.push(this.posX + x, this.posY + y, this.posZ + z); // Store the destination.
        let vertices = [this.posX, this.posY, this.posZ]; // Initial position as vertices.

        // Create geometry and set attributes for the firework points.
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        // Create the points object and add it to the scene.
        this.points = new THREE.Points(
            this.geometry,
            new THREE.PointsMaterial({
                size: 0.2,
                color: color,
                opacity: 1,
                vertexColors: true,
                transparent: true,
                depthTest: false,
            })
        );
        this.points.castShadow = true; // Enable shadow casting.
        this.points.receiveShadow = true; // Enable shadow receiving.
        this.app.scene.add(this.points); // Add points to the scene.
    }

    // Handles the explosion of the firework into smaller particles.
    explode(origin, n) {
        let vertices = []; // Array for particle positions.
        let colors = []; // Array for particle colors.
        let velocities = []; // Array for particle velocities.
        let initialSpeeds = []; // Array for initial particle speeds.

        // Set a random explosion color.
        let color = new THREE.Color();
        color.setHSL(
            THREE.MathUtils.randFloat(0.1, 0.9),
            THREE.MathUtils.randFloat(0.6, 1.0),
            THREE.MathUtils.randFloat(0.4, 0.7)
        );

        this.app.scene.remove(this.points); // Remove the current points object from the scene.
        this.points.geometry.dispose(); // Dispose of the geometry.

        const initialExplosionSpeed = 0.15; // Base speed for particles.

        // Create particles with random directions and velocities.
        for (let i = 0; i < n; i++) {
            let theta = THREE.MathUtils.randFloat(0, Math.PI * 2); // Random angle around y-axis.
            let phi = THREE.MathUtils.randFloat(0, Math.PI); // Random angle from the top.

            let x = origin[0]; // X-coordinate of the origin.
            let y = origin[1]; // Y-coordinate of the origin.
            let z = origin[2]; // Z-coordinate of the origin.

            // Convert spherical coordinates to Cartesian coordinates for direction.
            let dirX = Math.sin(phi) * Math.cos(theta);
            let dirY = Math.cos(phi);
            let dirZ = Math.sin(phi) * Math.sin(theta);

            let speedVariation = THREE.MathUtils.randFloat(0.98, 1.02); // Slight variation in speed.
            let speed = initialExplosionSpeed * speedVariation; // Adjusted speed.

            // Calculate velocity components.
            let velocityX = dirX * speed;
            let velocityY = dirY * speed;
            let velocityZ = dirZ * speed;

            vertices.push(x, y, z); // Add particle position.
            colors.push(color.r, color.g, color.b); // Add particle color.
            velocities.push(velocityX, velocityY, velocityZ); // Add particle velocity.
            initialSpeeds.push(speed); // Store initial speed.
        }

        // Store explosion data for animation.
        this.explodedPoints = {
            vertices,
            velocities,
            colors,
            initialSpeeds,
            gravity: -0.01, // Gravity affecting particles.
            drag: 0.98, // Drag slowing down particles.
        };

        // Create geometry and attributes for exploded particles.
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
                depthTest: false,
            })
        );

        this.app.scene.add(this.points); // Add exploded particles to the scene.
    }

    // Resets the firework to its initial state.
    reset() {
        this.app.scene.remove(this.points); // Remove the points object from the scene.
        this.dest = []; // Clear destination points.
        this.vertices = null; // Clear vertices.
        this.colors = null; // Clear colors.
        this.geometry = null; // Clear geometry.
        this.points = null; // Clear points.
    }

    // Updates the firework and its particles each frame.
    update() {
        if (this.points && this.geometry) {
            let verticesAtribute = this.geometry.getAttribute('position'); // Get position attribute.
            let vertices = verticesAtribute.array; // Access vertex data.
            let count = verticesAtribute.count; // Number of vertices.

            // Move the firework towards its destination.
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] += (this.dest[i] - vertices[i]) / this.speed; // Update x-position.
                vertices[i + 1] += (this.dest[i + 1] - vertices[i + 1]) / this.speed; // Update y-position.
                vertices[i + 2] += (this.dest[i + 2] - vertices[i + 2]) / this.speed; // Update z-position.
            }
            verticesAtribute.needsUpdate = true; // Notify Three.js to update vertex data.

            if (count === 1) {
                // Check if firework has reached its destination height.
                if (Math.abs(vertices[1] - this.dest[1]) < this.height * 0.05) {
                    this.explode(vertices, 250); // Trigger explosion.
                    return;
                }
            }

            if (this.explodedPoints) {
                // Update exploded particles.
                let { vertices, velocities, colors, gravity, drag } = this.explodedPoints;

                for (let i = 0; i < vertices.length; i += 3) {
                    velocities[i] *= drag; // Apply drag to x-velocity.
                    velocities[i + 1] *= drag; // Apply drag to y-velocity.
                    velocities[i + 2] *= drag; // Apply drag to z-velocity.

                    velocities[i + 1] += gravity * 0.016; // Apply gravity to y-velocity.

                    vertices[i] += velocities[i]; // Update x-position.
                    vertices[i + 1] += velocities[i + 1]; // Update y-position.
                    vertices[i + 2] += velocities[i + 2]; // Update z-position.
                }

                // Update geometry attributes with new positions and colors.
                this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
                this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
                this.points.geometry.attributes.position.needsUpdate = true; // Notify update.

                this.material.opacity -= 0.005; // Gradually reduce opacity.
                this.material.needsUpdate = true; // Notify material update.
            }

            // Check if firework is completely faded out.
            if (this.material.opacity <= 0) {
                this.reset(); // Reset the firework.
                this.done = true; // Mark firework as done.
                return;
            }
        }
    }
}

export { MyFirework };
