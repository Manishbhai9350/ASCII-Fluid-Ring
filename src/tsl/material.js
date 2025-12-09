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
  attribute,
  positionLocal,
  dot,
} from "three/tsl";
import { mx_noise_vec4 } from "three/tsl";

export const GetMaterial = ({
  aspect,
  ascii,
  length: asciiLen,
  invRows = 0,
  invCols = 0,
}) => {
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

  material.positionNode = Fn(() => {
    const aPositions = attribute("aPositions", "vec3");

    return positionLocal.add(aPositions);
  })();

  material.colorNode = Fn(() => {
    const time = timerLocal().mul(0.2);

    const rawScreenUV = attribute("screenUV", "vec2");
    const screenUV = rawScreenUV.add(uv().mul(vec2(invRows, invCols)));

    const uvNode = rawScreenUV;
    const aUV = vec2(uvNode.x.mul(aspect), uvNode.y);

    const sub = vec2(0.5 * aspect, 0.5);

    const len = length(aUV.sub(sub)).div(
      float(2)
        .pow(1 / 2)
        .mul(0.5)
    );

    // Causing Errors
    // const noise = fbm(vec2(aUV))

    const dist = float(0.2);
    const speed = float(0.5);
    const duration = float(1);
    let base = fract(time.mul(speed)).mul(duration);

    const a = base.add(dist);
    const edge1 = smoothstep(base, a, len).mul(step(len, a));

    const b = a.add(0.1);
    const edge2 = smoothstep(a, b, len).oneMinus().mul(step(len, a).oneMinus());
    const ring = edge1.add(edge2)

    let offsetX = float(0);
    
    for(let i = 0; i < asciiLen - 1; i++) {
      offsetX = smoothstep(
        float(1).div(asciiLen).mul(i),
        float(1).div(asciiLen).mul(float(i).add(1)),
        ring.oneMinus()
      )
    }



    // Showing Correct Character Based On Ring Value 
    const idx = floor(ring.mul(asciiLen))

    offsetX = float(1).div(asciiLen).mul(idx)

    const asciiUV = vec2(
      uv().x.div(asciiLen).add(offsetX),
      uv().y
    );

    let asciiTexture = texture(ascii, asciiUV);

    let color = vec3(170 / 255, 161 / 255, 219 / 255).oneMinus();

    asciiTexture = vec4(
      asciiTexture.rgb.mul(
        dot(color,asciiTexture.rgb)
      ),
      asciiTexture.a
    )

    color = mix(color,asciiTexture,asciiTexture.r).mul(ring).oneMinus()

    // return vec4(offsetX, offsetX, offsetX, 1);
    // return asciiTexture.oneMinus();
    return color;
  })();

  return material;
};
