import * as THREE from "three";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js'; 

class MyMinimap {
    constructor(app) {
        this.app = app;
        this.axis = null; 
        this.miniScene = new THREE.Scene(); 
        this.miniScene.background = new THREE.Color(0xCCCCCC); // Set the minimap's background color to light gray.
    }

    // Initializes the minimap's camera
    initMinimapCamera() {
        const size = 50; // Size of the minimap's view.
        const left = -size / 2; // Left boundary of the camera's view.
        const right = size / 2; // Right boundary of the camera's view.
        const top = 15; // Top boundary of the camera's view.
        const bottom = 1; // Bottom boundary of the camera's view.
        const near = 0; // Near clipping plane.
        const far = 100; // Far clipping plane.

        // Create an orthographic camera for the minimap view.
        this.minimapCamera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        this.minimapCamera.position.set(0, 0, 100); // Position the camera above the minimap.
        this.minimapCamera.lookAt(new THREE.Vector3(0, 0, 0)); // Point the camera at the center of the minimap scene.
    }

    // Initializes the renderer for the minimap
    initMinimapRenderer() {
        // Create a WebGLRenderer with antialiasing for smooth edges.
        this.minimapRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.minimapRenderer.setSize(200, 200); // Set the minimap's render size.
        this.minimapRenderer.setClearColor("#000000"); // Set the minimap's background color to black.
        document.body.appendChild(this.minimapRenderer.domElement); // Add the renderer's canvas element to the DOM.

        // Position the minimap in the bottom-right corner of the viewport.
        this.minimapRenderer.domElement.style.position = 'fixed';
        this.minimapRenderer.domElement.style.bottom = '10px';
        this.minimapRenderer.domElement.style.right = '10px';
    }

    // Creates the minimap with a marker and cardinal directions
    createMinimap() {
        // Create a red sphere to act as the minimap marker.
        const geometry = new THREE.SphereGeometry(1, 32, 32); // Sphere geometry with radius 1 and 32 segments.
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Material with a red color.
        this.minimapMarker = new THREE.Mesh(geometry, material); // Create a mesh for the marker.
        this.minimapMarker.scale.set(1, 0.25, 0); // Scale the marker to make it appear flat.
        this.miniScene.add(this.minimapMarker); // Add the marker to the minimap scene.

        this.buildCardinalDirections(); // Add cardinal direction indicators to the minimap.
    }

    buildCardinalDirections() {
        // Create a thin blue bar to represent directional markers.
        const geometry = new THREE.BoxGeometry(100, 0.1, 0); // A flat rectangular box for the bars.
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue material for the bars.

        let cardinals = ['N', 'S', 'E', 'W']; // Array of cardinal direction letters.
        let bar = new THREE.Mesh(geometry, material); // Create the first blue bar.
        bar.position.set(0, 2, 0); // Position the bar at the center.
        this.miniScene.add(bar); // Add the bar to the minimap scene.

        // Loop through each cardinal direction to create additional bars and text.
        for (let i = 0; i < 4; i++) {
            bar = new THREE.Mesh(geometry, material); // Create a new blue bar.
            bar.position.set(0, 5 + 3 * i, 0); // Position the bar at an increasing height.
            this.miniScene.add(bar); // Add the bar to the minimap scene.

            // Add a letter representing the cardinal direction near the bar.
            this.buildLetter(cardinals[i], -20, 6 + 3 * i, 0);
        }
    }

    buildLetter(letter, x, y, z) {
        const fontLoader = new FontLoader(); // Create a new FontLoader instance.

        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            // Create the text geometry using the loaded font.
            const textGeometry = new TextGeometry(letter, {
                font: font, // Set the font for the text.
                size: 1.5, // Set the size of the text.
                curveSegments: 12, // Number of segments for curves in the text.
            });

            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Material with black color for the text.
            const textMesh = new THREE.Mesh(textGeometry, textMaterial); // Create a mesh for the text.

            this.miniScene.add(textMesh); // Add the text mesh to the minimap scene.
            textMesh.position.set(x, y - 3, z); // Position the text at the specified coordinates.
            textMesh.scale.set(3, 1, 0); // Scale the text to make it more prominent.
        });
    }
}

export { MyMinimap };