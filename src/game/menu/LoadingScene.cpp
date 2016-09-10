#include "GameLoadingScene.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/Engine.h"
#include <chrono>
#include <glm/glm.hpp>

namespace
{
    class ProgressBar : public RootNode
    {
    public:
        explicit ProgressBar(Engine* engine, LoadingScene* loadingScene)
            : mEngine(engine)
            , mLoadingScene(loadingScene)
            , mY(0.0f)
        {
        }

        void setY(float y)
        {
            mY = y;
        }

        void setColors(const glm::vec4& fill, const glm::vec4& border)
        {
            mFillColor = fill;
            mBorderColor = border;
        }

        void update(float) override
        {
            if (mDone)
                return;

            if (!mNextScene) {
                mNextScene = mLoadingScene->constructNextScene(mEngine, mPendingResources);
                mTotalResources = mPendingResources.totalPending();
            }

            size_t total = mTotalResources;
            size_t pending = mPendingResources.totalPending();

            if (mFirstUpdate)
                mFirstUpdate = false;
            else {
                auto start = std::chrono::steady_clock::now();
                size_t count = 0;
                while (pending > 0) {
                    --pending;

                  #ifndef NDEBUG
                    printf("Loading %d/%d\n", int(total - pending), int(total));
                  #endif

                    if (!mPendingResources.meshes.empty()) {
                        auto it = mPendingResources.meshes.begin();
                        mEngine->renderer()->loadMesh(*it);
                        mPendingResources.meshes.erase(it);
                    } else if (!mPendingResources.sounds.empty()) {
                        auto it = mPendingResources.sounds.begin();
                        mEngine->soundManager()->loadSound(*it);
                        mPendingResources.sounds.erase(it);
                    } else if (!mPendingResources.textures.empty()) {
                        auto it = mPendingResources.textures.begin();
                        mEngine->renderer()->loadTexture(*it);
                        mPendingResources.textures.erase(it);
                    } else if (!mPendingResources.custom.empty()) {
                        auto it = mPendingResources.custom.begin();
                        (*it)();
                        mPendingResources.custom.erase(it);
                    }

                    if (++count >= 5)
                        break;

                    auto current = std::chrono::steady_clock::now();
                    if (std::chrono::duration_cast<std::chrono::duration<double>>(current - start).count() >= 1000.0 / 30.0)
                        break;
                }

                if (pending == 0) {
                  #ifndef NDEBUG
                    printf("Done loading\n");
                  #endif
                    mProgress = 1.0f;
                    mLoadingScene->advanceToScene(mNextScene);
                    mDone = true;
                    return;
                }
            }

            float progress = glm::clamp(float(total - pending) / float(total), 0.0f, 1.0f);
            if (progress > mProgress)
                mProgress = progress;
        }

        void draw(Renderer* renderer) override
        {
            float w = width() * 0.8f;
            float h = 20.0f;
            float halfW = w * 0.5f;
            float halfH = h * 0.5f;

            auto canvas = renderer->begin2D();
            canvas->pushMatrix(worldMatrix());

            auto min = glm::vec2(-halfW, mY - halfH);
            auto max1 = glm::vec2(-halfW + mProgress * w, mY + halfH);
            auto max2 = glm::vec2( halfW, mY + halfH);

            canvas->pushColor(mBorderColor);
            canvas->drawSolidRect(min - mBorderWidth, max2 + mBorderWidth);
            canvas->popColor();

            canvas->pushColor(mFillColor);
            canvas->drawSolidRect(min, max1);
            canvas->popColor();

            canvas->popMatrix();
            renderer->end2D();
        }

    private:
        Engine* mEngine;
        LoadingScene* mLoadingScene;
        std::shared_ptr<Scene> mNextScene;
        PendingResources mPendingResources;
        size_t mTotalResources;
        glm::vec4 mFillColor{0.5f, 0.9f, 0.2f, 1.0f};
        glm::vec4 mBorderColor{1.0f, 1.0f, 1.0f, 1.0f};
        float mBorderWidth = 5.0f;
        float mProgress = 0.0f;
        float mY;
        bool mFirstUpdate = true;
        bool mDone = false;
    };
}

LoadingScene::LoadingScene(Engine* engine)
    : mEngine(engine)
{
    engine->soundManager()->unloadAllSounds();
    engine->renderer()->unloadAllMeshes();
    engine->renderer()->unloadAllTextures();

    auto rootNode = std::make_shared<ProgressBar>(engine, this);
    rootNode->setCamera(std::make_shared<OrthoCamera>());
    rootNode->set2D(true);
    setRootNode(rootNode);
}

void LoadingScene::advanceToScene(const std::shared_ptr<Scene>& scene)
{
    mEngine->setScene(scene);
}

void LoadingScene::setProgressBarPosition(float y)
{
    std::static_pointer_cast<ProgressBar>(rootNode())->setY(y);
}

void LoadingScene::setProgressBarColors(const glm::vec4& fill, const glm::vec4& border)
{
    std::static_pointer_cast<ProgressBar>(rootNode())->setColors(fill, border);
}
