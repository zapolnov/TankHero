#include "GameScene.h"
#include "Level.h"
#include "src/engine/sound/SoundManager.h"
#include "src/engine/Engine.h"

GameScene::GameScene(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    mEngine->renderer()->setClearColor(glm::vec4(0.1f, 0.3f, 0.7f, 1.0f));

    uint16_t music = engine->soundManager()->soundNameId("S31-Unexpected Trouble.ogg");
    resourceQueue.sounds.emplace(music);

    auto level = std::make_shared<Level>(engine, resourceQueue);
    resourceQueue.custom.emplace_back([this, level, music] {
        level->load("level1.dat");
        setRootNode(level);
        mEngine->soundManager()->play(music, true);
    });
}
