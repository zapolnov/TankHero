
#pragma once
#include "LoadingScene.h"

class GameLoadingScene : public LoadingScene
{
public:
    GameLoadingScene(Engine* engine, int level);

    std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) override;
    void advanceToScene(const std::shared_ptr<Scene>& scene) override;

private:
    int mLevel;
};
