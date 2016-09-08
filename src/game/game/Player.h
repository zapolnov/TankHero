
#pragma once
#include "src/engine/scene/Node.h"
#include "src/game/menu/LoadingScene.h"

class Player : public Node
{
public:
    Player(Engine* engine, PendingResources& resourceQueue);

private:
    class Body;
    class Gun;

    Engine* mEngine;
    std::shared_ptr<Body> mBody;
    std::shared_ptr<Gun> mGun;

    void update(float time) override;
};
