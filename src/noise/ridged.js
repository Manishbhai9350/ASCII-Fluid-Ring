import { Fn, float, abs, oneMinus, Loop } from 'three/tsl';

export const ridgedNoise = Fn( ( [ p, baseNoise ] ) => {

    const octaves = 6;
    const lacunarity = 2.0;
    const gain = 0.5;
    
    const value = float( 0 ).toVar();
    const amplitude = float( 0.5 ).toVar();
    const frequency = float( 1 ).toVar();
    const weight = float( 1 ).toVar();
    
    Loop( octaves, () => {

        const n = oneMinus( abs( baseNoise( p.mul( frequency ) ).sub( 0.5 ).mul( 2 ) ) );
        const signal = n.mul( n ).mul( weight );
        
        value.addAssign( signal.mul( amplitude ) );
        weight.assign( signal.clamp( 0, 1 ) );
        
        frequency.mulAssign( lacunarity );
        amplitude.mulAssign( gain );

    } );
    
    return value;

} );