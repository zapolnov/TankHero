#include "Enemy.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <random>

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

    std::uniform_int_distribution<int> distribution(0, 3);
    switch (distribution(mLevel->randomGenerator())) {
        case 0:  mTargetAngle = glm::radians(  0.0f); break;
        case 1:  mTargetAngle = glm::radians( 90.0f); break;
        case 2:  mTargetAngle = glm::radians(180.0f); break;
        default: mTargetAngle = glm::radians(270.0f); break;
    }
    setRotation2D(mTargetAngle);

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

    auto dir = direction();

    mTimeSinceLastShot += time;
    if (mTimeSinceLastShot > 2.0f) {
        auto position = glm::vec3(worldMatrix() * glm::vec4(0.0f, 0.0f, 0.0f, 1.0f));
        position.z = 1.0f;
        mLevel->spawnBullet(std::static_pointer_cast<Enemy>(shared_from_this()), position, dir);
        mTimeSinceLastShot = 0.0f;
    }

    const float ROTATE_SPEED = glm::radians(90.0f);
    const float MOVE_SPEED = Level::CELL_SIZE * 1.2f;

    auto angle = rotation2D();
    if (mTargetAngle != angle) {
        float delta = mTargetAngle - angle;
        float step = ROTATE_SPEED * time;
        if (step > fabsf(delta))
            angle += step;
        else
            angle = mTargetAngle;
        setRotation2D(angle);
        invalidateBoundingBox();
    } else {
        auto pos = position2D();

        float length = time * MOVE_SPEED;
        if (!mLevel->collideOnMove(*this, dir, length, this)) {
            pos += dir * length;
            setPosition2D(pos);
            invalidateBoundingBox();
        } else {
            auto angle = rotation2D();
            std::uniform_int_distribution<int> distribution(0, 1);
            switch (distribution(mLevel->randomGenerator())) {
                case 0:  mTargetAngle = angle + glm::radians(90.0f); break;
                default: mTargetAngle = angle - glm::radians(90.0f); break;
            }
        }
    }
}

void Enemy::draw(Renderer* renderer)
{
}
