
#pragma once
#include "GLES2ShaderProgram.h"
#include <cstdint>
#include <unordered_map>
#include <string>

class GLES2UberShader : private GLES2ShaderProgram
{
public:
    using Key = uint64_t;
    enum KeyFlag : uint64_t
    {
        HasColorAttribute = 0x0000000000000001,
    };

    GLES2UberShader();
    ~GLES2UberShader();

    int projectionMatrixUniform() const { return mProjectionMatrixUniform; }
    int viewMatrixUniform() const { return mViewMatrixUniform; }
    int modelMatrixUniform() const { return mModelMatrixUniform; }
    int diffuseColorUniform() const { return mDiffuseColorUniform; }

    int positionAttribute() const { return mPositionAttribute; }
    int colorAttribute() const { return mColorAttribute; }

    void use() const;

    void load(const std::unordered_map<std::string, std::string>& sources, Key key);

private:
    GLuint mVertexShader;
    GLuint mFragmentShader;
    GLuint mProgram;
    int mProjectionMatrixUniform = -1;
    int mViewMatrixUniform = -1;
    int mModelMatrixUniform = -1;
    int mDiffuseColorUniform = -1;
    int mPositionAttribute = -1;
    int mColorAttribute = -1;

    GLES2UberShader(const GLES2UberShader&) = delete;
    GLES2UberShader& operator=(const GLES2UberShader&) = delete;
};
