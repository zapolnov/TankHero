
#pragma once
#include "PauseScene.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>

class Engine;

class Hud : public RootNode
{
public:
    Hud(Engine* engine, PendingResources& resourceQueue, int level);

protected:
    void update(float time) override;

private:
    Engine* mEngine;
    std::shared_ptr<OrthoCamera> mCamera;
    std::shared_ptr<Button> mPauseButton;
    std::shared_ptr<PauseScene> mPauseScene;
    uint16_t mPauseNormalImage;
    uint16_t mPausePressedImage;
    uint16_t mClickSound;
    float mButtonX = 0.0f;
    float mButtonY = 0.0f;
    int mLevel;
};
