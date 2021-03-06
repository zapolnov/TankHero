
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"
#include "src/game/menu/HelpScene.h"
#include <glm/glm.hpp>

class Engine;

class PauseScene : public Scene
{
public:
    static const glm::vec4 BACKGROUND_COLOR;

    PauseScene(Engine* engine, PendingResources& resourceQueue, int level);

private:
    Engine* mEngine;
    uint16_t mTitleImage;
    uint16_t mPlayNormalImage;
    uint16_t mPlayPressedImage;
    uint16_t mRestartNormalImage;
    uint16_t mRestartPressedImage;
    uint16_t mHelpNormalImage;
    uint16_t mHelpPressedImage;
    uint16_t mExitNormalImage;
    uint16_t mExitPressedImage;
    uint16_t mClickSound;
    std::shared_ptr<HelpScene> mHelpScene;
    float mExitTimeout = -1.0f;
    float mRestartTimeout = -1.0f;
    int mLevel;

    void runFrame(Renderer* renderer, float time) override;
};
