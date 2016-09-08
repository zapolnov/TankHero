#include "OBB2D.h"
#include <algorithm>

void OBB2D::getNormals(glm::vec2* normals) const
{
    for (int i = 0; i < 4; i++) {
        const auto& v1 = p[i];
        const auto& v2 = p[(i + 1) % 4];
        auto edge = v1 - v2;
        normals[i] = glm::normalize(glm::vec2(-edge.y, edge.x));
    }
}

std::pair<float, float> OBB2D::projectOntoLine(const glm::vec2& axis) const
{
    float x1 = glm::dot(p[0], axis);
    float x2 = glm::dot(p[1], axis);
    float x3 = glm::dot(p[2], axis);
    float x4 = glm::dot(p[3], axis);

    float min = std::min(std::min(x1, x2), std::min(x3, x4));
    float max = std::max(std::max(x1, x2), std::max(x3, x4));

    return std::make_pair(min, max);
}

bool OBB2D::intersectsWith(const OBB2D& other, float* penetrationDepth) const
{
    float overlap = std::numeric_limits<float>::max();
    //const glm::vec2* smallest = nullptr;

    glm::vec2 axes[8];
    getNormals(axes);
    other.getNormals(axes + 4);

    for (int i = 0; i < 8; i++) {
        const auto& axis = axes[i];

        auto proj1 = projectOntoLine(axis);
        auto proj2 = other.projectOntoLine(axis);

        if (proj1.first > proj2.second || proj2.first > proj1.second)
            return false;

        float thisOverlap = (proj1.second < proj2.second ? proj1.second - proj2.first : proj2.second - proj1.first);
        if (thisOverlap < overlap) {
            overlap = thisOverlap;
            //smallest = &axis;
        }
    }

    if (penetrationDepth)
        *penetrationDepth = overlap;

    return true;
}
