/**
 vec2 uv = fragCoord.xy / iResolution.xy;
 float timewav = mod(iGlobalTime,1.0);



 vec2 position = iMouse.xy / iResolution.xy;

 float invAr = iResolution.y / iResolution.x;

 float dist = distance(uv,position);



 float frequency = 0.5+ (iGlobalTime);

 float sdist = 0.5 + dist *  sin(frequency * dist + iGlobalTime * 20.);
 //fragColor = vec4(sdist,sdist,sdist,1.);

 vec4 s = texture2D(iChannel0, uv - abs(sdist*.01));

 fragColor = s;
 */

function MyTestFilter(iResolution) {
    PIXI.AbstractFilter.call(this,
        // vertex shader
        null,

        // fragment shader
        [
            ""
        ].join('\n'),

        // custom uniforms
        {
            distance: {type: '1f', value: distance},
            outerStrength: {type: '1f', value: 0},
            innerStrength: {type: '1f', value: 0},
            glowColor: {type: '4f', value: new Float32Array([0, 0, 0, 1])},
            pixelWidth: {type: '1f', value: 0},
            pixelHeight: {type: '1f', value: 0}
        }
    );


}

