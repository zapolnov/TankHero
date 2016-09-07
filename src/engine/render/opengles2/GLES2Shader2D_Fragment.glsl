
#ifdef GL_ES
 #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision mediump high;
 #else
  precision mediump float;
 #endif
#endif

varying vec4 v_color;
varying vec2 v_texCoord;

void main()
{
    gl_FragColor = v_color;
}
