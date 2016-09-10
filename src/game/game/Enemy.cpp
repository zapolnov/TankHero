#include "Enemy.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <random>
#include <algorithm>

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

    std::uniform_int_distribution<int> distribution2(0, 1);
    mLeftHanded = distribution2(mLevel->randomGenerator()) == 0;

    invalidateBoundingBox();
}

glm::vec2 Enemy::direction() const
{
    float a = rotation2D() + glm::radians(-90.0f);
    return glm::vec2(cosf(a), sinf(a));
}

bool Enemy::hitWithBullet(float, bool shotByPlayer)
{
    if (shotByPlayer && mLives > 0) {
        --mLives;
        if (mLives <= 0) {
            mLevel->spawnEnemyExplosion(position());
            mLevel->decreaseEnemyCount();
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
    mTimeSinceLastTurn += time;

    if (mTimeSinceLastShot > 1.0f) {
        auto position = glm::vec3(worldMatrix() * glm::vec4(0.0f, 0.0f, 0.0f, 1.0f));
        position.z = 1.0f;
        mLevel->spawnBullet(std::static_pointer_cast<Enemy>(shared_from_this()), position, dir);
        mTimeSinceLastShot = 0.0f;
    }

    time = std::min(time, 1.0f / 40.0f);
    const float ROTATE_SPEED = glm::radians(180.0f);
    const float MOVE_SPEED = Level::CELL_SIZE * 1.2f;

    auto angle = rotation2D();
    if (mRotating) {
        float targetAngle = mTargetAngle;
        while (targetAngle < glm::radians(-180.0f))
            targetAngle += glm::radians(360.0f);
        while (targetAngle > glm::radians(180.0f))
            targetAngle -= glm::radians(360.0f);

        while (angle < glm::radians(-180.0f))
            angle += glm::radians(360.0f);
        while (angle > glm::radians(180.0f))
            angle -= glm::radians(360.0f);

        float delta = targetAngle - angle;
        if (delta < glm::radians(-180.0f))
            delta += glm::radians(360.0f);
        if (delta > glm::radians(180.0f))
            delta -= glm::radians(360.0f);

        float step = ROTATE_SPEED * time;
        if (step < fabsf(delta))
            angle += (delta < 0.0f ? -step : step);
        else {
            angle = mTargetAngle;
            mTimeSinceLastTurn = 0.0f;
            mMovedAfterTurn = false;
            mRotating = false;
        }
        setRotation2D(angle);
        invalidateBoundingBox();
    } else {
        auto pos = position2D();

        float length = time * MOVE_SPEED;
        if (!mLevel->collideCircleOnMove(*this, dir, length, this)) {
            if (mMovedAfterTurn && mTimeSinceLastTurn >= 1.0f) {
                auto playerPos = mLevel->playerPosition();
                mTargetAngle = atan2f(playerPos.y - pos.y, playerPos.x - pos.x);

                /*
                static const float angles[] = {
                    glm::radians(-270.0f),
                    glm::radians(-225.0f),
                    glm::radians(-180.0f),
                    glm::radians(-135.0f),
                    glm::radians( -90.0f),
                    glm::radians( -45.0f),
                    glm::radians(   0.0f),
                    glm::radians(  45.0f),
                    glm::radians(  90.0f),
                    glm::radians( 135.0f),
                    glm::radians( 180.0f),
                    glm::radians( 225.0f),
                    glm::radians( 270.0f),
                };

                size_t i;
                for (i = 0; i < sizeof(angles) / sizeof(angles[0]); i++) {
                    if (mTargetAngle <= angles[i]) {
                        mTargetAngle = angles[i];
                        break;
                    }
                }
                assert(i != sizeof(angles) / sizeof(angles[0]));
                */

                mTargetAngle += glm::radians(90.0f);
                if (fabsf(mTargetAngle - angle) < 0.001f)
                    mTargetAngle = angle;
                else {
                    mRotating = true;
                    return;
                }
            }

            mMovedAfterTurn = true;
            pos += dir * length;
            setPosition2D(pos);
            invalidateBoundingBox();
            return;
        }

        auto angle = rotation2D();
        while (angle < glm::radians(0.0f))
            angle += glm::radians(360.0f);
        while (angle > glm::radians(360.0f))
            angle -= glm::radians(360.0f);

        if (mLeftHanded) {
            if (angle <= glm::radians(90.0f))
                mTargetAngle = glm::radians(180.0f);
            else if (angle <= glm::radians(180.0f))
                mTargetAngle = glm::radians(270.0f);
            else if (angle <= glm::radians(270.0f))
                mTargetAngle = glm::radians(360.0f);
            else
                mTargetAngle = glm::radians(450.0f);
        } else {
            if (angle >= glm::radians(270.0f))
                mTargetAngle = glm::radians(180.0f);
            else if (angle >= glm::radians(180.0f))
                mTargetAngle = glm::radians(90.0f);
            else if (angle >= glm::radians(90.0f))
                mTargetAngle = glm::radians(0.0f);
            else
                mTargetAngle = glm::radians(-90.0f);
        }

        mRotating = true;
    }
}

void Enemy::draw(Renderer* renderer)
{
}
