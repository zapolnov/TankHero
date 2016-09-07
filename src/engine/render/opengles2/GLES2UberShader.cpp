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
    std::string prefix = ss.str();

    auto vertexShader = sources.find("GLES2UberShader_Vertex.glsl");
    std::string vertexSource = (vertexShader != sources.end() ? vertexShader->second : std::string());

    auto fragmentShader = sources.find("GLES2UberShader_Fragment.glsl");
    std::string fragmentSource = (fragmentShader != sources.end() ? fragmentShader->second : std::string());

    GLES2ShaderProgram::init(prefix + vertexSource, prefix + fragmentSource);

    mProjectionMatrixUniform = getUniformLocation("u_projection");
    mViewMatrixUniform = getUniformLocation("u_view");
    mModelMatrixUniform = getUniformLocation("u_model");
    mDiffuseColorUniform = getUniformLocation("u_materialDiffuse");

    mPositionAttribute = getAttribLocation("a_position");
    mColorAttribute = getAttribLocation("a_color");
}
