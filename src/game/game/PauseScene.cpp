#include "PauseScene.h"
#include "GameScene.h"
#include "src/game/menu/MenuLoadingScene.h"
#include "src/game/menu/GameLoadingScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

const glm::vec4 PauseScene::BACKGROUND_COLOR(0.156863f, 0.156863f, 0.156863f, 1.0f);

static const float TITLE_W = 1024.0f;
static const float TITLE_H = 128.0f;
static const float TITLE_Y = 150.0f;

namespace
{
    class Title : public Node
    {
    public:
        explicit Title(uint16_t texture)
            : mTexture(texture)
        {
        }

        void draw(Renderer* renderer) override
        {
            float x1 = -TITLE_W * 0.5f;
            float y1 = TITLE_Y + TITLE_H;
            float x2 = TITLE_W * 0.5f;
            float y2 = TITLE_Y;

            auto canvas = renderer->begin2D();
            canvas->pushMatrix(worldMatrix());
            canvas->pushColor(glm::vec4(1.0f, 1.0f, 1.0f, 1.0f));

            canvas->drawSolidRect(glm::vec2(x1, y1), glm::vec2(x2, y2), mTexture);

            canvas->popColor();
            canvas->popMatrix();
            renderer->end2D();
        }

    private:
        uint16_t mTexture;
    };
}

PauseScene::PauseScene(Engine* engine, PendingResources& resourceQueue, int level)
    : mEngine(engine)
    , mLevel(level)
{
    mEngine->renderer()->setClearColor(PauseScene::BACKGROUND_COLOR);

    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    resourceQueue.textures.emplace(mTitleImage = engine->renderer()->textureNameId("pause_title.png"));
    resourceQueue.textures.emplace(mPlayNormalImage = engine->renderer()->textureNameId("continue_normal.png"));
    resourceQueue.textures.emplace(mPlayPressedImage = engine->renderer()->textureNameId("continue_pressed.png"));
    resourceQueue.textures.emplace(mRestartNormalImage = engine->renderer()->textureNameId("restart_normal.png"));
    resourceQueue.textures.emplace(mRestartPressedImage = engine->renderer()->textureNameId("restart_pressed.png"));
    resourceQueue.textures.emplace(mHelpNormalImage = engine->renderer()->textureNameId("help_normal.png"));
    resourceQueue.textures.emplace(mHelpPressedImage = engine->renderer()->textureNameId("help_pressed.png"));
    resourceQueue.textures.emplace(mExitNormalImage = engine->renderer()->textureNameId("exit_normal.png"));
    resourceQueue.textures.emplace(mExitPressedImage = engine->renderer()->textureNameId("exit_pressed.png"));

    mHelpScene = std::make_shared<HelpScene>(mEngine, resourceQueue);

    resourceQueue.custom.emplace_back([this] {
        auto rootNode = std::make_shared<RootNode>();
        rootNode->set2D(true);
        rootNode->setCamera(std::make_shared<OrthoCamera>());
        setRootNode(rootNode);

        rootNode->appendChild(std::make_shared<Title>(mTitleImage));

        const float BUTTON_WIDTH = 256.0f;
        const float BUTTON_HEIGHT = 64.0f;

        auto continueButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mPlayNormalImage, mPlayPressedImage);
        continueButton->setPosition2D(0.0f, BUTTON_HEIGHT * 1.5f + 5.0f);
        continueButton->onClick = [this]() {
                if (mExitTimeout < 0.0f && mRestartTimeout < 0.0f) {
                    mEngine->renderer()->setClearColor(GameScene::BACKGROUND_COLOR);
                    mEngine->popScene();
                }
            };
        rootNode->appendChild(continueButton);

        auto helpButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mHelpNormalImage, mHelpPressedImage);
        helpButton->setPosition2D(0.0f, 0.0f);
        helpButton->onClick = [this]() {
                if (mExitTimeout < 0.0f && mRestartTimeout < 0.0f)
                    mEngine->pushScene(mHelpScene);
            };
        rootNode->appendChild(helpButton);

        auto restartButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mRestartNormalImage, mRestartPressedImage);
        restartButton->setPosition2D(0.0f, -BUTTON_HEIGHT * 1.5f - 5.0f);
        restartButton->onClick = [this]() {
                if (mExitTimeout < 0.0f && mRestartTimeout < 0.0f)
                    mRestartTimeout = 0.2f;
            };
        rootNode->appendChild(restartButton);

        auto exitButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mExitNormalImage, mExitPressedImage);
        exitButton->setPosition2D(0.0f, -BUTTON_HEIGHT * 3.0f - 10.0f);
        exitButton->onClick = [this]() {
                if (mExitTimeout < 0.0f && mRestartTimeout < 0.0f)
                    mExitTimeout = 0.2f;
            };
        rootNode->appendChild(exitButton);
    });
}

void PauseScene::runFrame(Renderer* renderer, float time)
{
    Scene::runFrame(renderer, time);

    if (mExitTimeout > 0.0f) {
        mExitTimeout -= time;
        if (mExitTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<MenuLoadingScene>(mEngine));
    }

    if (mRestartTimeout > 0.0f) {
        mRestartTimeout -= time;
        if (mRestartTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<GameLoadingScene>(mEngine, mLevel));
    }
}
