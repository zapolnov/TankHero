
#pragma once
#include "Obstacle.h"

class Tree : public Obstacle
{
public:
    Tree(Engine* engine, uint16_t mesh);

    bool hitWithBullet(float bulletAngle, bool shotByPlayer) override;

private:
    float mFallAngle = 0.0f;
    bool mFalling = false;

    void update(float time) override;
};
