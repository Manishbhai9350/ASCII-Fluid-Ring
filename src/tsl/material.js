import { MeshBasicNodeMaterial, Uniform } from "three/webgpu";
import {
  float,
  If,
  PI,
  color,
  cos,
  instanceIndex,
  Loop,
  mix,
  mod,
  sin,
  instancedArray,
  Fn,
  uint,
  uniform,
  uniformArray,
  hash,
  vec3,
  vec4,
  uv,
  timerLocal,
  fract,
  length,
  smoothstep,
  step,
  vec2,
  mx_fractal_noise_vec2
} from "three/tsl";
import { mx_noise_vec4 } from "three/tsl";

export const GetMaterial = ({ aspect }) => {
  const material = new MeshBasicNodeMaterial();

  const fbm = Fn((pos = vec2(0,0)) => {
    const OCTAVES = 4;

    let value = float(0.0);
    let amplitude = float(0.5);
    let frequency = float(1.0);

    for (let i = 0; i < OCTAVES; i++) {
      value = value.add(mx_fractal_noise_vec2(pos.mul(frequency)).mul(amplitude));

      frequency = frequency.mul(2.0);
      amplitude = amplitude.mul(0.5);
    }

    return value;
  });

  material.colorNode = Fn(() => {
    const time = timerLocal().mul(0.01);

    const uvNode = uv();
    const aUV = vec2(uvNode.x.mul(aspect), uvNode.y);

    const sub = vec2(0.5 * aspect, 0.5);

    
    const len = length(aUV.sub(sub)).div(
        float(2)
        .pow(1 / 2)
        .mul(0.5)
    )

    // Causing Errors
    // const noise = fbm(vec2(aUV))

    const smoothness = float(0.1);
    const dist = float(0.05);
    const base = float(0.3);

    const edge1Fac = vec2(base.add(dist), 0);
    const edge2Fac = vec2(base, 0);

    const edge1 = smoothstep(
      fract(time).add(edge1Fac.x),
      fract(time).add(edge1Fac.x.add(smoothness)),
      len
    ).oneMinus();
    const edge2 = smoothstep(
      fract(time).add(edge2Fac.x),
      fract(time).add(edge2Fac.x.add(smoothness)),
      len
    ).oneMinus();

    const ring = edge1.sub(edge2);

    // return vec4(ring,0, ring.oneMinus(), 1);
    // return vec4(ring, ring, ring, 1);
    return vec4(mx_noise_vec4, 0, 0, 1);
  })();

  return material;
};
