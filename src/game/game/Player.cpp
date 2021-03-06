#include "Player.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <algorithm>

class Player::Body : public Node
{
public:
    Body(Engine* engine, Player* player, PendingResources& resourceQueue)
        : mPlayer(player)
    {
        resourceQueue.meshes.emplace(mMesh = engine->renderer()->meshNameId("tank_body.mesh"));
        setScale(5.0f);
        setRotation(glm::vec3(glm::radians(90.0f), glm::radians(180.0f), 0.0f));
        setPosition(glm::vec3(-4.0f, 0.0f, 1.0f));
    }

    std::pair<glm::vec3, glm::vec3> localAABox(Engine* engine) const
    {
        auto min = engine->renderer()->meshBBoxMin(mMesh);
        auto max = engine->renderer()->meshBBoxMax(mMesh);
        return std::make_pair(min, max);
    }

    void draw(Renderer* renderer) override
    {
        renderer->setLightPosition(glm::vec3(mPlayer->position2D() - mPlayer->direction() * 300.0f, -100.0f));
        renderer->drawMesh(worldMatrix(), mMesh);
    }

private:
    uint16_t mMesh;
    Player* mPlayer;
};

class Player::Gun : public Node
{
public:
    Gun(Engine* engine, Player* player, PendingResources& resourceQueue)
        : mPlayer(player)
    {
        resourceQueue.meshes.emplace(mMesh = engine->renderer()->meshNameId("tank_gun.mesh"));
        setScale(5.0f);
        setRotation(glm::vec3(glm::radians(90.0f), glm::radians(180.0f), 0.0f));
        setPosition(glm::vec3(-4.0f, 0.0f, 1.0f));
    }

    void draw(Renderer* renderer) override
    {
        renderer->setLightPosition(glm::vec3(mPlayer->position2D() - mPlayer->direction() * 250.0f, -100.0f));
        renderer->drawMesh(worldMatrix(), mMesh);
    }

private:
    uint16_t mMesh;
    Player* mPlayer;
};

const int Player::INITIAL_LIVES = 5;

Player::Player(Engine* engine, Level* level, PendingResources& resourceQueue)
    : Collidable(engine)
    , mLevel(level)
    , mLives(INITIAL_LIVES)
{
    resourceQueue.sounds.emplace(mMedKitSound = engine->soundManager()->soundNameId("Rise01.ogg"));

    mBody = std::make_shared<Body>(engine, this, resourceQueue);
    mGun = std::make_shared<Gun>(engine, this, resourceQueue);
    resourceQueue.custom.emplace_back([this]() {
        appendChild(mBody);
        appendChild(mGun);
    });
}

glm::vec2 Player::direction() const
{
    float a = rotation2D() + glm::radians(-90.0f);
    return glm::vec2(cosf(a), sinf(a));
}

bool Player::hitWithBullet(float, bool shotByPlayer)
{
    if (!shotByPlayer && mLives > 0) {
        --mLives;
        if (mLives <= 0) {
            mLevel->spawnEnemyExplosion(position());
            mDeathTime = 0.5f;
            return true;
        }
    }
    return false;
}

void Player::collectMedKit()
{
    mLives++;
    mEngine->soundManager()->play(mMedKitSound);
}

const glm::mat4& Player::bboxToWorldTransform()
{
    return mBody->worldMatrix();
}

std::pair<glm::vec3, glm::vec3> Player::localAABox() const
{
    return mBody->localAABox(mEngine);
}

void Player::update(float time)
{
    if (mLives <= 0) {
        if (mDeathTime > 0.0f) {
            mDeathTime -= time;
            if (mDeathTime <= 0.0f)
                mLevel->showLoseScreen();
        }
        return;
    }

    mTimeSinceLastShot += time;
    time = std::min(time, 1.0f / 40.0f);

    const float ROTATE_SPEED = glm::radians(90.0f);
    const float MOVE_SPEED = Level::CELL_SIZE;

    if (mEngine->wasKeyPressed(KeyLeft) || mEngine->wasKeyPressed(KeyRight)) {
        float step = ROTATE_SPEED * time;
        bool orientationChanged = false;

        auto angle = rotation2D();
        float oldAngle = angle;
        auto oldBoundingBox = boundingBox();

        if (mEngine->wasKeyPressed(KeyLeft)) {
            setRotation2D(angle + step);
            invalidateBoundingBox();
            if (!mLevel->collideOnMove(*this, oldBoundingBox, boundingBox(), nullptr, this)) {
                angle = angle + step;
                orientationChanged = true;
            } else {
                setRotation2D(angle);
                invalidateBoundingBox();
            }
        }

        if (mEngine->wasKeyPressed(KeyRight)) {
            setRotation2D(angle - step);
            invalidateBoundingBox();
            if (!mLevel->collideOnMove(*this, oldBoundingBox, boundingBox(), nullptr, this)) {
                angle = angle - step;
                orientationChanged = true;
            } else {
                setRotation2D(angle);
                invalidateBoundingBox();
            }
        }

        if (orientationChanged)
            mLevel->updateListenerOrientation();
    }

    if (mEngine->wasKeyPressed(KeyUp) || mEngine->wasKeyPressed(KeyDown)) {
        auto pos = position2D();

        auto dir = direction();
        float length = time * MOVE_SPEED;

        if (mEngine->wasKeyPressed(KeyUp)) {
            float dist = length;
            mLevel->collideOnMove(*this, dir, dist, this);
            pos += dir * dist;
        }

        if (mEngine->wasKeyPressed(KeyDown)) {
            float dist = length;
            mLevel->collideOnMove(*this, -dir, dist, this);
            pos -= dir * dist;
        }

        setPosition2D(pos);
        invalidateBoundingBox();
        mLevel->updateListenerPosition();
    }

    if (mEngine->wasKeyPressed(KeyShoot) && mTimeSinceLastShot > 1.0f) {
        auto position = glm::vec3(worldMatrix() * glm::vec4(0.0f, 0.0f, 0.0f, 1.0f));
        position.z = 1.0f;
        mLevel->spawnBullet(std::static_pointer_cast<Player>(shared_from_this()), position, direction());
        mTimeSinceLastShot = 0.0f;
    }
}

void Player::beforeDraw(Renderer* renderer)
{
    mOldLightPosition = renderer->lightPosition();
}

void Player::afterDraw(Renderer* renderer)
{
    renderer->setLightPosition(mOldLightPosition);
}

void Player::draw(Renderer*)
{
}
