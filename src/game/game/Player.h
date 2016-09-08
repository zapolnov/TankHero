
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Player : public Node, public Collidable
{
public:
    Player(Engine* engine, PendingResources& resourceQueue);

private:
    class Body;
    class Gun;

    std::shared_ptr<Body> mBody;
    std::shared_ptr<Gun> mGun;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
