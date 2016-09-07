#include "GameScene.h"
#include "Level.h"

GameScene::GameScene(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    auto level = std::make_shared<Level>(engine, resourceQueue);
    resourceQueue.custom.emplace_back([this, level]{
        level->load("level1.dat");
        setRootNode(level);
    });
}
