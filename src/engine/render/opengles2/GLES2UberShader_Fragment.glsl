
#ifdef GL_ES
 #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision mediump high;
 #else
  precision mediump float;
 #endif
#endif

uniform vec3 u_materialAmbient;
uniform vec3 u_materialDiffuse;
uniform vec3 u_materialSpecular;
uniform float u_opacity;
uniform float u_shininess;

#ifdef SHADER_HAS_LIGHTING

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

void main()
{
    vec3 diffuseColor = vec3(u_materialDiffuse);
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

    gl_FragColor = vec4(diffuseColor, opacity);
}
