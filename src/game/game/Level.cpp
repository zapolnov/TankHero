#include "Level.h"
#include "Tree.h"
#include "Explosion.h"
#include "Bullet.h"
#include "InvisibleObstacle.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <glm/gtc/matrix_transform.hpp>
#include <algorithm>
#include <sys/types.h>
#include <sys/stat.h>
#include <sstream>
#include <cstdio>
#include <vector>
#include <string>

const float Level::CELL_SIZE = 5.0f;
const int Level::TOTAL_COUNT = 3;

Level::Level(Engine* engine, PendingResources& resourceQueue, int index)
    : mEngine(engine)
    , mIndex(index)
{
    mCamera = std::make_shared<PerspectiveCamera>();
    mCamera->setFov(glm::radians(45.0f));
    mCamera->setNearZ(10.0f);
    mCamera->setFarZ(100.0f);
    mCamera->lookAt(glm::vec3(-15.0f, 15.0f, 17.0f), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 0.0f, 1.0f));
    setCamera(mCamera);

    mPlayer = std::make_shared<Player>(mEngine, this, resourceQueue);
    mLoseScene = std::make_shared<LoseScene>(mEngine, resourceQueue, index);
    mWinScene = std::make_shared<WinScene>(mEngine, resourceQueue, index);

    resourceQueue.textures.emplace(engine->renderer()->textureNameId("basetexture.jpg"));
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("texture_panzerwagen.jpg"));
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("crate_medkit.jpg"));
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("wall-diffuse.jpg"));
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("wall-normal.png"));
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("cube-diffuse.jpg"));
    resourceQueue.textures.emplace(engine->renderer()->textureNameId("cube-normal.png"));
    resourceQueue.textures.emplace(mExplosion1Texture = engine->renderer()->textureNameId("explosion1.png"));

    resourceQueue.meshes.emplace(mTreeMesh = engine->renderer()->meshNameId("tree.mesh"));
    resourceQueue.meshes.emplace(mGrassMesh = engine->renderer()->meshNameId("grass.mesh"));
    resourceQueue.meshes.emplace(mRoadStraightMesh = engine->renderer()->meshNameId("road-straight-low.mesh"));
    resourceQueue.meshes.emplace(mRoadCornerMesh = engine->renderer()->meshNameId("road-corner-low.mesh"));
    resourceQueue.meshes.emplace(mRoadTJunctionMesh = engine->renderer()->meshNameId("road-tjunction-low.mesh"));
    resourceQueue.meshes.emplace(mRoadCrossingMesh = engine->renderer()->meshNameId("road-crossing-low.mesh"));
    resourceQueue.meshes.emplace(mRoadEndMesh = engine->renderer()->meshNameId("road-end-low.mesh"));
    resourceQueue.meshes.emplace(mOfficeBuildingMesh = engine->renderer()->meshNameId("building-office-small.mesh"));
    resourceQueue.meshes.emplace(mRiverCornerMesh = engine->renderer()->meshNameId("river-corner-low.mesh"));
    resourceQueue.meshes.emplace(mRiverEndMesh = engine->renderer()->meshNameId("river-end-low.mesh"));
    resourceQueue.meshes.emplace(mRiverStraightMesh = engine->renderer()->meshNameId("river-straight-low.mesh"));
    resourceQueue.meshes.emplace(mWaterMesh = engine->renderer()->meshNameId("water.mesh"));
    resourceQueue.meshes.emplace(mBulletMesh = engine->renderer()->meshNameId("tank_bullet.mesh"));
    resourceQueue.meshes.emplace(mMedKitMesh = engine->renderer()->meshNameId("crate_medkit.mesh"));
    resourceQueue.meshes.emplace(mWallMesh = engine->renderer()->meshNameId("wall.mesh"));
    resourceQueue.meshes.emplace(mWallCornerMesh = engine->renderer()->meshNameId("wall-corner.mesh"));

    resourceQueue.sounds.emplace(mShootSound = engine->soundManager()->soundNameId("8bit_gunloop_explosion.ogg"));
    resourceQueue.sounds.emplace(mExplosionSound = engine->soundManager()->soundNameId("explosion.ogg"));

    mEnemy1.visualPosition = glm::vec3(0.0f, 0.0f, 0.6f);
    mEnemy1.initialLives = 1;
    resourceQueue.meshes.emplace(mEnemy1.mesh = engine->renderer()->meshNameId("enemy1.mesh"));
}

