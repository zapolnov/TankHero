#include "MainMenuScene.h"
#include "GameLoadingScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/Engine.h"

const glm::vec4 MainMenuScene::BACKGROUND_COLOR(0.156863f, 0.156863f, 0.156863f, 1.0f);

static const float LOGO_W = 512.0f;
static const float LOGO_H = 256.0f;
static const float LOGO_Y = 30.0f;

static const float COPYRIGHT_W = 1024.0f;
static const float COPYRIGHT_H = 64.0f;
static const float COPYRIGHT_Y = -260.0f;

namespace
{
    class Logo : public Node
    {
    public:
        explicit Logo(uint16_t texture)
            : mTexture(texture)
        {
        }

        void draw(Renderer* renderer) override
        {
            float x1 = -LOGO_W * 0.5f;
            float y1 = LOGO_Y + LOGO_H;
            float x2 = LOGO_W * 0.5f;
            float y2 = LOGO_Y;

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

    class Copyright : public Node
    {
    public:
        Copyright(MainMenuScene* scene, uint16_t texture)
            : mScene(scene)
            , mTexture(texture)
        {
        }

        void draw(Renderer* renderer) override
        {
            float x1 = -COPYRIGHT_W * 0.5f;
            float y1 = COPYRIGHT_Y + COPYRIGHT_H;
            float x2 = COPYRIGHT_W * 0.5f;
            float y2 = COPYRIGHT_Y;

            auto canvas = renderer->begin2D();
            canvas->pushMatrix(worldMatrix());
            canvas->pushColor(glm::vec4(1.0f, 1.0f, 1.0f, 1.0f));

            canvas->drawSolidRect(glm::vec2(x1, y1), glm::vec2(x2, y2), mTexture);

            canvas->popColor();
            canvas->popMatrix();
            renderer->end2D();
        }

    private:
        MainMenuScene* mScene;
        uint16_t mTexture;
    };
}

MainMenuScene::MainMenuScene(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    mEngine->renderer()->setClearColor(MainMenuScene::BACKGROUND_COLOR);

    uint16_t music = engine->soundManager()->soundNameId("S31-Grime of the City.ogg");
    resourceQueue.sounds.emplace(music);
    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    resourceQueue.textures.emplace(mLogoImage = engine->renderer()->textureNameId("small_logo.png"));
    resourceQueue.textures.emplace(mCopyrightImage = engine->renderer()->textureNameId("copyright.png"));
    resourceQueue.textures.emplace(mPlayNormalImage = engine->renderer()->textureNameId("play_normal.png"));
    resourceQueue.textures.emplace(mPlayPressedImage = engine->renderer()->textureNameId("play_pressed.png"));
    resourceQueue.textures.emplace(mHelpNormalImage = engine->renderer()->textureNameId("help_normal.png"));
    resourceQueue.textures.emplace(mHelpPressedImage = engine->renderer()->textureNameId("help_pressed.png"));

    mHelpScene = std::make_shared<HelpScene>(mEngine, resourceQueue);

    resourceQueue.custom.emplace_back([this, music] {
        auto rootNode = std::make_shared<RootNode>();
        rootNode->set2D(true);
        rootNode->setCamera(std::make_shared<OrthoCamera>());
        setRootNode(rootNode);

        rootNode->appendChild(std::make_shared<Logo>(mLogoImage));
        rootNode->appendChild(std::make_shared<Copyright>(this, mCopyrightImage));

        const float BUTTON_WIDTH = 256.0f;
        const float BUTTON_HEIGHT = 64.0f;

        auto newGameButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mPlayNormalImage, mPlayPressedImage);
        newGameButton->setPosition2D(0.0f, 30.0f - BUTTON_HEIGHT);
        newGameButton->onClick = [this]() {
                if (mStartLevelTimeout < 0.0f)
                    mStartLevelTimeout = 0.2f;
            };
        rootNode->appendChild(newGameButton);

        auto helpButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mHelpNormalImage, mHelpPressedImage);
        helpButton->setPosition2D(0.0f, 30.0f - (BUTTON_HEIGHT + 15.0f + BUTTON_HEIGHT));
        helpButton->onClick = [this]() {
                if (mStartLevelTimeout < 0.0f)
                    mEngine->pushScene(mHelpScene);
            };
        rootNode->appendChild(helpButton);

        mEngine->soundManager()->play(music, true);
    });
}

void MainMenuScene::runFrame(Renderer* renderer, float time)
{
    Scene::runFrame(renderer, time);
    if (mStartLevelTimeout > 0.0f) {
        mStartLevelTimeout -= time;
        if (mStartLevelTimeout <= 0.0f)
            mEngine->setScene(std::make_shared<GameLoadingScene>(mEngine, 1));
    }
}
