#include "Player.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

Player::Player(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("texture_panzerwagen.png"));
    resourceQueue.meshes.emplace(mTankMesh = engine->renderer()->meshNameId("tank.mesh"));
}

void Player::update(float time)
{
    const float ROTATE_SPEED = glm::radians(90.0f);
    const float MOVE_SPEED = Level::CELL_SIZE;

    auto angle = rotation2D();

    if (mEngine->wasKeyPressed(KeyLeft) || mEngine->wasKeyPressed(KeyRight)) {
        if (mEngine->wasKeyPressed(KeyLeft))
            angle += ROTATE_SPEED * time;
        if (mEngine->wasKeyPressed(KeyRight))
            angle -= ROTATE_SPEED * time;
        setRotation2D(angle);
    }

    if (mEngine->wasKeyPressed(KeyUp) || mEngine->wasKeyPressed(KeyDown)) {
        auto pos = position2D();

        float a = angle + glm::radians(-90.0f);
        auto dir = glm::vec2(cosf(a), sinf(a)) * MOVE_SPEED;

        if (mEngine->wasKeyPressed(KeyUp))
            pos += dir * time;
        if (mEngine->wasKeyPressed(KeyDown))
            pos -= dir * time;

        setPosition2D(pos);
    }
}

void Player::draw(Renderer* renderer)
{
    renderer->drawMesh(worldMatrix(), mTankMesh);
}
