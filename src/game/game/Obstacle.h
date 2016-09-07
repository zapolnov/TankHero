
#pragma once
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Obstacle : public Node
{
public:
    Obstacle(Engine* engine, uint16_t mesh);

private:
    Engine* mEngine;
    uint16_t mMesh;

    void draw(Renderer* renderer) override;
};
