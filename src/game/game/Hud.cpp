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

static const float HEART_WIDTH = 32.0f;
static const float HEART_HEIGHT = 32.0f;

static const float ENEMY_COUNT_X = 460.0f;
static const float ENEMY_COUNT_WIDTH = 512.0f;
static const float ENEMY_COUNT_HEIGHT = 64.0f;

static const float DIGIT_WIDTH = 64.0f;
static const float DIGIT_HEIGHT = 64.0f;
static const float DIGIT_ADVANCE = 28.0f;

Hud::Hud(const std::shared_ptr<Level>& level, Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
    , mLevel(level)
{
    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    resourceQueue.textures.emplace(mHeart = engine->renderer()->textureNameId("heart.png"));
    resourceQueue.textures.emplace(mEnemiesLeft = engine->renderer()->textureNameId("enemies_left.png"));
    resourceQueue.textures.emplace(mDigits[0] = engine->renderer()->textureNameId("0.png"));
    resourceQueue.textures.emplace(mDigits[1] = engine->renderer()->textureNameId("1.png"));
    resourceQueue.textures.emplace(mDigits[2] = engine->renderer()->textureNameId("2.png"));
    resourceQueue.textures.emplace(mDigits[3] = engine->renderer()->textureNameId("3.png"));
    resourceQueue.textures.emplace(mDigits[4] = engine->renderer()->textureNameId("4.png"));
    resourceQueue.textures.emplace(mDigits[5] = engine->renderer()->textureNameId("5.png"));
    resourceQueue.textures.emplace(mDigits[6] = engine->renderer()->textureNameId("6.png"));
    resourceQueue.textures.emplace(mDigits[7] = engine->renderer()->textureNameId("7.png"));
    resourceQueue.textures.emplace(mDigits[8] = engine->renderer()->textureNameId("8.png"));
    resourceQueue.textures.emplace(mDigits[9] = engine->renderer()->textureNameId("9.png"));
    resourceQueue.textures.emplace(mPauseNormalImage = engine->renderer()->textureNameId("pause_normal.png"));
    resourceQueue.textures.emplace(mPausePressedImage = engine->renderer()->textureNameId("pause_pressed.png"));

    set2D(true);

    mCamera = std::make_shared<OrthoCamera>();
    setCamera(mCamera);

    mPauseButton = std::make_shared<Button>(mEngine, PAUSE_BUTTON_WIDTH, PAUSE_BUTTON_HEIGHT,
        mClickSound, mPauseNormalImage, mPausePressedImage);

    mPauseScene = std::make_shared<PauseScene>(mEngine, resourceQueue, level->index());

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

void Hud::draw(Renderer* renderer)
{
    RootNode::draw(renderer);

    auto level = mLevel.lock();
    if (level) {
        float x = mCamera->left() + 10.0f + HEART_WIDTH * 0.5f;
        float y = mCamera->top() - HEART_HEIGHT + 10.0f;
        float y2 = mCamera->bottom() + HEART_HEIGHT + 10.0f;

        auto canvas = renderer->begin2D();
        canvas->pushMatrix(glm::mat4(1.0f));
        canvas->pushColor(glm::vec4(1.0f));

        for (int i = 0; i < level->playerLives(); i++) {
            canvas->drawSolidRect(
                glm::vec2(x - HEART_WIDTH * 0.5f, y + HEART_HEIGHT * 0.5f),
                glm::vec2(x + HEART_WIDTH * 0.5f, y - HEART_HEIGHT * 0.5f),
                mHeart);
             x += HEART_WIDTH + 10.0f;
        }

        canvas->drawSolidRect(
            glm::vec2(-ENEMY_COUNT_WIDTH * 0.5f, y2 + ENEMY_COUNT_HEIGHT * 0.5f),
            glm::vec2( ENEMY_COUNT_WIDTH * 0.5f, y2 - ENEMY_COUNT_HEIGHT * 0.5f),
            mEnemiesLeft);

        auto level = mLevel.lock();
        int count = (level ? level->enemyCount() : 0);
        count = glm::clamp(count, 0, 99);

        float digitX = -ENEMY_COUNT_WIDTH * 0.5f + ENEMY_COUNT_X;
        canvas->drawSolidRect(
            glm::vec2(digitX - DIGIT_WIDTH, y2 + DIGIT_HEIGHT * 0.5f),
            glm::vec2(digitX              , y2 - DIGIT_HEIGHT * 0.5f),
            mDigits[count % 10]);

        digitX -= DIGIT_ADVANCE;
        canvas->drawSolidRect(
            glm::vec2(digitX - DIGIT_WIDTH, y2 + DIGIT_HEIGHT * 0.5f),
            glm::vec2(digitX              , y2 - DIGIT_HEIGHT * 0.5f),
            mDigits[count / 10]);

        canvas->popColor();
        canvas->popMatrix();
        renderer->end2D();
    }
}
