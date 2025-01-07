import * as THREE from "three";

// My  Obstacle class
class MyObstacle {
    constructor(app, name, pos, {radius, slices, stacks}, value) {
        this.app = app; // INitializes the app
        this.name = name; // Initializes the name 
        this.x = pos.x; // Initilaizes the position in x
        this.y = pos.y; // Initilaizes the position in y
        this.z = pos.z;// Initilaizes the position in z
        this.radius = radius; // Initilaizes the radius
        this.slices = slices; // Initilaizes the slices
        this.stacks = stacks; // Initilaizes the stacks
        this.value = value; // Initilaizes the value

        //initializes the mesh
        this.mesh = null;

        //calls init function
        this.init();
    }

    init() {
        //Creates sphere goemetry
        const geometry = new THREE.SphereGeometry(this.radius, this.slices, this.stacks);
        //Creates a basic material
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        // Assigns the variable to the newly created mesh
        this.mesh = new THREE.Mesh(geometry, material);
        // Changes the mesh position
        this.mesh.position.set(this.x, this.y, this.z);

        // Add the mesh to the scene
        this.app.scene.add(this.mesh);
    }

    // Function to animate the obstacle
    animate() {
        // Determines the var for animation, to decide if it goes up or down
        let animation = this.value % 2;

        // Changes position to go up
        if(animation == 1){
            if(this.mesh.position.y < 14)
            {
                this.mesh.position.y += 0.05;
            } else {
                this.value = 0;
            }
        } else{  // Changes position to go down
            if(this.mesh.position.y > 2)
            {
                this.mesh.position.y -= 0.05;
            } else {
                this.value = 1;
            }
        }
    }
}

export { MyObstacle };