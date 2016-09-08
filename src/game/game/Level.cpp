#include "Level.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <glm/gtc/matrix_transform.hpp>
#include <algorithm>
#include <sys/types.h>
#include <sys/stat.h>
#include <cstdio>
#include <vector>
#include <string>

const float Level::CELL_SIZE = 5.0f;

Level::Level(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    mCamera = std::make_shared<PerspectiveCamera>();
    mCamera->setFov(glm::radians(45.0f));
    mCamera->setNearZ(1.0f);
    mCamera->setFarZ(100.0f);
    mCamera->lookAt(glm::vec3(-20.0f, 20.0f, 35.0f), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 0.0f, 1.0f));
    setCamera(mCamera);

    mPlayer = std::make_shared<Player>(mEngine, resourceQueue);

    resourceQueue.textures.emplace(engine->renderer()->textureNameId("basetexture.jpg"));

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
}

void Level::load(const std::string& file)
{
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

        int x = 0;
        for (char* p = levelLines[size_t(y)]; *p; ++p, ++x) {
            cellLine.emplace_back();
            auto& cell = cellLine.back();

            cell.posX = CELL_SIZE * float(x);
            cell.posY = CELL_SIZE * float(y);
            cell.levelMarker = *p;

            float scale = 1.0f / 8.0f * CELL_SIZE;
            auto m = glm::translate(worldMatrix(), glm::vec3(cell.posX, cell.posY, 0.0f));
            m = glm::rotate(m, glm::radians(90.0f), glm::vec3(1.0f, 0.0f, 0.0f));

            switch (*p) {
                case '.':
                case ' ':
                    break;

                case '*':
                    cell.levelMarker = ' ';
                    mPlayer->setPosition2D(cell.posX, cell.posY);
                    appendChild(mPlayer);
                    break;

                case '2': // road straight
                case '5': // road corner
                case 'c': // road tjunction
                case 'g': // road end
                case 'x': // road crossing
                case '#': // office building
                case 'C': // river corner
                case 'G': // river end
                case '~': // water
                    break;

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

                case 'A': // river corner
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'B': // river corner
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'D': // river corner
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'F': // river end
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'E': // river end
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'H': // river end
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'f': // road end
                    m = glm::rotate(m, glm::radians(-90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'e': // road end
                    m = glm::rotate(m, glm::radians(-180.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'h': // road end
                    m = glm::rotate(m, glm::radians(-270.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case '|': // water
                    m = glm::rotate(m, glm::radians(90.0f), glm::vec3(0.0f, 1.0f, 0.0f));
                    break;

                case 'T': {
                    static const float xOffset[] = { -1.0f, -1.0f,  1.0f, 1.0f };
                    static const float yOffset[] = { -1.0f,  1.0f, -1.0f, 1.0f };
                    float z = -mEngine->renderer()->meshBBoxMin(mTreeMesh).y * 0.5f
                            +  mEngine->renderer()->meshBBoxMax(mGrassMesh).y * scale;
                    for (int i = 0; i < 4; i++) {
                        auto tree = std::make_shared<Obstacle>(mEngine, mTreeMesh);
                        tree->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
                        tree->setScale(0.5f);
                        tree->setPosition(cell.posX + xOffset[i] * CELL_SIZE * 0.3f,
                                          cell.posY + yOffset[i] * CELL_SIZE * 0.3f,
                                          z);
                        appendChild(tree);
                        cell.obstacles.emplace_back(tree);
                    }
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

void Level::update(float time)
{
    RootNode::update(time);

    auto direction = mCamera->position() - mCamera->target();
    mCamera->setTarget(mPlayer->position());
    mCamera->setPosition(mPlayer->position() + direction);
}

void Level::beforeDraw(Renderer* renderer)
{
    auto lightPosition = glm::vec3(0.0f, 0.0f, -400.0f);
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
    renderer->setShadowMapBoundaries(mVisibleMin - 3.0f * glm::vec2(CELL_SIZE), mVisibleMax);

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
            switch (cell.levelMarker) {
                case ' ':
                case '.':
                case 'T':
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

                case '#':
                    renderer->drawMesh(cell.worldTransform, mOfficeBuildingMesh);
                    continue;

                default:
                    assert(false);
                    continue;
            }
        }
    }
}
