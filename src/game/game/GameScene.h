
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"

class GameScene : public Scene
{
public:
    GameScene(Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
};
