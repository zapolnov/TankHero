
attribute vec3 a_position;

#ifdef SHADER_HAS_COLOR_ATTRIBUTE
 attribute vec4 a_color;
 varying vec4 v_color;
#endif

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

void main()
{
    #ifdef SHADER_HAS_COLOR_ATTRIBUTE
    v_color = a_color;
    #endif

    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}
