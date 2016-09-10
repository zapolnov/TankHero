
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

    bool hitWithBullet(float bulletAngle) override;

private:
    class Visual;

    Level* mLevel;
    std::shared_ptr<Visual> mVisual;
    float mTimeSinceLastShot = 0.0f;
    float mDeathTime = 0.0f;
    int mLives;
    bool mInitialized = false;

    const glm::mat4& bboxToWorldTransform() override;
    std::pair<glm::vec3, glm::vec3> localAABox() const override;
    int localUpAxis() const override { return 2; }

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
