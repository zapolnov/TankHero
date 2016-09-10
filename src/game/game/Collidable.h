
#pragma once
#include "src/engine/scene/Node.h"
#include "src/engine/math/OBB2D.h"
#include <utility>
#include <glm/glm.hpp>

class Engine;

class Collidable
{
public:
    explicit Collidable(Engine* engine);
    virtual ~Collidable() = default;

    const OBB2D& boundingBox();

    virtual glm::vec2 boundingSphereWorldCenter() const { return glm::vec2(0.0f); }
    virtual float boundingSphereRadius() const { return 0.0f; }

    virtual std::shared_ptr<Collidable> emitter() const { return nullptr; }

    virtual bool isPlayer() const { return false; }
    virtual bool hitWithBullet(float, bool) { return false; }

protected:
    Engine* mEngine;
    OBB2D mBoundingBox;
    bool mBoundingBoxValid;

    void invalidateBoundingBox() { mBoundingBoxValid = false; }

    virtual const glm::mat4& bboxToWorldTransform() = 0;
    virtual std::pair<glm::vec3, glm::vec3> localAABox() const = 0;
    virtual int localUpAxis() const { return 1; }

    void debugDraw(Renderer* renderer);
};
