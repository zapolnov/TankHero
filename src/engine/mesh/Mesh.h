
#pragma once
#include <glm/glm.hpp>
#include <cstdint>

struct Mesh
{
    enum : uint32_t { Magic = 0x1A4D4433 };

    struct FileHeader
    {
        uint32_t magic;
        uint32_t vertexBufferSize;
        uint32_t indexBufferSize;
        glm::vec3 bboxMin;
        glm::vec3 bboxMax;
        float boundingSphereRadius;
        glm::vec3 boundingSphereCenter;
        uint16_t stringTableSize;
        uint8_t vertexFormat;
        uint8_t elementCount;
    };

    enum ElementFlag : uint8_t
    {
        TwoSided = 0x01,
    };

    enum ElementBlendMode : uint8_t
    {
        NoBlending = 0,
        DefaultBlending = 1,
        PremultipliedBlending = 2,
        AdditiveBlending = 3,
    };

    struct Element
    {
        uint32_t bufferOffset;
        uint32_t firstIndex;
        uint32_t indexCount;
        glm::vec3 ambientColor;
        glm::vec3 diffuseColor;
        glm::vec3 specularColor;
        float opacity;
        float shininess;
        uint16_t diffuseMap;        // offset in string table
        uint16_t normalMap;         // offset in string table
        uint16_t specularMap;       // offset in string table
        uint8_t flags;
        uint8_t blendMode;
    };
};
