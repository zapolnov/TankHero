#include "Obstacle.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

Obstacle::Obstacle(Engine* engine, uint16_t mesh)
    : Collidable(engine)
    , mMesh(mesh)
{
}

std::pair<glm::vec3, glm::vec3> Obstacle::localAABox() const
{
    auto min = mEngine->renderer()->meshBBoxMin(mMesh);
    auto max = mEngine->renderer()->meshBBoxMax(mMesh);
    return std::make_pair(min, max);
}

void Obstacle::draw(Renderer* renderer)
{
    debugDraw(renderer);
    renderer->drawMesh(worldMatrix(), mMesh);
}
