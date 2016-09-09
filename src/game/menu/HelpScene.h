
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>

class Engine;

class HelpScene : public Scene
{
public:
    static const glm::vec4 BACKGROUND_COLOR;

    HelpScene(Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
    uint16_t mImage;
    uint16_t mClickSound;
    uint16_t mGoBackNormalImage;
    uint16_t mGoBackPressedImage;
};
