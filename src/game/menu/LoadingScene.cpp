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
        {
        }

        void update(float) override
        {
            if (!mNextScene) {
                mNextScene = mLoadingScene->constructNextScene(mEngine, mPendingResources);
                mTotalResources = mPendingResources.meshes.size() + mPendingResources.textures.size();
            }

            size_t total = mTotalResources;
            size_t pending = mPendingResources.meshes.size() + mPendingResources.textures.size();

            auto start = std::chrono::steady_clock::now();
            while (pending > 0) {
                --pending;

              #ifndef NDEBUG
                printf("Loading %d/%d\n", int(total - pending), int(total));
              #endif

                if (!mPendingResources.meshes.empty()) {
                    auto it = mPendingResources.meshes.begin();
                    mEngine->renderer()->loadMesh(*it);
                    mPendingResources.meshes.erase(it);
                } else if (!mPendingResources.textures.empty()) {
                    auto it = mPendingResources.textures.begin();
                    mEngine->renderer()->loadTexture(*it);
                    mPendingResources.textures.erase(it);
                }

                auto current = std::chrono::steady_clock::now();
                if (std::chrono::duration_cast<std::chrono::duration<double>>(current - start).count() >= 1000.0 / 30.0)
                    break;
            }

            if (pending == 0) {
              #ifndef NDEBUG
                printf("Done loading\n");
              #endif
                mProgress = 1.0f;
                mEngine->setScene(mNextScene);
            } else {
                float progress = glm::clamp(float(total - pending) / float(total), 0.0f, 1.0f);
                if (progress > mProgress)
                    mProgress = progress;
            }
        }

        void draw(Renderer* renderer) override
        {
            float w = width() * 0.8f;
            float h = 20.0f;
            float halfW = w * 0.5f;
            float halfH = h * 0.5f;

            auto canvas = renderer->begin2D();
            canvas->pushMatrix(worldMatrix());
            canvas->pushColor(glm::vec4(0.5f, 0.9f, 0.2f, 1.0f));

            canvas->drawSolidRect(glm::vec2(-halfW, -halfH), glm::vec2(-halfW + mProgress * w, halfH));

            //renderer->setColor(glm::vec4(1.0f, 1.0f, 1.0f, 1.0f));
            //renderer->drawRect(-halfW, -halfH, halfW, halfH);

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
        float mProgress = 0.0f;
    };
}

LoadingScene::LoadingScene(Engine* engine)
{
    engine->renderer()->unloadAllMeshes();
    engine->renderer()->unloadAllTextures();

    auto rootNode = std::make_shared<ProgressBar>(engine, this);
    rootNode->setCamera(std::make_shared<OrthoCamera>());
    rootNode->set2D(true);
    setRootNode(rootNode);

}
