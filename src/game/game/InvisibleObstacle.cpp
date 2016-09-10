#include "InvisibleObstacle.h"
#include <cassert>

InvisibleObstacle::InvisibleObstacle(Engine* engine, const glm::vec2& size)
    : Obstacle(engine, 0)
    , mMin(-size * 0.5f)
    , mMax( size * 0.5f)
{
}

InvisibleObstacle::InvisibleObstacle(Engine* engine, const glm::vec2& min, const glm::vec2& max)
    : Obstacle(engine, 0)
    , mMin(min)
    , mMax(max)
{
    assert(mMin.x <= mMax.x);
    assert(mMin.y <= mMax.y);
}

std::pair<glm::vec3, glm::vec3> InvisibleObstacle::localAABox() const
{
    return std::make_pair(glm::vec3(mMin, -1.0f), glm::vec3(mMax, 1.0f));
}

void InvisibleObstacle::draw(Renderer* renderer)
{
    debugDraw(renderer);
}
