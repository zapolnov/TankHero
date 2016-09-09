
#pragma once
#include "Obstacle.h"

class Tree : public Obstacle
{
public:
    Tree(Engine* engine, uint16_t mesh);

    void hitWithBullet(float bulletAngle) override;

private:
    float mFallAngle = 0.0f;
    bool mFalling = false;

    void update(float time) override;
};
