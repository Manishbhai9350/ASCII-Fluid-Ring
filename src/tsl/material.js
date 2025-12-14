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
  lessThan,
  atan2,
  PI2,
} from "three/tsl";
import { mx_noise_vec4 } from "three/tsl";
import { perlinNoise, randomGradient } from "../noise/perlin.js";
import { domainWarp } from "../noise/domain.js";
import { curlNoise2D } from "../noise/curl.js";
import { fbm, fbmPerlin, fbmSimplex2D } from "../noise/fbm.js";
import { simplexNoise2D } from "../noise/simplex.js";
import { marbleNoise } from "../noise/wood.js";
import { ridgedNoise } from "../noise/ridged.js";

export const GetMaterial = ({
  aspect: screenAspect,
  ascii,
  length: asciiLen,
  rows = 0,
  cols = 0,
  uniforms,
  ringTexture,
  asciiTexture: asciiCharTexture,
}) => {
  const material = new MeshBasicNodeMaterial();

  material.positionNode = Fn(() => {
    const aPositions = attribute("aPositions", "vec3");

    return positionLocal.add(aPositions);
  })();

  material.colorNode = Fn(() => {
    const time = timerLocal().mul(0.05);

    const invAspect = vec2(cols, rows);

    // Calculating the correct screenUV as the screen is not just a plane but bunch of squares
    const rawScreenUV = attribute("screenUV", "vec2");
    const aspectedUV = uv().div(invAspect);
    const screenUV = rawScreenUV.add(aspectedUV);

    // Getting the center texture value for each square to show corect character;
    const centeredUV = vec2(0.5, 0.5).div(invAspect).add(rawScreenUV);
    const centerPixelValue = texture(ringTexture, centeredUV).r;

    const asciiChars = float(5);

    const invLength = float(1).div(asciiChars);

    const idx = clamp(
      floor(centerPixelValue.mul(asciiChars)),
      float(0),
      asciiChars.sub(1)
    );

    // idx = mix(idx,1,step(centerPixelValue,invLength.mul(1)))

    const baseOffset = invLength;
    const offset = invLength.mul(idx.sub(1));

    const ring = texture(ringTexture, screenUV);

    const asciiUV = vec2(uv().x.mul(baseOffset).add(offset), uv().y);

    let asciiTexture = texture(asciiCharTexture, asciiUV);
    const opacedAscii = asciiTexture.mul(smoothstep(0, 1, ring.r));

    // Coloring

    let blue = vec4(69, 0, 173, 255).div(255);
    let pink = vec4(0.9, 0.46, 0.87, 1);
    const darkBlue = vec4(54, 1, 133, 255).div(255);
    const darkMaron = vec4(143, 1, 119, 255).div(255);
    let finalColor = mix(blue, vec4(0, 0, 0, 1), ring.r.oneMinus());
    finalColor = mix(finalColor,opacedAscii,centerPixelValue.mul(asciiTexture.r))

    return finalColor;
    // return ring;
    // return vec4(ring.r,ring.r,ring.r,1);
    // return opacedAscii;
    // return vec4(ring.r,0,0,1);
  })();

  return material;
};
