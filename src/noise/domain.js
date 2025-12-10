import { Fn, vec2 } from 'three/tsl';
import { simplexNoise2D } from './simplex.js';

export const domainWarp = Fn(([ p,strength ]) => {
  const q = vec2(
    simplexNoise2D(p),
    simplexNoise2D(p.add(vec2(5.2, 1.3)))
  );

  const r = vec2(
    simplexNoise2D(p.add(q.mul(strength)).add(vec2(1.7, 9.2))),
    simplexNoise2D(p.add(q.mul(strength)).add(vec2(8.3, 2.8)))
  );

  return simplexNoise2D(p.add(r.mul(0.5)));
});