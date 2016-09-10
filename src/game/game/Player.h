
#pragma once
#include "Collidable.h"
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Level;

class Player : public Node, public Collidable
{
public:
    static const int INITIAL_LIVES;

    Player(Engine* engine, Level* level, PendingResources& resourceQueue);

    int lives() const { return mLives; }

    glm::vec2 direction() const;

    bool hitWithBullet(float bulletAngle) override;

    bool isDead() const { return mLives <= 0; }
    bool isPlayer() const override { return true; }

private:
    class Body;
    class Gun;

    Level* mLevel;
    std::shared_ptr<Body> mBody;
    std::shared_ptr<Gun> mGun;
    float mTimeSinceLastShot = 0.0f;
    float mDeathTime = 0.0f;
    int mLives;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
