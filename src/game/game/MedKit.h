
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class MedKit : public Node, public Collidable
{
public:
    MedKit(Engine* engine, uint16_t mesh);

    glm::vec2 boundingSphereWorldCenter() const override { return position2D(); }
    float boundingSphereRadius() const override { return 3.0f * scale().x; }

private:
    float mAngle;
    uint16_t mMesh;

    const glm::mat4& bboxToWorldTransform() override { return Node::worldMatrix(); }
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
