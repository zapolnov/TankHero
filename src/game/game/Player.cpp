#include "Player.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

class Player::Body : public Node
{
public:
    Body(Engine* engine, PendingResources& resourceQueue)
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
        renderer->drawMesh(worldMatrix(), mMesh);
    }

private:
    uint16_t mMesh;
};

class Player::Gun : public Node
{
public:
    Gun(Engine* engine, PendingResources& resourceQueue)
    {
        resourceQueue.meshes.emplace(mMesh = engine->renderer()->meshNameId("tank_gun.mesh"));
        setScale(5.0f);
        setRotation(glm::vec3(glm::radians(90.0f), glm::radians(180.0f), 0.0f));
        setPosition(glm::vec3(-4.0f, 0.0f, 1.0f));
    }

    void draw(Renderer* renderer) override
    {
        renderer->drawMesh(worldMatrix(), mMesh);
    }

private:
    uint16_t mMesh;
};

Player::Player(Engine* engine, PendingResources& resourceQueue)
    : Collidable(engine)
{
    mBody = std::make_shared<Body>(engine, resourceQueue);
    mGun = std::make_shared<Gun>(engine, resourceQueue);
    resourceQueue.custom.emplace_back([this]() {
        appendChild(mBody);
        appendChild(mGun);
    });
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
    const float ROTATE_SPEED = glm::radians(90.0f);
    const float MOVE_SPEED = Level::CELL_SIZE;

    auto angle = rotation2D();

    if (mEngine->wasKeyPressed(KeyLeft) || mEngine->wasKeyPressed(KeyRight)) {
        if (mEngine->wasKeyPressed(KeyLeft))
            angle += ROTATE_SPEED * time;
        if (mEngine->wasKeyPressed(KeyRight))
            angle -= ROTATE_SPEED * time;
        setRotation2D(angle);
        invalidateBoundingBox();
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
        invalidateBoundingBox();
    }

    if (mEngine->wasKeyPressed(KeyShoot)) {
        
    }
}

void Player::draw(Renderer* renderer)
{
    debugDraw(renderer);
}
