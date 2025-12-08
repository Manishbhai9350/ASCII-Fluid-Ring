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
  mx_fractal_noise_vec2,
  clamp,
  texture,
  floor,
} from "three/tsl";
import { mx_noise_vec4 } from "three/tsl";

export const GetMaterial = ({ aspect, ascii, length: asciiLen }) => {
  const material = new MeshBasicNodeMaterial();

  const fbm = Fn((pos = vec2(0, 0)) => {
    const OCTAVES = 4;

    let value = float(0.0);
    let amplitude = float(0.5);
    let frequency = float(1.0);

    for (let i = 0; i < OCTAVES; i++) {
      value = value.add(
        mx_fractal_noise_vec2(pos.mul(frequency)).mul(amplitude)
      );

      frequency = frequency.mul(2.0);
      amplitude = amplitude.mul(0.5);
    }

    return value;
  });

  material.colorNode = Fn(() => {
    const time = timerLocal().mul(0.2);

    const uvNode = uv();
    const aUV = vec2(uvNode.x.mul(aspect), uvNode.y);

    const sub = vec2(0.5 * aspect, 0.5);

    const len = length(aUV.sub(sub)).div(
      float(2)
        .pow(1 / 2)
        .mul(0.5)
    );

    // Causing Errors
    // const noise = fbm(vec2(aUV))

    const dist = float(0.1);
    const speed = float(0.2);
    const duration = float(1.1);
    let base = fract(time.mul(speed)).mul(duration).add(0.4);

    const a = base.add(dist);
    const edge1 = smoothstep(base, a, len).mul(step(len, a));

    const b = a.add(0.1);
    const edge2 = smoothstep(a, b, len).oneMinus().mul(step(len, a).oneMinus());
    const ring = edge1.add(edge2);

    const asciiUV = vec2(
      uv()
        .x.div(float(asciiLen))
        // .add(floor(ring.mul(asciiLen)).div(asciiLen))
        ,
      uv().y
    );

    let asciiTexture = texture(ascii, asciiUV);

    // return vec4(ring,0, ring.oneMinus(), 1);
    // return vec4(ring, ring, ring, 1);
    // return vec4(ring, ring, ring, 1);
    // asciiTexture = asciiTexture.mul(ring);
    return asciiTexture;
  })();

  return material;
};
