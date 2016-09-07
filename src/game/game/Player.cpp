#include "Player.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

Player::Player(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("texture_panzerwagen.png"));
    resourceQueue.meshes.emplace(mTankMesh = engine->renderer()->meshNameId("tank.mesh"));
}

void Player::draw(Renderer* renderer)
{
    renderer->drawMesh(worldMatrix(), mTankMesh);
}
