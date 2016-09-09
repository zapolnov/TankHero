#include "GLES2Shader2D.h"
#include <sstream>
#include <iostream>
#include <cassert>

GLES2Shader2D::GLES2Shader2D()
{
}

GLES2Shader2D::~GLES2Shader2D()
{
}

void GLES2Shader2D::use() const
{
    GLES2ShaderProgram::use();
}

void GLES2Shader2D::load(const std::unordered_map<std::string, std::string>& sources)
{
    auto vertexShader = sources.find("GLES2Shader2D_Vertex.glsl");
    std::string vertexSource = (vertexShader != sources.end() ? vertexShader->second : std::string());

    auto fragmentShader = sources.find("GLES2Shader2D_Fragment.glsl");
    std::string fragmentSource = (fragmentShader != sources.end() ? fragmentShader->second : std::string());

    GLES2ShaderProgram::init(vertexSource, fragmentSource);

    mProjectionMatrixUniform = getUniformLocation("u_projection");
    mModelMatrixUniform = getUniformLocation("u_model");
    mTextureUniform = getUniformLocation("u_texture");

    mPositionAttribute = getAttribLocation("a_position");
    mColorAttribute = getAttribLocation("a_color");
    mTexCoordAttribute = getAttribLocation("a_texCoord");
}
