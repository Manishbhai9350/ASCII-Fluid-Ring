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
  invRows = 0,
  invCols = 0,
  uniforms,
  ringTexture
}) => {
  const material = new MeshBasicNodeMaterial();

  material.positionNode = Fn(() => {
    const aPositions = attribute("aPositions", "vec3");

    return positionLocal.add(aPositions);
  })();

  material.colorNode = Fn(() => {
    const time = timerLocal().mul(0.05);

    const invAspect = vec2(invRows, invCols)

    // Calculating the correct screenUV as the screen is not just a plane but bunch of squares
    const rawScreenUV = attribute("screenUV", "vec2");
    const screenUV = rawScreenUV.add(uv().mul(invAspect));


    // Getting the center texture value for each square to show corect character;
    const centeredUV = vec2(.5,.5).mul(invAspect).add(rawScreenUV)
    const centerPixelValue = texture(ringTexture,centeredUV).r;

    const idx = floor(centerPixelValue.mul(asciiLen))

    const baseOffset = float(1).div(asciiLen)
    const offset = float(1).div(asciiLen).mul(idx.sub(1))

    const ring = texture(ringTexture,screenUV)


    const asciiUV = vec2(
      uv().x.mul(baseOffset).add(offset),
      uv().y
    )

    let asciiTexture = texture(ascii,asciiUV)

    const opacedAscii = asciiTexture.mul(smoothstep(.3,.8,ring.r))



    // Coloring 
    let blue = vec4(69, 0, 173,255).div(255);
    let pink = vec4(0.9, 0.46, 0.87, 1);
    const darkBlue = vec4(54, 1, 133,255).div(255)
    const darkMaron = vec4(143, 1, 119,255).div(255)
    let finalColor = mix(blue, vec4(0,0,0,1), ring.r.oneMinus());
    

    finalColor = mix(finalColor,opacedAscii,opacedAscii.r).mul(ring.r)
    
    return finalColor;
  })();

  return material;
};
