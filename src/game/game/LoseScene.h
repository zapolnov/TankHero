
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>

class Engine;

class LoseScene : public Scene
{
public:
    static const glm::vec4 BACKGROUND_COLOR;

    LoseScene(Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
    uint16_t mTitleImage;
    uint16_t mExitNormalImage;
    uint16_t mExitPressedImage;
    uint16_t mClickSound;
    float mExitTimeout = -1.0f;

    void runFrame(Renderer* renderer, float time) override;
};
