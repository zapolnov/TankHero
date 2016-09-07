#include "GameLoadingScene.h"
#include "src/game/game/GameScene.h"

GameLoadingScene::GameLoadingScene(Engine* engine)
    : LoadingScene(engine)
{
}

std::shared_ptr<Scene> GameLoadingScene::constructNextScene(Engine* engine, PendingResources& resources)
{
    return std::make_shared<GameScene>(engine, resources);
}
