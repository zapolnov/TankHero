
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
        HasLighting = 0x0000000000000002,
        HasDiffuseMap = 0x0000000000000004,
        HasNormalMap = 0x0000000000000008,
        HasSpecularMap = 0x0000000000000010,
        AcceptsShadow = 0x0000000000000020,
        WritesShadowMap = 0x0000000000000040,
    };

    GLES2UberShader();
    ~GLES2UberShader();

    int projectionMatrixUniform() const { return mProjectionMatrixUniform; }
    int viewMatrixUniform() const { return mViewMatrixUniform; }
    int modelMatrixUniform() const { return mModelMatrixUniform; }
    int ambientColorUniform() const { return mAmbientColorUniform; }
    int diffuseColorUniform() const { return mDiffuseColorUniform; }
    int specularColorUniform() const { return mSpecularColorUniform; }
    int shininessUniform() const { return mShininessUniform; }
    int opacityUniform() const { return mOpacityUniform; }
    int diffuseMapUniform() const { return mDiffuseMapUniform; }
    int normalMapUniform() const { return mNormalMapUniform; }
    int specularMapUniform() const { return mSpecularMapUniform; }
    int shadowMapUniform() const { return mShadowMapUniform; }
    int shadowProjectionUniform() const { return mShadowProjectionUniform; }
    int lightPositionUniform() const { return mLightPositionUniform; }
    int lightColorUniform() const { return mLightColorUniform; }
    int lightPowerUniform() const { return mLightPowerUniform; }

    int positionAttribute() const { return mPositionAttribute; }
    int texCoord0Attribute() const { return mTexCoord0Attribute; }
    int colorAttribute() const { return mColorAttribute; }
    int normalAttribute() const { return mNormalAttribute; }
    int tangentAttribute() const { return mTangentAttribute; }
    int bitangentAttribute() const { return mBitangentAttribute; }

    void use() const;

    void load(const std::unordered_map<std::string, std::string>& sources, Key key);

private:
    GLuint mVertexShader;
    GLuint mFragmentShader;
    GLuint mProgram;
    int mProjectionMatrixUniform = -1;
    int mViewMatrixUniform = -1;
    int mModelMatrixUniform = -1;
    int mAmbientColorUniform = -1;
    int mDiffuseColorUniform = -1;
    int mSpecularColorUniform = -1;
    int mShininessUniform = -1;
    int mOpacityUniform = -1;
    int mDiffuseMapUniform = -1;
    int mNormalMapUniform = -1;
    int mSpecularMapUniform = -1;
    int mShadowMapUniform = -1;
    int mShadowProjectionUniform = -1;
    int mLightPositionUniform = -1;
    int mLightColorUniform = -1;
    int mLightPowerUniform = -1;
    int mPositionAttribute = -1;
    int mTexCoord0Attribute = -1;
    int mColorAttribute = -1;
    int mNormalAttribute = -1;
    int mTangentAttribute = -1;
    int mBitangentAttribute = -1;

    GLES2UberShader(const GLES2UberShader&) = delete;
    GLES2UberShader& operator=(const GLES2UberShader&) = delete;
};
