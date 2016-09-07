
attribute vec2 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_model;

varying vec4 v_color;
varying vec2 v_texCoord;

void main()
{
    v_color = a_color;
    v_texCoord = a_texCoord;
    gl_Position = u_projection * u_model * vec4(a_position, 0.0, 1.0);
}
