#include "WinScene.h"
#include "Level.h"
#include "src/game/menu/MenuLoadingScene.h"
#include "src/game/menu/GameLoadingScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

const glm::vec4 WinScene::BACKGROUND_COLOR(0.156863f, 0.156863f, 0.156863f, 1.0f);

static const float TITLE_W = 1024.0f;
static const float TITLE_H = 128.0f;
static const float TITLE_Y = 200.0f;

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

WinScene::WinScene(Engine* engine, PendingResources& resourceQueue, int level)
    : mEngine(engine)
    , mLevel(level)
{
    mEngine->renderer()->setClearColor(WinScene::BACKGROUND_COLOR);

    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    if (level >= Level::TOTAL_COUNT)
        resourceQueue.textures.emplace(mTitleImage = engine->renderer()->textureNameId("end_title.png"));
    else
        resourceQueue.textures.emplace(mTitleImage = engine->renderer()->textureNameId("win_title.png"));

    resourceQueue.textures.emplace(mContinueNormalImage = engine->renderer()->textureNameId("continue_normal.png"));
    resourceQueue.textures.emplace(mContinuePressedImage = engine->renderer()->textureNameId("continue_pressed.png"));
    resourceQueue.textures.emplace(mExitNormalImage = engine->renderer()->textureNameId("exit_normal.png"));
    resourceQueue.textures.emplace(mExitPressedImage = engine->renderer()->textureNameId("exit_pressed.png"));

    resourceQueue.custom.emplace_back([this, level] {
        auto rootNode = std::make_shared<RootNode>();
        rootNode->set2D(true);
        rootNode->setCamera(std::make_shared<OrthoCamera>());
        setRootNode(rootNode);

        rootNode->appendChild(std::make_shared<Title>(mTitleImage));

        const float BUTTON_WIDTH = 256.0f;
        const float BUTTON_HEIGHT = 64.0f;

        if (level < Level::TOTAL_COUNT) {
            auto continueButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
                mClickSound, mContinueNormalImage, mContinuePressedImage);
            continueButton->setPosition2D(0.0f, 5.0f);
            continueButton->onClick = [this]() {
                    if (mContinueTimeout < 0.0f && mExitTimeout < 0.0f)
                        mContinueTimeout = 0.2f;
                };
            rootNode->appendChild(continueButton);
        }

        auto exitButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mExitNormalImage, mExitPressedImage);
        exitButton->setPosition2D(0.0f, (level >= Level::TOTAL_COUNT ? 0.0f : -5.0f - BUTTON_HEIGHT));
        exitButton->onClick = [this]() {
                if (mExitTimeout < 0.0f && mContinueTimeout < 0.0f)
                    mExitTimeout = 0.2f;
            };
        rootNode->appendChild(exitButton);
    });
}

void WinScene::runFrame(Renderer* renderer, float time)
{
    Scene::runFrame(renderer, time);

    if (mExitTimeout > 0.0f) {
        mExitTimeout -= time;
        if (mExitTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<MenuLoadingScene>(mEngine));
    }

    if (mContinueTimeout > 0.0f) {
        mContinueTimeout -= time;
        if (mContinueTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<GameLoadingScene>(mEngine, mLevel + 1));
    }
}
