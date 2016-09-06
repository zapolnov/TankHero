#include "menu/MainMenuScene.h"
#include "src/engine/Game.h"

void gameInit(Engine* engine)
{
    engine->setScene(std::make_shared<MainMenuScene>(engine));
}
