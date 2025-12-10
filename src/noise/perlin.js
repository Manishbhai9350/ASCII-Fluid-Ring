import { Fn, vec2, vec4, float, floor, fract, sin, cos, dot, mix } from 'three/tsl';

export const randomGradient = Fn( ( [ p ] ) => {

    const angle = fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ).mul( 43758.5453 ) ).mul( Math.PI * 2 );
    return vec2( cos( angle ), sin( angle ) );

} );

export const perlinNoise = Fn( ( [ p ] ) => {

    const i = floor( p ).toVar();
    const f = fract( p ).toVar();
    
    const u = f.mul( f ).mul( float( 3 ).sub( f.mul( 2 ) ) );
    
    const g00 = randomGradient( i );
    const g10 = randomGradient( i.add( vec2( 1, 0 ) ) );
    const g01 = randomGradient( i.add( vec2( 0, 1 ) ) );
    const g11 = randomGradient( i.add( vec2( 1, 1 ) ) );
    
    const d00 = dot( g00, f );
    const d10 = dot( g10, f.sub( vec2( 1, 0 ) ) );
    const d01 = dot( g01, f.sub( vec2( 0, 1 ) ) );
    const d11 = dot( g11, f.sub( vec2( 1, 1 ) ) );
    
    return mix( mix( d00, d10, u.x ), mix( d01, d11, u.x ), u.y ).add( 0.5 );

} );