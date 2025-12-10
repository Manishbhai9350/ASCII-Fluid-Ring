import { Fn, sin } from "three/tsl";
import { fbm } from "./fbm.js";


export const marbleNoise = Fn(([ p ]) => {
  const noiseVal = fbm(p); //  Will Cause Error Because No BaseNoise Provided
  const vein = sin(p.x.mul(10.0).add(noiseVal.mul(20.0)));
  return vein.mul(0.5).add(0.5);
});