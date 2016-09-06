
#pragma once
#include <glm/glm.hpp>
#include <cstdint>

enum MaterialFlag : uint8_t
{
    MaterialTwoSided = 0x01,
};

enum MaterialBlendMode : uint8_t
{
    MaterialOpaque = 0,
    MaterialTransparent = 1,
    MaterialAdditive = 2,
};

struct MaterialDesc
{
    glm::vec3 ambientColor{0.0f};
    glm::vec3 diffuseColor{1.0f};
    glm::vec3 specularColor{0.0f};
    float opacity = 1.0f;
    float shininess = 0.0f;
    uint16_t diffuseMap = 0;            // in file: offset into string table
    uint16_t normalMap = 0;             // in memory: texture name id (see `Renderer::textureNameId`).
    uint16_t specularMap = 0;
    uint8_t flags = 0;                  // see `MaterialFlag`
    uint8_t blendMode = MaterialOpaque; // see `MaterialBlendMode`
};
