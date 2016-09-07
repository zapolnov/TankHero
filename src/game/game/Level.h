
#pragma once
#include "Player.h"
#include "Obstacle.h"
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
    std::vector<std::shared_ptr<Obstacle>> mObstacles;
    uint16_t mTreeMesh;
    int mWidth;
    int mHeight;

    void update(float time) override;
    void beforeDraw(Renderer* renderer) override;
};
