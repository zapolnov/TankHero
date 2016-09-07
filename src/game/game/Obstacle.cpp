#include "Obstacle.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

Obstacle::Obstacle(Engine* engine, uint16_t mesh)
    : mEngine(engine)
    , mMesh(mesh)
{
}

void Obstacle::draw(Renderer* renderer)
{
    renderer->drawMesh(worldMatrix(), mMesh);
}
