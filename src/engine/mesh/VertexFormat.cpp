#include "VertexFormat.h"

VertexFormat::VertexFormat(uint8_t components)
    : mComponents(components)
    , mStride(0)
{
    mPositionOffset = mStride;
    if (mComponents & Position)
        mStride = sizeof(VertexPosition);

    mNormalOffset = mStride;
    if (mComponents & Normal)
        mStride += sizeof(VertexNormal);

    mTangentOffset = mStride;
    if (mComponents & Tangent)
        mStride += sizeof(VertexTangent);

    mBitangentOffset = mStride;
    if (mComponents & Bitangent)
        mStride += sizeof(VertexBitangent);

    mTexCoord0Offset = mStride;
    if (mComponents & TexCoord0)
        mStride += sizeof(VertexTexCoord);

    mColorOffset = mStride;
    if (mComponents & Color)
        mStride += sizeof(VertexColor);

    mBoneIndicesOffset = mStride;
    if (mComponents & BoneIndices)
        mStride += sizeof(VertexBoneIndices);

    mBoneWeightsOffset = mStride;
    if (mComponents & BoneWeights)
        mStride += sizeof(VertexBoneWeights);
}

