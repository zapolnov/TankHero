
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/game/menu/LoadingScene.h"
#include "HelpScene.h"
#include <glm/glm.hpp>

class Engine;

class MainMenuScene : public Scene
{
public:
    static const glm::vec4 BACKGROUND_COLOR;

    MainMenuScene(Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
    uint16_t mLogoImage;
    uint16_t mCopyrightImage;
    uint16_t mPlayNormalImage;
    uint16_t mPlayPressedImage;
    uint16_t mHelpNormalImage;
    uint16_t mHelpPressedImage;
    uint16_t mClickSound;
    float mStartLevelTimeout = -1.0f;
    std::shared_ptr<HelpScene> mHelpScene;

    void runFrame(Renderer* renderer, float time) override;
};
