import * as THREE from "three";

export function createHologramMaterial(color: string, options?: { wireframe?: boolean }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uOpacity: { value: 0.72 },
      uHighlight: { value: 0 },
      uWireframe: { value: options?.wireframe ? 1 : 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uHighlight;
      uniform float uWireframe;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.8);
        float scan = sin((vUv.y * 120.0) - uTime * 3.5) * 0.5 + 0.5;
        scan = smoothstep(0.35, 1.0, scan) * 0.15;
        float grid = step(0.92, fract(vUv.x * 24.0)) + step(0.92, fract(vUv.y * 24.0));
        grid = clamp(grid, 0.0, 1.0) * 0.08;

        vec3 base = uColor * (0.35 + fresnel * 0.85 + uHighlight * 0.4);
        base += vec3(0.1, 0.35, 0.45) * fresnel;
        base += scan;
        base += grid;

        float alpha = uOpacity * (0.25 + fresnel * 0.75) + uHighlight * 0.2;
        if (uWireframe > 0.5) {
          float edge = fresnel * 0.9 + 0.1;
          alpha = edge * 0.85;
        }
        gl_FragColor = vec4(base, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createSolidMaterial(color: string, metalness = 0.6, roughness = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    envMapIntensity: 1.2,
  });
}
