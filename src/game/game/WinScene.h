
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>

class Engine;

class WinScene : public Scene
{
public:
    static const glm::vec4 BACKGROUND_COLOR;

    WinScene(Engine* engine, PendingResources& resourceQueue, int level);

private:
    Engine* mEngine;
    uint16_t mTitleImage;
    uint16_t mContinueNormalImage;
    uint16_t mContinuePressedImage;
    uint16_t mExitNormalImage;
    uint16_t mExitPressedImage;
    uint16_t mClickSound;
    float mContinueTimeout = -1.0f;
    float mExitTimeout = -1.0f;
    int mLevel;

    void runFrame(Renderer* renderer, float time) override;
};
