#include "LoseScene.h"
#include "src/game/menu/MenuLoadingScene.h"
#include "src/game/menu/GameLoadingScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

const glm::vec4 LoseScene::BACKGROUND_COLOR(0.156863f, 0.156863f, 0.156863f, 1.0f);

static const float TITLE_W = 1024.0f;
static const float TITLE_H = 128.0f;
static const float TITLE_Y = 50.0f;

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

LoseScene::LoseScene(Engine* engine, PendingResources& resourceQueue, int level)
    : mEngine(engine)
    , mLevel(level)
{
    mEngine->renderer()->setClearColor(LoseScene::BACKGROUND_COLOR);

    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    resourceQueue.textures.emplace(mTitleImage = engine->renderer()->textureNameId("lose_title.png"));
    resourceQueue.textures.emplace(mRestartNormalImage = engine->renderer()->textureNameId("restart_normal.png"));
    resourceQueue.textures.emplace(mRestartPressedImage = engine->renderer()->textureNameId("restart_pressed.png"));
    resourceQueue.textures.emplace(mExitNormalImage = engine->renderer()->textureNameId("exit_normal.png"));
    resourceQueue.textures.emplace(mExitPressedImage = engine->renderer()->textureNameId("exit_pressed.png"));

    resourceQueue.custom.emplace_back([this] {
        auto rootNode = std::make_shared<RootNode>();
        rootNode->set2D(true);
        rootNode->setCamera(std::make_shared<OrthoCamera>());
        setRootNode(rootNode);

        rootNode->appendChild(std::make_shared<Title>(mTitleImage));

        const float BUTTON_WIDTH = 256.0f;
        const float BUTTON_HEIGHT = 64.0f;

        auto restartButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mRestartNormalImage, mRestartPressedImage);
        restartButton->setPosition2D(0.0f, 5.0f);
        restartButton->onClick = [this]() {
                if (mRestartTimeout < 0.0f && mExitTimeout < 0.0f)
                    mRestartTimeout = 0.2f;
            };
        rootNode->appendChild(restartButton);

        auto exitButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mExitNormalImage, mExitPressedImage);
        exitButton->setPosition2D(0.0f,  -5.0f - BUTTON_HEIGHT);
        exitButton->onClick = [this]() {
                if (mExitTimeout < 0.0f && mRestartTimeout < 0.0f)
                    mExitTimeout = 0.2f;
            };
        rootNode->appendChild(exitButton);
    });
}

void LoseScene::runFrame(Renderer* renderer, float time)
{
    Scene::runFrame(renderer, time);

    if (mRestartTimeout > 0.0f) {
        mRestartTimeout -= time;
        if (mRestartTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<GameLoadingScene>(mEngine, mLevel));
    }

    if (mExitTimeout > 0.0f) {
        mExitTimeout -= time;
        if (mExitTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<MenuLoadingScene>(mEngine));
    }
}
