#include "InitialLoadingScene.h"
#include "src/engine/Engine.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/render/Canvas.h"
#include "src/game/menu/MainMenuScene.h"

static const float LOGO_W = 1024.0f;
static const float LOGO_H = 512.0f;

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
            float y1 =  LOGO_H * 0.5f;
            float x2 =  LOGO_W * 0.5f;
            float y2 = -LOGO_H * 0.5f;

            auto canvas = renderer->begin2D();
            canvas->pushMatrix(worldMatrix());
            canvas->pushColor(glm::vec4(0.0f, 1.0f, 1.0f, 1.0f));

            canvas->drawSolidRect(glm::vec2(x1, y1), glm::vec2(x2, y2), mTexture);

            canvas->popColor();
            canvas->popMatrix();
            renderer->end2D();
        }

    private:
        uint16_t mTexture;
    };
}

InitialLoadingScene::InitialLoadingScene(Engine* engine)
    : LoadingScene(engine)
    , mLoadingTime(-1.0f)
{
    mEngine->renderer()->setClearColor(MainMenuScene::BACKGROUND_COLOR);

    setProgressBarPosition(-LOGO_H * 0.5f - 40.0f);
    setProgressBarColors(
        glm::vec4(104.0f / 255.0f, 175.0f / 255.0f, 98.0f / 255.0f, 1.0f),
        glm::vec4( 35.0f / 255.0f,  64.0f / 255.0f, 33.0f / 255.0f, 1.0f)
    );

    auto logoImage = engine->renderer()->textureNameId("logo.png");
    engine->renderer()->loadTexture(logoImage);
    rootNode()->appendChild(std::make_shared<Logo>(logoImage));
}

std::shared_ptr<Scene> InitialLoadingScene::constructNextScene(Engine* engine, PendingResources& resources)
{
    return std::make_shared<MainMenuScene>(engine, resources);
}

void InitialLoadingScene::advanceToScene(const std::shared_ptr<Scene>& scene)
{
    mNextScene = scene;
    mLoadingTime = 2.0f;
    mSkipFrame = true;
}

void InitialLoadingScene::runFrame(Renderer* renderer, float time)
{
    Scene::runFrame(renderer, time);

    if (mLoadingTime > 0.0f) {
        if (mSkipFrame)
            mSkipFrame = false;
        else {
            mLoadingTime -= time;
            if (mLoadingTime <= 0.0f) {
                mEngine->setScene(mNextScene);
                mNextScene.reset();
            }
        }
    }
}
