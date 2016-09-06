
#pragma once
#include "MaterialDesc.h"
#include <glm/glm.hpp>
#include <cstdint>

struct MeshFile
{
    enum : uint32_t { Magic = 0x1A4D4433 };

    struct Header
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

    struct Element
    {
        uint32_t bufferOffset;
        uint32_t firstIndex;
        uint32_t indexCount;
        MaterialDesc material;
    };
};
