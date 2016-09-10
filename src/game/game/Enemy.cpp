#include "Enemy.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

class Enemy::Visual : public Node
{
public:
    Visual(uint16_t mesh)
        : mMesh(mesh)
    {
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

Enemy::Enemy(Engine* engine, Level* level, const Descriptor& desc)
    : Collidable(engine)
    , mLevel(level)
    , mVisual(std::make_shared<Visual>(desc.mesh))
    , mLives(desc.initialLives)
{
    mVisual->setPosition(desc.visualPosition);
    invalidateBoundingBox();
}

glm::vec2 Enemy::direction() const
{
    float a = rotation2D() + glm::radians(-90.0f);
    return glm::vec2(cosf(a), sinf(a));
}

bool Enemy::hitWithBullet(float)
{
    if (mLives > 0) {
        --mLives;
        if (mLives <= 0) {
            mLevel->spawnEnemyExplosion(position());
            mDeathTime = 0.1f;
            return true;
        }
    }
    return false;
}

const glm::mat4& Enemy::bboxToWorldTransform()
{
    return mVisual->worldMatrix();
}

std::pair<glm::vec3, glm::vec3> Enemy::localAABox() const
{
    return mVisual->localAABox(mEngine);
}

void Enemy::update(float time)
{
    if (!mInitialized) {
        appendChild(mVisual);
        mInitialized = true;
    }

    if (mLives <= 0) {
        if (mDeathTime > 0.0f) {
            mDeathTime -= time;
            if (mDeathTime <= 0.0f)
                removeFromParent();
        }
        return;
    }

    mTimeSinceLastShot += time;

    if (mTimeSinceLastShot > 5.0f) {
        auto position = glm::vec3(worldMatrix() * glm::vec4(0.0f, 0.0f, 0.0f, 1.0f));
        position.z = 1.0f;
        mLevel->spawnBullet(std::static_pointer_cast<Enemy>(shared_from_this()), position, direction());
        mTimeSinceLastShot = 0.0f;
    }
}

void Enemy::draw(Renderer* renderer)
{
}
