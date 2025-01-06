uniform sampler2D uNormalTexture;
uniform sampler2D uGrayScaleTexture;

varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(uNormalTexture, vUv);
    gl_FragColor = textureColor;
}