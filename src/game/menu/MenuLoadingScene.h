
#pragma once
#include "LoadingScene.h"

class MenuLoadingScene : public LoadingScene
{
public:
    explicit MenuLoadingScene(Engine* engine);

    std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) override;
};
