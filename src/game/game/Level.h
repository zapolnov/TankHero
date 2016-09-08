
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
    struct Cell
    {
        std::vector<std::shared_ptr<Obstacle>> obstacles;
        glm::mat4 worldTransform{1.0f};
        float posX;
        float posY;
        char levelMarker;
    };

    Engine* mEngine;
    std::shared_ptr<PerspectiveCamera> mCamera;
    std::shared_ptr<Player> mPlayer;
    std::vector<std::vector<Cell>> mCells;
    glm::vec2 mVisibleMin;
    glm::vec2 mVisibleMax;
    uint16_t mTreeMesh;
    uint16_t mGrassMesh;
    uint16_t mRoadStraightMesh;
    uint16_t mRoadCornerMesh;
    uint16_t mRoadTJunctionMesh;
    uint16_t mRoadCrossingMesh;
    uint16_t mRoadEndMesh;
    uint16_t mOfficeBuildingMesh;
    uint16_t mRiverCornerMesh;
    uint16_t mRiverEndMesh;
    uint16_t mRiverStraightMesh;
    uint16_t mWaterMesh;
    int mWidth;
    int mHeight;

    void update(float time) override;

    void beforeDraw(Renderer* renderer) override;
    void draw(Renderer* renderer) override;
};
