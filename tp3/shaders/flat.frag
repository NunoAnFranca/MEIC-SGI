uniform sampler2D uTexture;

varying float vDisplacement;
varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = textureColor * vec4(vec3(vDisplacement), 1.0);
}