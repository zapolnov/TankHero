
#pragma once
#include "GLES2ShaderProgram.h"
#include <string>
#include <unordered_map>

class GLES2Shader2D : private GLES2ShaderProgram
{
public:
    GLES2Shader2D();
    ~GLES2Shader2D();

    int projectionMatrixUniform() const { return mProjectionMatrixUniform; }
    int modelMatrixUniform() const { return mModelMatrixUniform; }

    int positionAttribute() const { return mPositionAttribute; }
    int colorAttribute() const { return mColorAttribute; }
    int texCoordAttribute() const { return mTexCoordAttribute; }

    void use() const;

    void load(const std::unordered_map<std::string, std::string>& sources);

private:
    GLuint mVertexShader;
    GLuint mFragmentShader;
    GLuint mProgram;
    int mProjectionMatrixUniform = -1;
    int mModelMatrixUniform = -1;
    int mPositionAttribute = -1;
    int mColorAttribute = -1;
    int mTexCoordAttribute = -1;

    GLES2Shader2D(const GLES2Shader2D&) = delete;
    GLES2Shader2D& operator=(const GLES2Shader2D&) = delete;
};
