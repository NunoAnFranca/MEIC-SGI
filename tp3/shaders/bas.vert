uniform sampler2D uNormalTexture;
uniform sampler2D uGrayScaleTexture;
uniform float displacementScale;

varying vec2 vUv;


void main() {
    vUv = uv;

    float displacement = texture2D(uGrayScaleTexture, uv).r;
    float displacementLeft = texture2D(uGrayScaleTexture, uv + vec2(-0.01, 0.0)).r;
    float displacementRight = texture2D(uGrayScaleTexture, uv + vec2(0.01, 0.0)).r;
    displacement = (displacement + displacementLeft + displacementRight) / 3.0;
    displacement *= displacementScale;

    vec3 newPosition = position;
    newPosition.z += displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}