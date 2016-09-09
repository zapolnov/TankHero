
#pragma once
#include "LoadingScene.h"

class InitialLoadingScene : public LoadingScene
{
public:
    explicit InitialLoadingScene(Engine* engine);

    std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) override;
    void advanceToScene(const std::shared_ptr<Scene>& scene) override;

private:
    float mLoadingTime;
    std::shared_ptr<Scene> mNextScene;
    bool mSkipFrame = true;

    void runFrame(Renderer* renderer, float time) override;
};
