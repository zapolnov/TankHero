
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Level;

class Bullet : public Node, public Collidable
{
public:
    Bullet(Engine* engine, Level* level, const std::shared_ptr<Collidable>& emitter, uint16_t mesh, const glm::vec2& dir);

    std::shared_ptr<Collidable> emitter() const override;

private:
    class Visual;

    Level* mLevel;
    std::shared_ptr<Visual> mVisual;
    std::weak_ptr<Collidable> mEmitter;
    glm::vec2 mDirection;
    bool mInitialized = false;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void update(float time) override;
};
