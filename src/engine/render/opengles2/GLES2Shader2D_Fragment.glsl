
#ifdef GL_ES
 #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
 #else
  precision mediump float;
 #endif
#endif

uniform sampler2D u_texture;

varying vec4 v_color;
varying vec2 v_texCoord;

void main()
{
    gl_FragColor = v_color * texture2D(u_texture, v_texCoord);
}
