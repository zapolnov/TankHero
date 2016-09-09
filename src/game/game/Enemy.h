
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Level;

class Enemy : public Node, public Collidable
{
public:
    struct Descriptor
    {
        uint16_t mesh;
        glm::vec3 visualPosition;
    };

    Enemy(Engine* engine, Level* level, const Descriptor& desc);

private:
    class Visual;

    Level* mLevel;
    std::shared_ptr<Visual> mVisual;
    bool mInitialized = false;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void update(float time) override;
};
