
#pragma once
#include "Player.h"
#include "Obstacle.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/camera/PerspectiveCamera.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>
#include <string>
#include <memory>

class Level : public RootNode
{
public:
    static const float CELL_SIZE;

    Level(Engine* engine, PendingResources& resourceQueue);

    void load(const std::string& file);

private:
    Engine* mEngine;
    std::shared_ptr<PerspectiveCamera> mCamera;
    std::shared_ptr<Player> mPlayer;
    std::vector<std::shared_ptr<Obstacle>> mObstacles;
    std::vector<glm::mat4> mWorldTransform;
    std::unique_ptr<char[]> mLevelData;
    std::vector<char*> mLevelLines;
    uint16_t mTreeMesh;
    uint16_t mGrassMesh;
    uint16_t mRoadStraightMesh;
    uint16_t mRoadCornerMesh;
    uint16_t mRoadTJunctionMesh;
    uint16_t mRoadCrossingMesh;
    uint16_t mOfficeBuildingMesh;
    int mWidth;
    int mHeight;

    void update(float time) override;

    void beforeDraw(Renderer* renderer) override;
    void draw(Renderer* renderer) override;
};
