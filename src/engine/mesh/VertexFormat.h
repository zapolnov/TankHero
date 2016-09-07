
#pragma once
#include <glm/glm.hpp>
#include <cstdint>

using VertexPosition = glm::vec3;                           // 3 * 4 = 12
using VertexNormal = glm::vec3;                             // 3 * 4 = 12
using VertexTangent = glm::vec3;                            // 3 * 4 = 12
using VertexBitangent = glm::vec3;                          // 3 * 4 = 12
using VertexTexCoord = glm::vec2;                           // 2 * 4 =  8
using VertexColor = glm::tvec4<uint8_t, glm::highp>;        // 4 * 1 =  4
using VertexBoneIndices = glm::tvec4<uint8_t, glm::highp>;  // 4 * 1 =  4
using VertexBoneWeights = glm::vec4;                        // 4 * 4 = 16
                                                            // ======= 80

class VertexFormat
{
public:
    enum Component : uint8_t
    {
        Position = 0x01,
        Normal = 0x02,
        Tangent = 0x04,
        Bitangent = 0x08,
        TexCoord0 = 0x10,
        Color = 0x20,
        BoneIndices = 0x40,
        BoneWeights = 0x80,
    };

    explicit VertexFormat(uint8_t components);
    ~VertexFormat() = default;

    uint8_t components() const { return mComponents; }
    size_t stride() const { return mStride; }

    bool hasPosition() const { return (mComponents & Position) != 0; }
    bool hasNormal() const { return (mComponents & Normal) != 0; }
    bool hasTangent() const { return (mComponents & Tangent) != 0; }
    bool hasBitangent() const { return (mComponents & Bitangent) != 0; }
    bool hasTexCoord0() const { return (mComponents & TexCoord0) != 0; }
    bool hasColor() const { return (mComponents & Color) != 0; }
    bool hasBoneIndices() const { return (mComponents & BoneIndices) != 0; }
    bool hasBoneWeights() const { return (mComponents & BoneWeights) != 0; }

    size_t positionOffset() const { return mPositionOffset; }
    size_t normalOffset() const { return mNormalOffset; }
    size_t tangentOffset() const { return mTangentOffset; }
    size_t bitangentOffset() const { return mBitangentOffset; }
    size_t texCoord0Offset() const { return mTexCoord0Offset; }
    size_t colorOffset() const { return mColorOffset; }
    size_t boneIndicesOffset() const { return mBoneIndicesOffset; }
    size_t boneWeightsOffset() const { return mBoneWeightsOffset; }

    VertexPosition& position(void* p, size_t n) const
        { return offset<VertexPosition>(p, mPositionOffset, n); }
    const VertexPosition& position(const void* p, size_t n) const
        { return offset<VertexPosition>(p, mPositionOffset, n); }

    VertexNormal& normal(void* p, size_t n) const
        { return offset<VertexNormal>(p, mNormalOffset, n); }
    const VertexNormal& normal(const void* p, size_t n) const
        { return offset<VertexNormal>(p, mNormalOffset, n); }

    VertexTangent& tangent(void* p, size_t n) const
        { return offset<VertexTangent>(p, mTangentOffset, n); }
    const VertexTangent& tangent(const void* p, size_t n) const
        { return offset<VertexTangent>(p, mTangentOffset, n); }

    VertexBitangent& bitangent(void* p, size_t n) const
        { return offset<VertexBitangent>(p, mBitangentOffset, n); }
    const VertexBitangent& bitangent(const void* p, size_t n) const
        { return offset<VertexBitangent>(p, mBitangentOffset, n); }

    VertexTexCoord& texCoord0(void* p, size_t n) const
        { return offset<VertexTexCoord>(p, mTexCoord0Offset, n); }
    const VertexTexCoord& texCoord0(const void* p, size_t n) const
        { return offset<VertexTexCoord>(p, mTexCoord0Offset, n); }

    VertexColor& color(void* p, size_t n) const
        { return offset<VertexColor>(p, mColorOffset, n); }
    const VertexColor& color(const void* p, size_t n) const
        { return offset<VertexColor>(p, mColorOffset, n); }

    VertexBoneIndices& boneIndices(void* p, size_t n) const
        { return offset<VertexBoneIndices>(p, mBoneIndicesOffset, n); }
    const VertexBoneIndices& boneIndices(const void* p, size_t n) const
        { return offset<VertexBoneIndices>(p, mBoneIndicesOffset, n); }

    VertexBoneWeights& boneWeights(void* p, size_t n) const
        { return offset<VertexBoneWeights>(p, mBoneWeightsOffset, n); }
    const VertexBoneWeights& boneWeights(const void* p, size_t n) const
        { return offset<VertexBoneWeights>(p, mBoneWeightsOffset, n); }

private:
    uint8_t mComponents;
    uint8_t mStride;
    uint8_t mPositionOffset;
    uint8_t mNormalOffset;
    uint8_t mTangentOffset;
    uint8_t mBitangentOffset;
    uint8_t mTexCoord0Offset;
    uint8_t mColorOffset;
    uint8_t mBoneIndicesOffset;
    uint8_t mBoneWeightsOffset;

    template <typename T> T& offset(const void* p, uint8_t o, size_t n) const
        { return *reinterpret_cast<T*>(const_cast<uint8_t*>(reinterpret_cast<const uint8_t*>(p) + n * mStride + o)); }
};
