
#pragma once
#include <glm/glm.hpp>
#include <cstdint>

struct Mesh
{
    enum : uint32_t { Magic = 0x4853454D };

    struct FileHeader
    {
        uint32_t magic;
        uint32_t vertexBufferSize;
        uint32_t indexBufferSize;
        glm::vec3 bboxMin;
        glm::vec3 bboxMax;
        float boundingSphereRadius;
        glm::vec3 boundingSphereCenter;
        uint8_t vertexFormat;
        uint8_t elementCount;
        uint8_t _reserved[2];
    };

    struct Element
    {
        uint32_t bufferOffset;
        uint32_t firstIndex;
        uint32_t indexCount;
        uint32_t _reserved[1];
    };
};
