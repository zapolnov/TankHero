#include "Tree.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

Tree::Tree(Engine* engine, uint16_t mesh)
    : Obstacle(engine, mesh)
{
    setRotation(glm::radians(90.0f), 0.0f, 0.0f);
    setScale(0.3f);
}

bool Tree::hitWithBullet(float bulletAngle)
{
    if (!mFalling) {
        mFalling = true;
        mFallAngle = 0.0f;
        setRotation(rotation().x, glm::radians(180.0f) + bulletAngle, rotation().z);
    }
    return false;
}

void Tree::update(float time)
{
    Obstacle::update(time);

    if (mFalling) {
        mFallAngle += time * 3.0f;
        if (mFallAngle > glm::radians(70.0f))
            removeFromParent();
        else
            setRotation(rotation().x, rotation().y, mFallAngle);
    }
}
