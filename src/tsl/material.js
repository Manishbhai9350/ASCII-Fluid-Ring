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
}) => {
  const material = new MeshBasicNodeMaterial();

  material.positionNode = Fn(() => {
    const aPositions = attribute("aPositions", "vec3");

    return positionLocal.add(aPositions);
  })();

  material.colorNode = Fn(() => {
    const time = timerLocal().mul(0.05);

    const aspect = vec2(1, screenAspect);

    const noiseScale = uniforms.uNoiseScale; // Uniform
    const noiseFactor = uniforms.uNoiseFactor; // Uniform
    const progress = uniforms.uProgress; // Uniform
    const distScale = uniforms.uDistScale; // Uniform
    const distFactor = uniforms.uDistFactor; // Uniform
    const distSpeed = uniforms.uDistSpeed; // Uniform

    const rawScreenUV = attribute("screenUV", "vec2");
    const screenUV = rawScreenUV.add(uv().mul(vec2(invRows, invCols)));

    let len = length(screenUV.sub(0.5) /* .div(aspect) */)
      .div(1 / 2)
      .div(float(2).pow(1 / 2));

    let noiseUV = screenUV.sub(0.5).mul(2).mul(noiseFactor);

    let noisedLen = float(0);

    // ?? Perlin Noise
    noisedLen = simplexNoise2D(noiseUV).mul(noiseScale);

    // ?? Domain Warp Noise
    // noisedLen = domainWarp(noiseUV,warpStrength).mul(noiseScale);

    // ?? Curl Noise |

    // Base -> Perlin Noise
    // noisedLen = length(curlNoise2D(
    //   noiseUV,
    //   perlinNoise
    // )).mul(noiseScale)

    // ?? Ridged Noise |

    // Base -> perlinNoise
    //   noisedLen = ridgedNoise(
    //     noiseUV,
    //     parlinNoise
    //   ).mul(noiseScale)

    // len = len.add(noisedLen)

    // Base -> simplexNoise2d
    //   noisedLen = ridgedNoise(
    //     noiseUV,
    // simplexNoise2D
    //   ).mul(noiseScale)

    // Base -> marble / wood
    // noisedLen = ridgedNoise(noiseUV, marbleNoise).mul(
    //   noiseScale
    // );

    // ?? Marble
    // noisedLen = marbleNoise(noiseUV).mul(noiseScale);

    // ?? FBM |

    // noisedLen = fbm(noiseUV).mul(noiseScale)

    // ?? Base -> Perlin Noise
    // noisedLen = fbmPerlin(noiseUV).mul(noiseScale)

    // ?? Base -> Simplex Noise
    // noisedLen = fbmSimplex2D(noiseUV).mul(noiseScale)

    len = len.add(noisedLen);

    let dist = float(0.05);
    const base = progress;

    // Adding Noise in dist or thickness of the ring;

    const nosiedDist = perlinNoise(
      noiseUV.mul(distFactor).mul(0.1).add(time.mul(distSpeed))
    ).mul(distScale);

    dist = dist.add(nosiedDist);

    const ring1 = smoothstep(base.sub(dist), base, len).mul(step(len, base));
    const ring2 = smoothstep(base, base.add(dist), len)
      .oneMinus()
      .mul(step(base, len));

      
      let color = vec4(170 / 255, 161 / 255, 219 / 255, 1);
      
      const theta = atan2(screenUV.y, screenUV.x);
      
      const opacityDiff = perlinNoise(screenUV.add(progress).mul(100)).mul(10);

      const ring = ring1.add(ring2);
      
    return vec4(ring, ring, ring, 0);
  })();

  return material;
};
