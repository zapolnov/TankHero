
attribute vec3 a_position;

#ifdef SHADER_HAS_COLOR_ATTRIBUTE
 attribute vec4 a_color;
 varying vec4 v_color;
#endif

#ifdef SHADER_HAS_LIGHTING
 attribute vec3 a_normal;
 attribute vec3 a_tangent;
 attribute vec3 a_bitangent;
 uniform vec3 u_lightPosition;
 varying vec3 v_tangentSpaceLightDirection;
 varying vec3 v_tangentSpaceNormal;
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

  #ifdef SHADER_ACCEPTS_SHADOW
    vec3 worldSpaceVertexPosition = vec3(u_model * vec4(a_position, 1.0));
    v_shadowCoord = u_shadowProjection * vec4(worldSpaceVertexPosition, 1.0);
  #endif

  #ifdef SHADER_HAS_LIGHTING
   #ifndef SHADER_ACCEPTS_SHADOW
    vec3 worldSpaceVertexPosition = vec3(u_model * vec4(a_position, 1.0));
   #endif

    mat4 modelview = u_view * u_model;
    vec3 cameraSpaceVertexPosition = vec3(modelview * vec4(a_position, 1.0));

    vec3 cameraSpaceLightDirection = -normalize(vec3(u_view * vec4(u_lightPosition, 0.0)));

    mat3 mv3x3 = mat3(
        vec3(modelview[0]),
        vec3(modelview[1]),
        vec3(modelview[2]));

    vec3 cameraSpaceVertexTangent = mv3x3 * a_tangent;
    vec3 cameraSpaceVertexBitangent = mv3x3 * a_bitangent;
    vec3 cameraSpaceVertexNormal = mv3x3 * a_normal;
    mat3 tbn = mat3(
        vec3(cameraSpaceVertexTangent.x, cameraSpaceVertexBitangent.x, cameraSpaceVertexNormal.x),
        vec3(cameraSpaceVertexTangent.y, cameraSpaceVertexBitangent.y, cameraSpaceVertexNormal.y),
        vec3(cameraSpaceVertexTangent.z, cameraSpaceVertexBitangent.z, cameraSpaceVertexNormal.z));

    v_tangentSpaceNormal = normalize(tbn * cameraSpaceVertexNormal);
    v_tangentSpaceLightDirection = normalize(tbn * cameraSpaceLightDirection);

    gl_Position = u_projection * vec4(cameraSpaceVertexPosition, 1.0);
  #else
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
  #endif
}
