#include "GameScene.h"
#include "Hud.h"
#include "Level.h"
#include "src/engine/sound/SoundManager.h"
#include "src/engine/Engine.h"

const glm::vec4 GameScene::BACKGROUND_COLOR = glm::vec4(0.1f, 0.3f, 0.7f, 1.0f);

GameScene::GameScene(Engine* engine, PendingResources& resourceQueue, int levelNo)
    : mEngine(engine)
{
    uint16_t music = engine->soundManager()->soundNameId("S31-Unexpected Trouble.ogg");
    resourceQueue.sounds.emplace(music);

    auto hud = std::make_shared<Hud>(engine, resourceQueue, levelNo);
    setHudNode(hud);

    auto level = std::make_shared<Level>(engine, resourceQueue, levelNo);
    resourceQueue.custom.emplace_back([this, level, music] {
        level->load();
        setRootNode(level);
        mEngine->soundManager()->play(music, true);
    });
}
