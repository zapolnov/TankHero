
#ifdef GL_ES
 #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision mediump high;
 #else
  precision mediump float;
 #endif
#endif

uniform vec3 u_materialDiffuse;
uniform float u_opacity;

#ifdef SHADER_HAS_LIGHTING
 uniform vec3 u_lightColor;
 uniform float u_lightPower;
 uniform vec3 u_materialAmbient;
 uniform vec3 u_materialSpecular;
 uniform float u_shininess;
 varying vec3 v_tangentSpaceLightDirection;
 varying vec3 v_tangentSpaceNormal;
#endif

#ifdef SHADER_HAS_DIFFUSE_MAP
 uniform sampler2D u_diffuseMap;
#endif

#ifdef SHADER_HAS_NORMAL_MAP
 uniform sampler2D u_normalMap;
#endif

#ifdef SHADER_HAS_SPECULAR_MAP
 uniform sampler2D u_specularMap;
#endif

#ifdef SHADER_HAS_TEXCOORD0_ATTRIBUTE
 varying vec2 v_texCoord0;
#endif

#ifdef SHADER_HAS_COLOR_ATTRIBUTE
 varying vec4 v_color;
#endif

#ifdef SHADER_ACCEPTS_SHADOW
 uniform sampler2D u_shadowMap;
 varying vec4 v_shadowCoord;

 float unpack(vec4 colour)
 {
    const vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),
                                1.0 / (256.0 * 256.0),
                                1.0 / 256.0,
                                1);
    return dot(colour, bitShifts);
 }

 float simpleShadow(float bias)
 {
    vec4 shadowMapPosition = (v_shadowCoord / v_shadowCoord.w + 1.0) / 2.0;
    vec4 packedZValue = texture2D(u_shadowMap, shadowMapPosition.xy);
    float distance = unpack(packedZValue);
    return float(distance > shadowMapPosition.z - bias);
 }
#endif

#ifdef SHADER_WRITES_SHADOWMAP
 varying vec4 v_position;

 // from Fabien Sangalard's DEngine
 vec4 pack(float depth)
 {
    const vec4 bitSh = vec4(256.0 * 256.0 * 256.0,
                            256.0 * 256.0,
                            256.0,
                            1.0);

    const vec4 bitMsk = vec4(0,
                             1.0 / 256.0,
                             1.0 / 256.0,
                             1.0 / 256.0);

    vec4 comp = fract(depth * bitSh);
    comp -= comp.xxyz * bitMsk;
    return comp;
 }
#endif

void main()
{
  #ifdef SHADER_WRITES_SHADOWMAP
    float normalizedDistance = v_position.z / v_position.w;
    normalizedDistance = (normalizedDistance + 1.0) / 2.0;
    gl_FragColor = pack(normalizedDistance);
  #else

    vec4 pixelColor;

    /////////////////////////////////////////////////////////////////////////////////////////
    // Diffuse color and opacity

    vec3 diffuseColor = u_materialDiffuse;
    float opacity = u_opacity;

  #ifdef SHADER_HAS_DIFFUSE_MAP
    vec4 diffuseMapColor = texture2D(u_diffuseMap, v_texCoord0);
    diffuseColor *= diffuseMapColor.rgb;
    opacity *= diffuseMapColor.a;
  #endif

  #ifdef SHADER_HAS_COLOR_ATTRIBUTE
    diffuseColor *= v_color.rgb;
    opacity *= v_color.a;
  #endif

    /////////////////////////////////////////////////////////////////////////////////////////
    // Ambient color

  #ifdef SHADER_HAS_LIGHTING
    vec3 ambientColor = u_materialAmbient * diffuseColor;
  #endif

    /////////////////////////////////////////////////////////////////////////////////////////
    // Specular color

  #ifdef SHADER_HAS_LIGHTING
    vec3 specularColor = u_materialSpecular;
   #ifdef SHADER_HAS_SPECULAR_MAP
    specularColor *= texture2D(u_specularMap, v_texCoord0).rgb;
   #endif
  #endif

    /////////////////////////////////////////////////////////////////////////////////////////
    // Calculate shadow

  #ifdef SHADER_ACCEPTS_SHADOW
    float shadowCoeff = 1.0;
    if (v_shadowCoord.w > 0.0) {
        float cosTheta = clamp(dot(v_tangentSpaceLightDirection, v_tangentSpaceNormal), 0.0, 1.0);
        float bias = 0.00005 * tan(acos(cosTheta));
        shadowCoeff = simpleShadow(bias);
        shadowCoeff = (shadowCoeff * 0.4) + 0.6;
    }
  #endif

    /////////////////////////////////////////////////////////////////////////////////////////
    // Lighting

  #ifndef SHADER_HAS_LIGHTING
    pixelColor = vec4(diffuseColor, opacity);
  #else
    vec3 tangentSpaceNormal;
   #ifdef SHADER_HAS_NORMAL_MAP
    tangentSpaceNormal = normalize(texture2D(u_normalMap, v_texCoord0).rgb * 2.0 - 1.0);
   #else
    tangentSpaceNormal = vec3(0.0, 0.0, 1.0);
   #endif

    vec3 finalColor = ambientColor;

    float NdotL = dot(v_tangentSpaceLightDirection, tangentSpaceNormal);
    if (NdotL > 0.0)
        finalColor += diffuseColor * u_lightColor * u_lightPower * NdotL;

    // FIXME: this is shit
    /*
    finalColor += finalColor * u_shininess;
   #ifdef SHADER_ACCEPTS_SHADOW
    if (shadowCoeff > 0.99)
   #endif
        finalColor += specularColor * u_lightColor * u_lightPower * u_shininess;
    */

    pixelColor = vec4(finalColor, opacity);
  #endif

    /////////////////////////////////////////////////////////////////////////////////////////
    // Apply shadow

  #ifdef SHADER_ACCEPTS_SHADOW
    pixelColor *= vec4(vec3(shadowCoeff), 1.0);
  #endif

    /////////////////////////////////////////////////////////////////////////////////////////

    gl_FragColor = pixelColor;
  #endif
}
