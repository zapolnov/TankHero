
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Obstacle : public Node, public Collidable
{
public:
    Obstacle(Engine* engine, uint16_t mesh);

private:
    uint16_t mMesh;

    const glm::mat4& bboxToWorldTransform() override { return Node::worldMatrix(); }
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void draw(Renderer* renderer) override;
};
