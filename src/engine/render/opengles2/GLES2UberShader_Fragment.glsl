
#ifdef GL_ES
 #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision mediump high;
 #else
  precision mediump float;
 #endif
#endif

uniform vec4 u_materialDiffuse;

#ifdef SHADER_HAS_COLOR_ATTRIBUTE
 varying vec4 v_color;
#endif

void main()
{
    vec4 color = u_materialDiffuse;

  #ifdef SHADER_HAS_COLOR_ATTRIBUTE
    color = v_color * color;
  #endif

    gl_FragColor = color;
}
