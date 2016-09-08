
#pragma once
#include <glm/glm.hpp>
#include <utility>

struct OBB2D
{
    glm::vec2 p[4];

    void getNormals(glm::vec2* normals) const;
    std::pair<float, float> projectOntoLine(const glm::vec2& axis) const;

    bool intersectsWith(const OBB2D& other, float* penetrationDepth = nullptr) const;
};
