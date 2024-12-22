import * as THREE from "three";



class MyMinimap {

    constructor(app) {
        this.app = app;
        this.axis = null;
        this.miniScene = new THREE.Scene();
        this.miniScene.background = new THREE.Color(0xCCCCCC);
    }

    initMinimapCamera() {
        const size = 50; // size of the minimap
        const left = -size / 2;
        const right = size / 2;
        const top = 15;
        const bottom = -1;
        const near = 0;
        const far = 100;
    
        this.minimapCamera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        this.minimapCamera.position.set(0, 0, 100);  // Adjust height as necessary
        this.minimapCamera.lookAt(new THREE.Vector3(0, 0, 0)); // Always look at the center of the scene
    }

    initMinimapRenderer() {
        this.minimapRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.minimapRenderer.setSize(200, 200); // Smaller size for the minimap
        this.minimapRenderer.setClearColor("#000000");
        document.body.appendChild(this.minimapRenderer.domElement);
    
        this.minimapRenderer.domElement.style.position = 'fixed';
        this.minimapRenderer.domElement.style.bottom = '10px';
        this.minimapRenderer.domElement.style.right = '10px';
    }


    createMinimap() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.minimapMarker = new THREE.Mesh(geometry, material);
        this.minimapMarker.scale.set(1,0.35,0);
        this.miniScene.add(this.minimapMarker);

        this.buildCardinalDirections();
    }
    
    buildCardinalDirections(){
        const geometry = new THREE.BoxGeometry(100,0.1,0);
        const material = new THREE.MeshBasicMaterial({color: 0x0000ff});

        for(let i = 0; i< 4; i++){
            let bar = new THREE.Mesh(geometry, material);
            bar.position.set(0, 5 + 3*i,0);
            this.miniScene.add(bar);
        }

        
    }

}

export { MyMinimap };
