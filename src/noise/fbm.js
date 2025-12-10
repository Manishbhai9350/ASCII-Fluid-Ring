import { Fn, float, Loop } from 'three/tsl';
import { simplexNoise2D } from './simplex';
import { perlinNoise } from './perlin';

// Uses any base noise function (valueNoise, perlinNoise, etc.)
export const fbm = Fn( ( [ p, baseNoise ] ) => {

    const octaves = 6;
    const lacunarity = 2.0;
    const gain = 0.5;
    
    const value = float( 0 ).toVar();
    const amplitude = float( 0.5 ).toVar();
    const frequency = float( 1 ).toVar();
    
    Loop( octaves, () => {

        // value.addAssign( amplitude.mul( baseNoise( p.mul( frequency ) ) ) );
        frequency.mulAssign( lacunarity );
        amplitude.mulAssign( gain );

    } );
    
    return value;

} );

export const fbmSimplex2D = Fn( ( [ p ] ) => {

    const octaves = 6;
    const lacunarity = 2.0;
    const gain = 0.5;
    
    const value = float( 0 ).toVar();
    const amplitude = float( 0.5 ).toVar();
    const frequency = float( 1 ).toVar();
    
    Loop( octaves, () => {

        value.addAssign( simplexNoise2D( p.mul( frequency ) ) );
        frequency.mulAssign( lacunarity );
        amplitude.mulAssign( gain );

    } );
    
    return value;

} );


export const fbmPerlin = Fn( ( [ p ] ) => {

    const octaves = 6;
    const lacunarity = 2.0;
    const gain = 0.5;
    
    const value = float( 0 ).toVar();
    const amplitude = float( 0.5 ).toVar();
    const frequency = float( 1 ).toVar();
    
    Loop( octaves, () => {

        value.addAssign( perlinNoise(  p.mul( frequency )  ) );
        frequency.mulAssign( lacunarity );
        amplitude.mulAssign( gain );

    } );
    
    return value;

} );
