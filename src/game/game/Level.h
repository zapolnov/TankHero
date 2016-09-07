
#pragma once
#include "Player.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/camera/PerspectiveCamera.h"
#include "src/game/menu/LoadingScene.h"
#include <string>
#include <memory>

class Level : public RootNode
{
public:
    Level(Engine* engine, PendingResources& resourceQueue);

    void load(const std::string& file);

private:
    Engine* mEngine;
    std::shared_ptr<PerspectiveCamera> mCamera;
    std::shared_ptr<Player> mPlayer;

    void beforeDraw(Renderer* renderer) override;
};
