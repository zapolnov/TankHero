#include "GLES2UberShader.h"
#include <sstream>
#include <iostream>
#include <cassert>

GLES2UberShader::GLES2UberShader()
{
}

GLES2UberShader::~GLES2UberShader()
{
}

void GLES2UberShader::use() const
{
    GLES2ShaderProgram::use();
}

void GLES2UberShader::load(const std::unordered_map<std::string, std::string>& sources, Key key)
{
    std::stringstream ss;
    if (key & HasColorAttribute)
        ss << "#define SHADER_HAS_COLOR_ATTRIBUTE\n";
    if (key & (HasDiffuseMap | HasSpecularMap | HasNormalMap))
        ss << "#define SHADER_HAS_TEXCOORD0_ATTRIBUTE\n";
    if (key & HasLighting)
        ss << "#define SHADER_HAS_LIGHTING\n";
    if (key & HasDiffuseMap)
        ss << "#define SHADER_HAS_DIFFUSE_MAP\n";
    if (key & HasNormalMap)
        ss << "#define SHADER_HAS_NORMAL_MAP\n";
    if (key & HasSpecularMap)
        ss << "#define SHADER_HAS_SPECULAR_MAP\n";
    if (key & AcceptsShadow)
        ss << "#define SHADER_ACCEPTS_SHADOW\n";
    if (key & WritesShadowMap)
        ss << "#define SHADER_WRITES_SHADOWMAP\n";
    std::string prefix = ss.str();

    auto vertexShader = sources.find("GLES2UberShader_Vertex.glsl");
    std::string vertexSource = (vertexShader != sources.end() ? vertexShader->second : std::string());

    auto fragmentShader = sources.find("GLES2UberShader_Fragment.glsl");
    std::string fragmentSource = (fragmentShader != sources.end() ? fragmentShader->second : std::string());

    GLES2ShaderProgram::init(prefix + vertexSource, prefix + fragmentSource);

    mProjectionMatrixUniform = getUniformLocation("u_projection");
    mViewMatrixUniform = getUniformLocation("u_view");
    mModelMatrixUniform = getUniformLocation("u_model");
    mAmbientColorUniform = getUniformLocation("u_materialAmbient");
    mDiffuseColorUniform = getUniformLocation("u_materialDiffuse");
    mSpecularColorUniform = getUniformLocation("u_materialSpecular");
    mShininessUniform = getUniformLocation("u_shininess");
    mOpacityUniform = getUniformLocation("u_opacity");
    mDiffuseMapUniform = getUniformLocation("u_diffuseMap");
    mNormalMapUniform = getUniformLocation("u_normalMap");
    mSpecularMapUniform = getUniformLocation("u_specularMap");
    mShadowMapUniform = getUniformLocation("u_shadowMap");
    mShadowProjectionUniform = getUniformLocation("u_shadowProjection");
    mLightPositionUniform = getUniformLocation("u_lightPosition");
    mLightColorUniform = getUniformLocation("u_lightColor");
    mLightPowerUniform = getUniformLocation("u_lightPower");

    mPositionAttribute = getAttribLocation("a_position");
    mTexCoord0Attribute = getAttribLocation("a_texCoord0");
    mColorAttribute = getAttribLocation("a_color");
    mNormalAttribute = getAttribLocation("a_normal");
    mTangentAttribute = getAttribLocation("a_tangent");
    mBitangentAttribute = getAttribLocation("a_bitangent");
}
