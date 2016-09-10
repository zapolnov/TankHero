#include "Bullet.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <algorithm>

class Bullet::Visual : public Node
{
public:
    Visual(uint16_t mesh)
        : mMesh(mesh)
    {
        setScale(5.0f);
        setRotation(glm::vec3(glm::radians(90.0f), glm::radians(-90.0f), 0.0f));
        setPosition(glm::vec3(0.0f, -4.0f, 0.0f));
    }

    std::pair<glm::vec3, glm::vec3> localAABox(Engine* engine) const
    {
        auto min = engine->renderer()->meshBBoxMin(mMesh);
        auto max = engine->renderer()->meshBBoxMax(mMesh);
        return std::make_pair(min, max);
    }

    void draw(Renderer* renderer) override
    {
        renderer->drawMesh(worldMatrix(), mMesh);
    }

private:
    uint16_t mMesh;
};

Bullet::Bullet(Engine* engine, Level* level, const std::shared_ptr<Collidable>& emitter, uint16_t mesh, const glm::vec2& dir)
    : Collidable(engine)
    , mLevel(level)
    , mEmitter(emitter)
    , mVisual(std::make_shared<Visual>(mesh))
    , mDirection(glm::normalize(dir))
{
    float angle = atan2f(dir.y, dir.x);
    setRotation2D(angle);
}

std::shared_ptr<Collidable> Bullet::emitter() const
{
    return mEmitter.lock();
}

const glm::mat4& Bullet::bboxToWorldTransform()
{
    return mVisual->worldMatrix();
}

std::pair<glm::vec3, glm::vec3> Bullet::localAABox() const
{
    return mVisual->localAABox(mEngine);
}

void Bullet::update(float time)
{
    if (!mInitialized) {
        appendChild(mVisual);
        mInitialized = true;
    }

    const float MOVE_SPEED = Level::CELL_SIZE * 3.0f;

    auto emitter = mEmitter.lock();
    auto pos = position2D();

    float length = std::min(time, 1.0f / 40.0f) * MOVE_SPEED;
    auto target = mLevel->collideOnMove(*this, mDirection, length, emitter.get());
    if (target) {
        if (!target->hitWithBullet(rotation2D()))
            mLevel->spawnBulletExplosion(position() + glm::vec3(mDirection * (length + 2.0f), 4.0f / 5.0f));
        removeFromParent();
        return;
    }
    pos += mDirection * length;

    if (pos.x < -Level::CELL_SIZE || pos.y < -Level::CELL_SIZE ||
            pos.x > mLevel->width() * Level::CELL_SIZE || pos.y > mLevel->height() * Level::CELL_SIZE) {
        removeFromParent();
        mLevel->spawnBulletExplosion(glm::vec3(pos.x, pos.y, position().z) + glm::vec3(0.0f, 0.0f, 4.0f / 5.0f));
        return;
    }

    setPosition(glm::vec3(pos.x, pos.y, position().z));
    invalidateBoundingBox();
}
