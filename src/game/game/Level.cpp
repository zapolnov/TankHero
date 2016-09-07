#include "Level.h"
#include "src/engine/render/Renderer.h"

Level::Level(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    mCamera = std::make_shared<PerspectiveCamera>();
    mCamera->setFov(glm::radians(45.0f));
    mCamera->setNearZ(1.0f);
    mCamera->setFarZ(100.0f);
    mCamera->lookAt(glm::vec3(-15.0f, 15.0f, 15.0f), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 0.0f, 1.0f));
    setCamera(mCamera);

    mPlayer = std::make_shared<Player>(mEngine, resourceQueue);
}

void Level::load(const std::string& file)
{
    appendChild(mPlayer);
}

void Level::beforeDraw(Renderer* renderer)
{
    auto lightPosition = glm::vec3(-400.0f, -400.0f, -400.0f);
    renderer->setLight(lightPosition, glm::vec3(1.0f), 1.0f);

    RootNode::beforeDraw(renderer);
}
