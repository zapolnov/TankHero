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
        //setScale(5.0f);
        //setRotation(glm::vec3(glm::radians(90.0f), glm::radians(-90.0f), 0.0f));
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
{
    mVisual->setPosition(desc.visualPosition);
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
}
