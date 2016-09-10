#include "OBB2D.h"
#include <glm/gtx/norm.hpp>
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

// https://github.com/snowkit/differ/blob/master/differ/sat/SAT2D.hx

static glm::vec2 findNormalAxis(const glm::vec2* p, int i)
{
    const auto& p1 = p[i];
    const auto& p2 = p[(i + 1) % 4];
    return glm::vec2(p2.x - p1.x, -(p2.y - p1.y));
}

bool OBB2D::intersectsWithCircle(const glm::vec2& center, float radius) const
{
    float testDistance = std::numeric_limits<float>::max();
    glm::vec2 closestxy;
    for (const auto& pp : p) {
        auto distance = glm::length2(center - pp);
        if (distance < testDistance) {
            testDistance = distance;
            closestxy = pp;
        }
    }

    auto normalAxis = closestxy - center;
//    float normalAxisLen = glm::length(normalAxis);
    normalAxis = glm::normalize(normalAxis);

    auto min1 = glm::dot(normalAxis, p[0]);
    auto max1 = min1;

    for (int i = 1; i < 4; i++) {
        auto test = glm::dot(normalAxis, p[i]);
        min1 = std::min(min1, test);
        max1 = std::max(max1, test);
    }

    auto min2 = radius;
    auto max2 = radius;
    auto offset = glm::dot(normalAxis, -center);

    min1 += offset;
    max1 += offset;

    auto test1 = min1 - max2;
    auto test2 = min2 - max1;
    if (test1 > 0 || test2 > 0)
        return false;

    float distMin = -(max2 - min1);
    //if (flip)
    //    distMin *= -1;

    //into.overlap = distMin;
    //into.unitVectorX = normalAxisX;
    //into.unitVectorY = normalAxisY;
    float closest = fabsf(distMin);

    for (int i = 0; i < 4; i++) {
        normalAxis = findNormalAxis(p, i);
        //float aLen = glm::length(normalAxis);
        normalAxis = glm::normalize(normalAxis);

        min1 = glm::dot(normalAxis, p[0]);
        max1 = min1;

        for (int j = 1; j < 4; j++) {
            float test = glm::dot(normalAxis, p[j]);
            min1 = glm::min(min1, test);
            max1 = glm::max(max1, test);
        }

        max2 = radius;
        min2 = -radius;

        offset = glm::dot(normalAxis, -center);
        min1 += offset;
        max1 += offset;

        test1 = min1 - max2;
        test2 = min2 - max1;
        if (test1 > 0 || test2 > 0)
            return false;

        distMin = -(max2 - min1);
        //if(flip) distMin *= -1;

        if (fabsf(distMin) < closest) {
            //into.unitVectorX = normalAxisX;
            //into.unitVectorY = normalAxisY;
            //into.overlap = distMin;
            closest = fabsf(distMin);
        }
    }

    //into.shape1 = if(flip) polygon else circle;
    //into.shape2 = if(flip) circle else polygon;
    //into.separationX = into.unitVectorX * into.overlap;
    //into.separationY = into.unitVectorY * into.overlap;
    //if(!flip) {
    //    into.unitVectorX = -into.unitVectorX;
    //    into.unitVectorY = -into.unitVectorY;
    //}

    return true;

    /*
    // https://www.reddit.com/r/gamedev/comments/xtry1/circlepolygon_collison_using_sat/
    // http://pastebin.com/TB0UVJMq

    struct Edge
    {
        glm::vec2 vertex0;
        glm::vec2 edgeVector;
        float iLengthSq;
    };

    Edge edges[4] = {
        { p[0], (p[1] - p[0]), 1.0f / glm::length2(p[1] - p[0]) },
        { p[1], (p[2] - p[1]), 1.0f / glm::length2(p[2] - p[1]) },
        { p[2], (p[3] - p[2]), 1.0f / glm::length2(p[3] - p[2]) },
        { p[3], (p[0] - p[3]), 1.0f / glm::length2(p[0] - p[3]) },
    };

    glm::vec2 closestAxis;
    float closestDist = std::numeric_limits<float>::max();

    for (const auto& edge : edges) {
        float t = glm::dot(center - edge.vertex0, edge.edgeVector) * edge.iLengthSq;
        t = glm::clamp(t, 0.0f, 1.0f);
        auto axis = center - (edge.vertex0 + edge.edgeVector * t);
        auto axislsq = glm::length2(axis);
        if (axislsq < closestDist) {
            closestAxis = axis;
            closestDist = axislsq;
        }
    }

    closestAxis = glm::normalize(closestAxis);

    auto circleProj = dot(closestAxis, center) + radius;
    float polyProj = -std::numeric_limits<float>::max();
    for (const auto& vertex : p) {
        auto vproj = glm::dot(vertex, closestAxis);
        if (vproj > polyProj)
            polyProj = vproj;
    }

    auto overlap = polyProj - circleProj;
    return (overlap >= 0.0f);
    // return { axis : closest_axis, overlap : overlap }
    */
}
