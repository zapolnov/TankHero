#include "src/game/menu/InitialLoadingScene.h"
#include "src/game/menu/MainMenuScene.h"
#include "src/engine/Engine.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Game.h"

namespace
{
    class TransferScene : public Scene
    {
    public:
        explicit TransferScene(Engine* engine)
            : mEngine(engine)
        {
            engine->renderer()->setClearColor(MainMenuScene::BACKGROUND_COLOR);
        }

        void runFrame(Renderer* renderer, float time) override
        {
            Scene::runFrame(renderer, time);
            if (mFirstFrame)
                mFirstFrame = false;
            else
                mEngine->setScene(std::make_shared<InitialLoadingScene>(mEngine));
        }

    private:
        Engine* mEngine;
        bool mFirstFrame = true;
    };
}

void gameInit(Engine* engine)
{
    engine->setScene(std::make_shared<TransferScene>(engine));
}
