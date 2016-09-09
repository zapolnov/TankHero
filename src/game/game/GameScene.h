
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>

class GameScene : public Scene
{
public:
    static const glm::vec4 BACKGROUND_COLOR;

    GameScene(Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
};
