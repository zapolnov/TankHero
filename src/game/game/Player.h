
#pragma once
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Player : public Node
{
public:
    Player(Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
    uint16_t mTankMesh;

    void draw(Renderer* renderer) override;
};
