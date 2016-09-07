#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

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

    resourceQueue.meshes.emplace(mTreeMesh = engine->renderer()->meshNameId("tree.mesh"));
}

void Level::load(const std::string& file)
{
    appendChild(mPlayer);

    mWidth = 10;
    mHeight = 10;

    auto tree = std::make_shared<Obstacle>(mEngine, mTreeMesh);
    tree->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
    tree->setScale(0.5f);
    tree->setPosition(2.0f, 2.0f, 0.0f);
    appendChild(tree);

    tree = std::make_shared<Obstacle>(mEngine, mTreeMesh);
    tree->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
    tree->setScale(0.5f);
    tree->setPosition(-2.0f, 2.0f, 0.0f);
    appendChild(tree);

    tree = std::make_shared<Obstacle>(mEngine, mTreeMesh);
    tree->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
    tree->setScale(0.5f);
    tree->setPosition(-2.0f, -2.0f, 0.0f);
    appendChild(tree);

    tree = std::make_shared<Obstacle>(mEngine, mTreeMesh);
    tree->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
    tree->setScale(0.5f);
    tree->setPosition(2.0f, -2.0f, 0.0f);
    appendChild(tree);
}

void Level::update(float time)
{
    RootNode::update(time);
}

void Level::beforeDraw(Renderer* renderer)
{
    auto lightPosition = glm::vec3(-400.0f, -400.0f, -400.0f);
    renderer->setLight(lightPosition, glm::vec3(1.0f), 1.0f);

    RootNode::beforeDraw(renderer);
}
