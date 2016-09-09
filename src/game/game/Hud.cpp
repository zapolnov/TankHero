#include "Hud.h"
#include "PauseScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

static const float PAUSE_BUTTON_WIDTH = 64.0f;
static const float PAUSE_BUTTON_HEIGHT = 64.0f;

Hud::Hud(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    resourceQueue.textures.emplace(mPauseNormalImage = engine->renderer()->textureNameId("pause_normal.png"));
    resourceQueue.textures.emplace(mPausePressedImage = engine->renderer()->textureNameId("pause_pressed.png"));

    set2D(true);

    mCamera = std::make_shared<OrthoCamera>();
    setCamera(mCamera);

    mPauseButton = std::make_shared<Button>(mEngine, PAUSE_BUTTON_WIDTH, PAUSE_BUTTON_HEIGHT,
        mClickSound, mPauseNormalImage, mPausePressedImage);

    mPauseScene = std::make_shared<PauseScene>(mEngine, resourceQueue);

    resourceQueue.custom.emplace_back([this] {
        mPauseButton->onClick = [this]() {
                mEngine->renderer()->setClearColor(PauseScene::BACKGROUND_COLOR);
                mEngine->pushScene(mPauseScene);
            };
        appendChild(mPauseButton);
    });
}

void Hud::update(float time)
{
    RootNode::update(time);

    float buttonX = mCamera->right() - PAUSE_BUTTON_WIDTH + 10.0f;
    float buttonY = mCamera->top() - PAUSE_BUTTON_HEIGHT + 10.0f;
    if (buttonX != mButtonX || buttonY != mButtonY) {
        mButtonX = buttonX;
        mButtonY = buttonY;
        mPauseButton->setPosition2D(buttonX, buttonY);
    }
}
