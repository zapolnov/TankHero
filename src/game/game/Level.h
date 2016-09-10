
#pragma once
#include "Player.h"
#include "Obstacle.h"
#include "InvisibleObstacle.h"
#include "Enemy.h"
#include "MedKit.h"
#include "LoseScene.h"
#include "WinScene.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/scene/camera/PerspectiveCamera.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>
#include <utility>
#include <string>
#include <memory>
#include <random>

class Level : public RootNode
{
public:
    static const float CELL_SIZE;
    static const int TOTAL_COUNT;

    Level(Engine* engine, PendingResources& resourceQueue, int index);

    int index() const { return mIndex; }

    int width() const { return mWidth; }
    int height() const { return mHeight; }

    void load();

    int playerLives() const { return mPlayer->lives(); }
    const glm::vec2& playerPosition() const { return mPlayer->position2D(); }

    glm::ivec2 cellForPoint(const glm::vec2& point) const;
    std::pair<glm::ivec2, glm::ivec2> cellsForBoundingBox(const OBB2D& box) const;
    std::pair<glm::ivec2, glm::ivec2> cellsForBoundingCircle(const glm::vec2& center, float radius) const;

    std::shared_ptr<Collidable> collideOnMove(Collidable& collidable, const glm::vec2& dir, float& length,
        const Collidable* ignore = nullptr, bool isBullet = false);
    std::shared_ptr<Collidable> collideCircleOnMove(Collidable& collidable, const glm::vec2& dir, float& length,
        const Collidable* ignore = nullptr);
    std::shared_ptr<Collidable> collideOnMove(Collidable& collidable, const OBB2D& sourceBox, const OBB2D& targetBox,
        float* penetrationDepth = nullptr, const Collidable* ignore = nullptr, bool isBullet = false);

    void showWinScreen();
    void showLoseScreen();

    void spawnBullet(const std::shared_ptr<Collidable>& emitter, const glm::vec3& position, const glm::vec2& dir);
    void spawnBulletExplosion(const glm::vec3& position);
    void spawnEnemyExplosion(const glm::vec3& position);

    void updateListenerPosition();
    void updateListenerOrientation();

    int enemyCount() const { return mEnemyCount; }
    void decreaseEnemyCount() { --mEnemyCount; }

    std::default_random_engine& randomGenerator() { return mRandomGenerator; }

private:
    struct Cell
    {
        std::vector<std::weak_ptr<Obstacle>> obstacles;
        std::vector<std::shared_ptr<InvisibleObstacle>> invisibleObstacles;
        std::vector<std::shared_ptr<Obstacle>> walls;
        std::vector<std::weak_ptr<MedKit>> medkits;
        glm::mat4 worldTransform{1.0f};
        float posX;
        float posY;
        char levelMarker;
    };

    Engine* mEngine;
    int mIndex;
    std::default_random_engine mRandomGenerator;
    std::shared_ptr<PerspectiveCamera> mCamera;
    std::shared_ptr<Player> mPlayer;
    std::shared_ptr<LoseScene> mLoseScene;
    std::shared_ptr<WinScene> mWinScene;
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
    uint16_t mMedKitMesh;
    uint16_t mWallMesh;
    uint16_t mWallCornerMesh;
    Enemy::Descriptor mEnemy1;
    int mEnemyCount = 0;
    int mWidth;
    int mHeight;

    void update(float time) override;

    void beforeDraw(Renderer* renderer) override;
    void draw(Renderer* renderer) override;
};
