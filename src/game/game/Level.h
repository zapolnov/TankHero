
#pragma once
#include "Player.h"
#include "Obstacle.h"
#include "Enemy.h"
#include "LoseScene.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/camera/PerspectiveCamera.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>
#include <utility>
#include <string>
#include <memory>

class Level : public RootNode
{
public:
    static const float CELL_SIZE;

    Level(Engine* engine, PendingResources& resourceQueue);

    int width() const { return mWidth; }
    int height() const { return mHeight; }

    void load(const std::string& file);

    glm::ivec2 cellForPoint(const glm::vec2& point) const;
    std::pair<glm::ivec2, glm::ivec2> cellsForBoundingBox(const OBB2D& box) const;

    std::shared_ptr<Collidable> collideOnMove(Collidable& collidable, const glm::vec2& dir, float& length,
        const Collidable* ignore = nullptr);
    std::shared_ptr<Collidable> collideOnMove(const OBB2D& sourceBox, const OBB2D& targetBox,
        float* penetrationDepth = nullptr, const Collidable* ignore = nullptr);

    void showLoseScreen();

    void spawnBullet(const std::shared_ptr<Collidable>& emitter, const glm::vec3& position, const glm::vec2& dir);
    void spawnBulletExplosion(const glm::vec3& position);
    void spawnEnemyExplosion(const glm::vec3& position);

    void updateListenerPosition();
    void updateListenerOrientation();

private:
    struct Cell
    {
        std::vector<std::weak_ptr<Obstacle>> obstacles;
        glm::mat4 worldTransform{1.0f};
        float posX;
        float posY;
        char levelMarker;
    };

    Engine* mEngine;
    std::shared_ptr<PerspectiveCamera> mCamera;
    std::shared_ptr<Player> mPlayer;
    std::shared_ptr<LoseScene> mLoseScene;
    std::vector<std::weak_ptr<Enemy>> mEnemies;
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
    uint16_t mBulletMesh;
    uint16_t mExplosion1Texture;
    uint16_t mShootSound;
    uint16_t mExplosionSound;
    Enemy::Descriptor mEnemy1;
    int mWidth;
    int mHeight;

    void update(float time) override;

    void beforeDraw(Renderer* renderer) override;
    void draw(Renderer* renderer) override;
};