void Level::load()
{
    std::stringstream ss;
    ss << "level" << mIndex << ".dat";
    auto file = ss.str();

    struct stat st;
    if (stat(file.c_str(), &st) < 0)
        return;

    std::unique_ptr<char[]> levelData(new char[st.st_size + 1]);
    levelData[st.st_size] = 0;

    FILE* f = fopen(file.c_str(), "rb");
    if (!f)
        return;

    size_t bytesRead = fread(levelData.get(), 1, st.st_size, f);
    fclose(f);

    if (bytesRead < st.st_size)
        return;

    mWidth = 0;
    std::vector<char*> levelLines;

    char* p = levelData.get();
    char* end = levelData.get() + st.st_size;
    while (p < end) {
        int length;
        char* pp = strchr(p, '\n');
        if (!pp) {
            pp = end;
            length = int(end - p);
        } else {
            *pp = 0;
            length = int(pp - p);
            if (pp > levelData.get() && pp[-1] == '\r') {
                pp[-1] = 0;
                --length;
            }
        }

        mWidth = std::max(mWidth, length);
        levelLines.emplace_back(p);

        p = pp + 1;
    }

    mHeight = int(levelLines.size());
    mCells.reserve(levelLines.size());

    for (int y = 0; y < mHeight; y++) {
        mCells.emplace_back();
        auto& cellLine = mCells.back();
        cellLine.reserve(size_t(mWidth));

        int x = 0;
        for (char* p = levelLines[size_t(y)]; x < mWidth; (*p ? (void)++p : (void)0), ++x) {
            cellLine.emplace_back();
            auto& cell = cellLine.back();

            cell.posX = CELL_SIZE * float(x);
            cell.posY = CELL_SIZE * float(y);
            cell.levelMarker = *p;

            float scale = 1.0f / 8.0f * CELL_SIZE;
            auto m = glm::translate(worldMatrix(), glm::vec3(cell.posX, cell.posY, 0.0f));
            m = glm::rotate(m, glm::radians(90.0f), glm::vec3(1.0f, 0.0f, 0.0f));

            switch (*p) {
                case 0:
                    cell.levelMarker = ' ';
                    break;

                case '.':
                case ' ':
                    break;

                case '*':
                    cell.levelMarker = ' ';
                    mPlayer->setPosition2D(cell.posX, cell.posY);
                    appendChild(mPlayer);
                    updateListenerPosition();
                    updateListenerOrientation();
                    break;

                case '+': {
                    cell.levelMarker = ' ';
                    auto medkit = std::make_shared<MedKit>(mEngine, mMedKitMesh);
                    medkit->setPosition(cell.posX, cell.posY, 1.2f);
                    cell.medkits.emplace_back(medkit);
                    appendChild(medkit);
                    break;
                }

                case '!': {
                    cell.levelMarker = ' ';
                    auto enemy = std::make_shared<Enemy>(mEngine, this, mEnemy1);
                    enemy->setPosition2D(cell.posX, cell.posY);
                    appendChild(enemy);
                    mEnemies.emplace_back(enemy);
                    ++mEnemyCount;
                    break;
                }

                case '[': { // wall
                    cell.levelMarker = ' ';
                    auto wall = std::make_shared<Obstacle>(mEngine, mWallMesh);
                    wall->setPosition(cell.posX - CELL_SIZE * 0.1f, cell.posY, 1.0f);
                    wall->setRotation(glm::radians(90.0f), glm::radians(90.0f), 0.0f);
                    wall->setScale(0.05f, 0.02f, 0.05f);
                    cell.walls.emplace_back(wall);
                    cell.obstacles.emplace_back(wall);
                    break;
                }

                case ']': { // wall
                    cell.levelMarker = ' ';
                    auto wall = std::make_shared<Obstacle>(mEngine, mWallMesh);
                    wall->setPosition(cell.posX + CELL_SIZE * 0.1f, cell.posY, 1.0f);
                    wall->setRotation(glm::radians(90.0f), glm::radians(90.0f), 0.0f);
                    wall->setScale(0.05f, 0.02f, 0.05f);
                    cell.walls.emplace_back(wall);
                    cell.obstacles.emplace_back(wall);
                    break;
                }

                case '^': { // wall
                    cell.levelMarker = ' ';
                    auto wall = std::make_shared<Obstacle>(mEngine, mWallMesh);
                    wall->setPosition(cell.posX, cell.posY - CELL_SIZE * 0.1f, 1.0f);
                    wall->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
                    wall->setScale(0.05f, 0.02f, 0.05f);
                    cell.walls.emplace_back(wall);
                    cell.obstacles.emplace_back(wall);
                    break;
                }

                case 'v': { // wall
                    cell.levelMarker = ' ';
                    auto wall = std::make_shared<Obstacle>(mEngine, mWallMesh);
                    wall->setPosition(cell.posX, cell.posY + CELL_SIZE * 0.1f, 1.0f);
                    wall->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
                    wall->setScale(0.05f, 0.02f, 0.05f);
                    cell.walls.emplace_back(wall);
                    cell.obstacles.emplace_back(wall);
                    break;
                }

                case '@': { // wall
                    cell.levelMarker = ' ';
                    auto wall = std::make_shared<Obstacle>(mEngine, mWallCornerMesh);
                    wall->setPosition(cell.posX, cell.posY, 1.0f);
                    wall->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
                    wall->setScale(0.08f, 0.08f, 0.08f);
                    cell.walls.emplace_back(wall);
                    cell.obstacles.emplace_back(wall);
                    break;
                }

                case '2': // road straight
                case '5': // road corner
                case 'c': // road tjunction
                case 'g': // road end
                case 'x': // road crossing
                    break;

                case 'C': { // river corner
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.4f, -CELL_SIZE * 0.5f * 0.2f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f       , -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2(-CELL_SIZE * 0.5f * 0.2f,  CELL_SIZE * 0.5f * 0.4f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.2f, -CELL_SIZE * 0.5f * 0.2f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.2f,  CELL_SIZE * 0.5f * 0.2f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'G': { // river end
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f,        -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.3f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case '~': { // water
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(CELL_SIZE, CELL_SIZE * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case '3': // road corner
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case '4': // road straight
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case '1': // road corner
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case '6': // road corner
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'b': // road tjunction
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'a': // road tjunction
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'd': // road tjunction
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'A': { // river corner
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f       ));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.4f,  CELL_SIZE * 0.5f * 0.2f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f       ,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2( CELL_SIZE * 0.5f * 0.2f, -CELL_SIZE * 0.5f * 0.4f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.2f, -CELL_SIZE * 0.5f * 0.2f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.2f,  CELL_SIZE * 0.5f * 0.2f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'B': { // river corner
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.2f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.4f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f       , -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.4f),
                        glm::vec2(-CELL_SIZE * 0.5f * 0.2f,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.2f, -CELL_SIZE * 0.5f * 0.2f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.2f,  CELL_SIZE * 0.5f * 0.2f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'D': { // river corner
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.4f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.2f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f       ,  CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2( CELL_SIZE * 0.5f * 0.2f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.4f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.2f, -CELL_SIZE * 0.5f * 0.2f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.2f,  CELL_SIZE * 0.5f * 0.2f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'F': { // river end
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f * 0.3f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'E': { // river end
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.3f, -CELL_SIZE * 0.5f * 0.6f),
                        glm::vec2( CELL_SIZE * 0.5f,         CELL_SIZE * 0.5f * 0.6f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'H': { // river end
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(-CELL_SIZE * 0.5f * 0.6f, -CELL_SIZE * 0.5f),
                        glm::vec2( CELL_SIZE * 0.5f * 0.6f,  CELL_SIZE * 0.5f * 0.3f));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'f': // road end
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'e': // road end
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'h': // road end
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case '|': { // water
                    m = glm::rotate(m, glm::radians(90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    auto obstacle = std::make_shared<InvisibleObstacle>(mEngine,
                        glm::vec2(CELL_SIZE * 0.6f, CELL_SIZE));
                    obstacle->setPosition2D(cell.posX, cell.posY);
                    cell.invisibleObstacles.emplace_back(obstacle);
                    break;
                }

                case 'T': {
                    static const float xOffset[] = { -1.0f, -1.0f,  1.0f, 1.0f };
                    static const float yOffset[] = { -1.0f,  1.0f, -1.0f, 1.0f };
                    float z = -mEngine->renderer()->meshBBoxMin(mTreeMesh).y * 0.3f
                            +  mEngine->renderer()->meshBBoxMax(mGrassMesh).y * scale
                            -  1.0f;
                    for (int i = 0; i < 4; i++) {
                        auto tree = std::make_shared<Tree>(mEngine, mTreeMesh);
                        tree->setPosition(cell.posX + xOffset[i] * CELL_SIZE * 0.25f,
                                          cell.posY + yOffset[i] * CELL_SIZE * 0.25f,
                                          z);
                        appendChild(tree);
                        cell.obstacles.emplace_back(tree);
                    }
                    break;
                }

                case '#': { // office building
                    auto building = std::make_shared<Obstacle>(mEngine, mOfficeBuildingMesh);
                    building->setPosition(cell.posX, cell.posY, 0.0f);
                    building->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
                    building->setScale(scale);
                    appendChild(building);
                    cell.obstacles.emplace_back(building);
                    break;
                }

                default:
                    assert(false);
            }
            m = glm::scale(m, glm::vec3(scale));
            cell.worldTransform = m;
        }
    }
}

glm::ivec2 Level::cellForPoint(const glm::vec2& point) const
{
    return glm::ivec2(
            int(floorf((point.x + CELL_SIZE * 0.5f) / CELL_SIZE)),
            int(floorf((point.y + CELL_SIZE * 0.5f) / CELL_SIZE))
        );
}

std::pair<glm::ivec2, glm::ivec2> Level::cellsForBoundingBox(const OBB2D& box) const
{
    auto min = cellForPoint(box.p[0]);
    auto max = min;
    for (int i = 1; i < 4; i++) {
        auto p = cellForPoint(box.p[i]);
        min = glm::min(min, p);
        max = glm::max(max, p);
    }
    return std::make_pair(min, max);
}

std::pair<glm::ivec2, glm::ivec2> Level::cellsForBoundingCircle(const glm::vec2& center, float radius) const
{
    auto min = cellForPoint(center - radius);
    auto max = cellForPoint(center + radius);
    return std::make_pair(min, max);
}

std::shared_ptr<Collidable> Level::collideOnMove(Collidable& collidable, const glm::vec2& dir,
    float& length, const Collidable* ignore, bool isBullet)
{
    const auto& sourceBox = collidable.boundingBox();

    auto vec = dir * length;
    auto targetBox = sourceBox;
    targetBox.p[0] += vec;
    targetBox.p[1] += vec;
    targetBox.p[2] += vec;
    targetBox.p[3] += vec;

    float depth = 0.0f;
    auto obstacle = collideOnMove(collidable, sourceBox, targetBox, &depth, ignore, isBullet);
    if (obstacle)
        length = std::max(length - depth - 0.1f, 0.0f);

    return obstacle;
}

std::shared_ptr<Collidable> Level::collideCircleOnMove(Collidable& collidable, const glm::vec2& dir, float& length,
    const Collidable* ignore)
{
    auto circleRadius = collidable.boundingSphereRadius();
    auto sourceCircleCenter = collidable.boundingSphereWorldCenter();
    auto targetCircleCenter = sourceCircleCenter + dir * length;

    //auto range1 = cellsForBoundingCircle(sourceCircleCenter, circleRadius);
    auto range2 = cellsForBoundingCircle(targetCircleCenter, circleRadius);

    auto min = range2.first;//glm::min(range1.first, range2.first);
    auto max = range2.second; //glm::max(range1.second, range2.second);

    min.x = std::max(min.x, 0);
    min.y = std::max(min.y, 0);
    max.x = std::min(max.x, mWidth - 1);
    max.y = std::min(max.y, mHeight - 1);

    for (int y = min.y; y <= max.y; y++) {
        for (int x = min.x; x <= max.x; x++) {
            for (const auto& obstacleRef : mCells[y][x].obstacles) {
                auto obstacle = obstacleRef.lock();
                if (obstacle && obstacle->boundingBox().intersectsWithCircle(targetCircleCenter, circleRadius))
                    return obstacle;
            }
            for (const auto& medkitRef : mCells[y][x].medkits) {
                auto medkit = medkitRef.lock();
                if (medkit) {
                    glm::vec2 c1 = medkit->boundingSphereWorldCenter();
                    float r1 = medkit->boundingSphereRadius();
                    float x = (c1.x - targetCircleCenter.x) * (c1.x - targetCircleCenter.x) +
                              (c1.y - targetCircleCenter.y) * (c1.y - targetCircleCenter.y);
                    if (x <= (r1 + circleRadius) * (r1 + circleRadius))
                        return medkit;
                }
            }
            for (const auto& obstacle : mCells[y][x].invisibleObstacles) {
                if (obstacle && obstacle->boundingBox().intersectsWithCircle(targetCircleCenter, circleRadius))
                    return obstacle;
            }
        }
    }

    if (mPlayer.get() != ignore && mPlayer->boundingBox().intersectsWithCircle(targetCircleCenter, circleRadius))
        return mPlayer;

    for (auto it = mEnemies.begin(); it != mEnemies.end(); ) {
        auto enemy = it->lock();
        if (!enemy)
            it = mEnemies.erase(it);
        else {
            ++it;
            //if (enemy.get() != ignore && enemy->boundingBox().intersectsWithCircle(targetCircleCenter, circleRadius))
            if (enemy.get() != ignore) {
                glm::vec2 c1 = enemy->boundingSphereWorldCenter();
                float r1 = enemy->boundingSphereRadius();
                float x = (c1.x - targetCircleCenter.x) * (c1.x - targetCircleCenter.x) +
                          (c1.y - targetCircleCenter.y) * (c1.y - targetCircleCenter.y);
                if (x <= (r1 + circleRadius) * (r1 + circleRadius))
                    return enemy;
            }
        }
    }

    return nullptr;
}

std::shared_ptr<Collidable> Level::collideOnMove(Collidable& collidable, const OBB2D& sourceBox, const OBB2D& targetBox,
    float* penetrationDepth, const Collidable* ignore, bool isBullet)
{
    //auto range1 = cellsForBoundingBox(sourceBox);
    auto range2 = cellsForBoundingBox(targetBox);

    auto min = range2.first;//glm::min(range1.first, range2.first);
    auto max = range2.second;//glm::max(range1.second, range2.second);

    min.x = std::max(min.x, 0);
    min.y = std::max(min.y, 0);
    max.x = std::min(max.x, mWidth - 1);
    max.y = std::min(max.y, mHeight - 1);

    for (int y = min.y; y <= max.y; y++) {
        for (int x = min.x; x <= max.x; x++) {
            for (const auto& obstacleRef : mCells[y][x].obstacles) {
                auto obstacle = obstacleRef.lock();
                if (obstacle && obstacle->boundingBox().intersectsWith(targetBox, penetrationDepth))
                    return obstacle;
            }

            for (const auto& medkitRef : mCells[y][x].medkits) {
                auto medkit = medkitRef.lock();
                if (medkit && medkit->boundingBox().intersectsWith(targetBox, penetrationDepth)) {
                    if (!collidable.isPlayer())
                        return medkit;
                    auto& player = static_cast<Player&>(collidable);
                    if (player.isDead())
                        return medkit;
                    player.collectMedKit();
                    medkit->removeFromParent();
                }
            }

            if (!isBullet) {
                for (const auto& obstacle : mCells[y][x].invisibleObstacles) {
                    if (obstacle && obstacle->boundingBox().intersectsWith(targetBox, penetrationDepth))
                        return obstacle;
                }
            }
        }
    }

    if (mPlayer.get() != ignore && mPlayer->boundingBox().intersectsWith(targetBox, penetrationDepth))
        return mPlayer;

    for (auto it = mEnemies.begin(); it != mEnemies.end(); ) {
        auto enemy = it->lock();
        if (!enemy)
            it = mEnemies.erase(it);
        else {
            ++it;
            if (enemy.get() != ignore && enemy->boundingBox().intersectsWith(targetBox, penetrationDepth))
                return enemy;
        }
    }

    return nullptr;
}

void Level::showWinScreen()
{
    mEngine->renderer()->setClearColor(LoseScene::BACKGROUND_COLOR);
    mEngine->setScene(mWinScene);
}

void Level::showLoseScreen()
{
    mEngine->renderer()->setClearColor(LoseScene::BACKGROUND_COLOR);
    mEngine->setScene(mLoseScene);
}

void Level::spawnBullet(const std::shared_ptr<Collidable>& emitter, const glm::vec3& position, const glm::vec2& dir)
{
    auto bullet = std::make_shared<Bullet>(mEngine, this, emitter, mBulletMesh, dir);
    bullet->setPosition(position);
    appendChild(bullet);
    mEngine->soundManager()->play(position, mShootSound);
}

void Level::spawnBulletExplosion(const glm::vec3& position)
{
    auto e = std::make_shared<Explosion>(mCamera.get(), mExplosion1Texture, 2.0f, 32);
    e->setPosition(position);
    appendChild(e);
    mEngine->soundManager()->play(position, mExplosionSound);
}

void Level::spawnEnemyExplosion(const glm::vec3& position)
{
    auto e = std::make_shared<Explosion>(mCamera.get(), mExplosion1Texture, 8.0f, 32, false);
    e->setPosition(position);
    appendChild(e);
    mEngine->soundManager()->play(position, mExplosionSound);
}

void Level::updateListenerPosition()
{
    mEngine->soundManager()->setListenerPosition(mPlayer->position());
}

void Level::updateListenerOrientation()
{
    mEngine->soundManager()->setListenerOrientation(glm::vec3(mPlayer->direction(), 0.0f), glm::vec3(0.0f, 0.0f, 1.0f));
}

void Level::update(float time)
{
    RootNode::update(time);

    auto pos = mPlayer->position();
    float angle = mPlayer->rotation2D();

    auto length = glm::length(glm::vec2(mCamera->position()) - glm::vec2(mCamera->target()));
    mCamera->setTarget(pos);
    mCamera->setPosition(glm::vec3(pos.x + length * sinf(-angle), pos.y + length * cosf(-angle), mCamera->position().z));

    bool haveEnemies = false;
    for (auto it = mEnemies.begin(); it != mEnemies.end(); ) {
        auto enemy = it->lock();
        if (!enemy)
            it = mEnemies.erase(it);
        else {
            haveEnemies = true;
            break;
        }
    }

    if (!haveEnemies)
        showWinScreen();
}

void Level::beforeDraw(Renderer* renderer)
{
    auto lightPosition = glm::vec3(0.1f, 0.1f, -400.0f);
    renderer->setLight(lightPosition, glm::vec3(1.0f), 1.0f);

    glm::vec2 p[4] = {
        { -1.0f, -1.0f },
        {  1.0f, -1.0f },
        {  1.0f,  1.0f },
        { -1.0f,  1.0f },
    };

    mCamera->unproject2D(p[0]);
    mCamera->unproject2D(p[1]);
    mCamera->unproject2D(p[2]);
    mCamera->unproject2D(p[3]);

    mVisibleMin = glm::min(glm::min(p[0], p[1]), glm::min(p[2], p[3]));
    mVisibleMax = glm::max(glm::max(p[0], p[1]), glm::max(p[2], p[3]));
    renderer->setShadowMapBoundaries(mVisibleMin - 3.0f * glm::vec2(CELL_SIZE), mVisibleMax + glm::vec2(CELL_SIZE));

    RootNode::beforeDraw(renderer);
}

void Level::draw(Renderer* renderer)
{
    int startX = std::max(int(floorf(mVisibleMin.x / CELL_SIZE)), 0);
    int startY = std::max(int(floorf(mVisibleMin.y / CELL_SIZE)), 0);
    int endX = std::min(int(ceilf(mVisibleMax.x / CELL_SIZE)), mWidth - 1);
    int endY = std::min(int(ceilf(mVisibleMax.y / CELL_SIZE)), mHeight - 1);

    for (int y = startY; y <= endY; y++) {
        for (int x = startX; x <= endX; x++) {
            const Cell& cell = mCells[size_t(y)][size_t(x)];

            for (const auto& wall : cell.walls)
                wall->recursiveDraw(renderer);

            switch (cell.levelMarker) {
                case ' ':
                case '.':
                case 'T':
                case '#':
                    renderer->drawMesh(cell.worldTransform, mGrassMesh);
                    continue;

                case '1':
                case '3':
                case '5':
                case '6':
                    renderer->drawMesh(cell.worldTransform, mRoadCornerMesh);
                    continue;

                case '2':
                case '4':
                    renderer->drawMesh(cell.worldTransform, mRoadStraightMesh);
                    continue;

                case 'a':
                case 'b':
                case 'c':
                case 'd':
                    renderer->drawMesh(cell.worldTransform, mRoadTJunctionMesh);
                    continue;

                case 'e':
                case 'f':
                case 'g':
                case 'h':
                    renderer->drawMesh(cell.worldTransform, mRoadEndMesh);
                    continue;

                case 'A':
                case 'B':
                case 'C':
                case 'D':
                    renderer->drawMesh(cell.worldTransform, mRiverCornerMesh);
                    continue;

                case 'E':
                case 'F':
                case 'G':
                case 'H':
                    renderer->drawMesh(cell.worldTransform, mRiverEndMesh);
                    continue;

                case 'x':
                    renderer->drawMesh(cell.worldTransform, mRoadCrossingMesh);
                    continue;

                case '~':
                case '|':
                    renderer->drawMesh(cell.worldTransform, mWaterMesh);
                    continue;

                default:
                    assert(false);
                    continue;
            }
        }
    }
}
