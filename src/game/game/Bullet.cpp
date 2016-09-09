#include "Bullet.h"
#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

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

Bullet::Bullet(Engine* engine, Level* level, uint16_t mesh, const glm::vec2& dir)
    : Collidable(engine)
    , mLevel(level)
    , mVisual(std::make_shared<Visual>(mesh))
    , mDirection(glm::normalize(dir))
{
    float angle = atan2f(dir.y, dir.x);
    setRotation2D(angle);
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

    auto pos = position2D();

    float length = time * MOVE_SPEED;
    if (mLevel->collidesOnMove(*this, mDirection, length)) {
        removeFromParent();
        mLevel->spawnBulletExplosion(position() + glm::vec3(mDirection * (length + 2.0f), 4.0f / 5.0f));
        return;
    }
    pos += mDirection * length;

    setPosition(glm::vec3(pos.x, pos.y, position().z));
    invalidateBoundingBox();
}
