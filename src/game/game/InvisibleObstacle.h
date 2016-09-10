
#pragma once
#include "Obstacle.h"

class InvisibleObstacle : public Obstacle
{
public:
    InvisibleObstacle(Engine* engine, const glm::vec2& size);
    InvisibleObstacle(Engine* engine, const glm::vec2& min, const glm::vec2& max);

private:
    glm::vec2 mMin;
    glm::vec2 mMax;

    const glm::mat4& bboxToWorldTransform() override { return Node::worldMatrix(); }
    std::pair<glm::vec3, glm::vec3> localAABox() const override;
    int localUpAxis() const override { return 2; }

    void draw(Renderer* renderer) override;
};
