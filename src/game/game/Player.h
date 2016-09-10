
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Level;

class Player : public Node, public Collidable
{
public:
    Player(Engine* engine, Level* level, PendingResources& resourceQueue);

    glm::vec2 direction() const;

    bool isPlayer() const override { return true; }

private:
    class Body;
    class Gun;

    Level* mLevel;
    std::shared_ptr<Body> mBody;
    std::shared_ptr<Gun> mGun;
    float mTimeSinceLastShot = 0.0f;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
