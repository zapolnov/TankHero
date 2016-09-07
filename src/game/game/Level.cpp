#include "Level.h"
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
    mCamera->lookAt(glm::vec3(-15.0f, 15.0f, 15.0f), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 0.0f, 1.0f));
    setCamera(mCamera);

    mPlayer = std::make_shared<Player>(mEngine, resourceQueue);

    resourceQueue.textures.emplace(engine->renderer()->textureNameId("basetexture.jpg"));

    resourceQueue.meshes.emplace(mTreeMesh = engine->renderer()->meshNameId("tree.mesh"));
    resourceQueue.meshes.emplace(mGrassMesh = engine->renderer()->meshNameId("grass.mesh"));
}

void Level::load(const std::string& file)
{
    mLevelLines.clear();
    mLevelData.reset();

    struct stat st;
    if (stat(file.c_str(), &st) < 0)
        return;

    mLevelData.reset(new char[st.st_size + 1]);
    mLevelData[st.st_size] = 0;

    FILE* f = fopen(file.c_str(), "rb");
    if (!f)
        return;

    size_t bytesRead = fread(mLevelData.get(), 1, st.st_size, f);
    fclose(f);

    if (bytesRead < st.st_size)
        return;

    mWidth = 0;

    char* p = mLevelData.get();
    char* end = mLevelData.get() + st.st_size;
    while (p < end) {
        int length;
        char* pp = strchr(p, '\n');
        if (!pp) {
            pp = end;
            length = int(end - p);
        } else {
            *pp = 0;
            length = int(pp - p);
            if (pp > mLevelData.get() && pp[-1] == '\r') {
                pp[-1] = 0;
                --length;
            }
        }

        mWidth = std::max(mWidth, length);
        mLevelLines.emplace_back(p);

        p = pp + 1;
    }

    mHeight = int(mLevelLines.size());
    mWorldTransform.resize(mWidth * mHeight, glm::mat4(1.0f));

    for (int y = 0; y < mHeight; y++) {
        int x = 0;
        for (char* p = mLevelLines[size_t(y)]; *p; ++p, ++x) {
            float posX = CELL_SIZE * float(x);
            float posY = CELL_SIZE * float(y);

            float scale = 1.0f / 8.0f * CELL_SIZE;
            auto m = glm::translate(worldMatrix(), glm::vec3(posX, posY, 0.0f));
            m = glm::rotate(m, glm::radians(90.0f), glm::vec3(1.0f, 0.0f, 0.0f));
            m = glm::scale(m, glm::vec3(scale));
            mWorldTransform[y * mWidth + x] = m;

            switch (*p) {
                case '.':
                case ' ':
                    continue;

                case '*':
                    *p = ' ';
                    mPlayer->setPosition2D(posX, posY);
                    appendChild(mPlayer);
                    continue;

                case 'T': {
                    static const float xOffset[] = { -1.0f, -1.0f,  1.0f, 1.0f };
                    static const float yOffset[] = { -1.0f,  1.0f, -1.0f, 1.0f };
                    float z = -mEngine->renderer()->meshBBoxMin(mTreeMesh).y * 0.5f
                            +  mEngine->renderer()->meshBBoxMax(mGrassMesh).y * scale;
                    for (int i = 0; i < 4; i++) {
                        auto tree = std::make_shared<Obstacle>(mEngine, mTreeMesh);
                        tree->setRotation(glm::radians(90.0f), 0.0f, 0.0f);
                        tree->setScale(0.5f);
                        tree->setPosition(posX + xOffset[i] * CELL_SIZE * 0.3f, posY + yOffset[i] * CELL_SIZE * 0.3f, z);
                        appendChild(tree);
                    }
                    continue;
                }

                default:
                    assert(false);
            }
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
    auto lightPosition = glm::vec3(-400.0f, -400.0f, -400.0f);
    renderer->setLight(lightPosition, glm::vec3(1.0f), 1.0f);

    RootNode::beforeDraw(renderer);
}

void Level::draw(Renderer* renderer)
{
    auto m = worldMatrix();
    for (int y = 0; y < mHeight; y++) {
        int x = 0;
        for (const char* p = mLevelLines[size_t(y)]; *p; ++p, ++x) {
            switch (*p) {
                case ' ':
                case '.':
                case 'T':
                    renderer->drawMesh(mWorldTransform[y * mWidth + x], mGrassMesh);
                    continue;

                default:
                    assert(false);
                    continue;
            }
        }
    }
}
