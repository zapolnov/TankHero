
#pragma once
#include "PauseScene.h"
#include "Level.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>

class Engine;

class Hud : public RootNode
{
public:
    Hud(const std::shared_ptr<Level>& level, Engine* engine, PendingResources& resourceQueue);

private:
    Engine* mEngine;
    std::weak_ptr<Level> mLevel;
    std::shared_ptr<OrthoCamera> mCamera;
    std::shared_ptr<Button> mPauseButton;
    std::shared_ptr<PauseScene> mPauseScene;
    uint16_t mEnemiesLeft;
    uint16_t mDigits[10];
    uint16_t mHeart;
    uint16_t mPauseNormalImage;
    uint16_t mPausePressedImage;
    uint16_t mClickSound;
    float mButtonX = 0.0f;
    float mButtonY = 0.0f;

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
