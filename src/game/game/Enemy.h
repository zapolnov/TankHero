
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
        int initialLives;
    };

    Enemy(Engine* engine, Level* level, const Descriptor& desc);

    glm::vec2 direction() const;

    glm::vec2 boundingSphereWorldCenter() const override { return position2D(); }
    float boundingSphereRadius() const override { return 2.0f; }

    bool hitWithBullet(float bulletAngle, bool shotByPlayer) override;

private:
    class Visual;

    Level* mLevel;
    std::shared_ptr<Visual> mVisual;
    float mTargetAngle = 0.0f;
    float mTimeSinceLastShot = 0.0f;
    float mTimeSinceLastTurn = 0.0f;
    float mDeathTime = 0.0f;
    int mLives;
    bool mInitialized = false;
    bool mMovedAfterTurn = false;
    bool mRotating = false;
    bool mLeftHanded = false;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;
    int localUpAxis() const override { return 2; }

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
