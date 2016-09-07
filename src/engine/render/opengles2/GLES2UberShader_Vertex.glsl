
attribute vec3 a_position;

#ifdef SHADER_HAS_COLOR_ATTRIBUTE
 attribute vec4 a_color;
 varying vec4 v_color;
#endif

#ifdef SHADER_HAS_LIGHTING
 attribute vec3 a_normal;
 attribute vec3 a_tangent;
 attribute vec3 a_bitangent;
#endif

#ifdef SHADER_HAS_TEXCOORD0_ATTRIBUTE
 attribute vec2 a_texCoord0;
 varying vec2 v_texCoord0;
#endif

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

void main()
{
    #ifdef SHADER_HAS_COLOR_ATTRIBUTE
    v_color = a_color;
    #endif

    #ifdef SHADER_HAS_TEXCOORD0_ATTRIBUTE
    v_texCoord0 = a_texCoord0;
    #endif

    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}
