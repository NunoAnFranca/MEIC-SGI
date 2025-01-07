import * as THREE from 'three'; 

class MyShader {
    constructor(app, name, description = "no description provided", vert_url, frag_url, uniformValues = null) {
        this.app = app; // Reference to the main application.
        this.name = name; // Name of the shader for identification purposes.
        this.description = description; // Description of the shader, with a default value if not provided.
        this.vert_url = vert_url; // URL to the vertex shader source code.
        this.frag_url = frag_url; // URL to the fragment shader source code.
        this.uniformValues = uniformValues; // Uniform values to be passed to the shader.
        this.material = null; // Placeholder for the ShaderMaterial that will be created.
        this.ready = false; // Indicates whether the shader has been successfully built.

        // Start loading the vertex and fragment shaders.
        this.read(vert_url, true); // Load the vertex shader.
        this.read(frag_url, false); // Load the fragment shader.
    }

    
    updateUniformsValue(key, value) {
        // Check if the uniform exists in the uniformValues object.
        if (this.uniformValues[key] === null || this.uniformValues[key] === undefined) {
            console.error("shader does not have uniform " + key); // Log an error if the uniform is missing.
            return;
        }

        // Update the uniform's value in the uniformValues object.
        this.uniformValues[key].value = value;

        // If the ShaderMaterial has been created, update its uniform as well.
        if (this.material !== null) {
            this.material.uniforms[key].value = value;
        }
    }

    read(theUrl, isVertex) {
        let xmlhttp = null; 

        // Create an XMLHttpRequest object based on browser compatibility.
        if (window.XMLHttpRequest) { // For modern browsers.
            xmlhttp = new XMLHttpRequest();
        } else { // For older versions of Internet Explorer.
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        let obj = this; // Store a reference to the current object for use in the callback.

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) { // Check if the request is complete and successful.

                if (isVertex) { // If the shader is a vertex shader.
                    console.log("loaded vs " + theUrl); // Log the successful loading of the vertex shader.
                    obj.vertexShader = xmlhttp.responseText; // Store the vertex shader source code.
                } else { // If the shader is a fragment shader.
                    console.log("loaded fs " + theUrl); // Log the successful loading of the fragment shader.
                    obj.fragmentShader = xmlhttp.responseText; // Store the fragment shader source code.
                }

                obj.buildShader.bind(obj)(); // Attempt to build the shader once the source code is loaded.
            }
        };

        // Open the XMLHttpRequest with a GET request to the specified URL.
        xmlhttp.open("GET", theUrl, true);
        xmlhttp.send(); // Send the request.
    }

    buildShader() {
        // Check if both the vertex and fragment shaders have been loaded.
        if (this.vertexShader !== undefined && this.fragmentShader !== undefined) {
            // Create a ShaderMaterial using the loaded shaders and uniform values.
            this.material = new THREE.ShaderMaterial({
                uniforms: (this.uniformValues !== null ? this.uniformValues : {}), // Use provided uniforms or an empty object.
                vertexShader: this.vertexShader, // Set the vertex shader source code.
                fragmentShader: this.fragmentShader, // Set the fragment shader source code.
                wireframe: false // Disable wireframe mode by default.
            });

            // Log that the shader has been successfully built.
            console.log("built shader from " + this.vert_url + ", " + this.frag_url);
            this.ready = true; // Mark the shader as ready for use.
        }
    }

    hasUniform(key) {
        return this.uniformValues[key] !== undefined; // Check if the uniform exists in the uniformValues object.
    }
}
export { MyShader }; 
