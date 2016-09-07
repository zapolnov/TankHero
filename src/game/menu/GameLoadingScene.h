
#pragma once
#include "LoadingScene.h"

class GameLoadingScene : public LoadingScene
{
public:
    explicit GameLoadingScene(Engine* engine);

    std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) override;
};