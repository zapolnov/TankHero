#include "Level.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <sys/types.h>
#include <sys/stat.h>
#include <algorithm>
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

    resourceQueue.meshes.emplace(mTreeMesh = engine->renderer()->meshNameId("tree.mesh"));
}

void Level::load(const std::string& file)
{
    struct stat st;
    if (stat(file.c_str(), &st) < 0)
        return;

    std::unique_ptr<char[]> data;
    data.reset(new char[st.st_size + 1]);
    data[st.st_size] = 0;

    FILE* f = fopen(file.c_str(), "rb");
    if (!f)
        return;

    size_t bytesRead = fread(data.get(), 1, st.st_size, f);
    fclose(f);

    if (bytesRead < st.st_size)
        return;

    mWidth = 0;

    std::vector<char*> lines;
    char* p = data.get();
    char* end = data.get() + st.st_size;
    while (p < end) {
        int length;
        char* pp = strchr(p, '\n');
        if (!pp) {
            pp = end;
            length = int(end - p);
        } else {
            *pp = 0;
            length = int(pp - p);
            if (pp > data.get() && pp[-1] == '\r') {
                pp[-1] = 0;
                --length;
            }
        }

        mWidth = std::max(mWidth, length);
        lines.emplace_back(p);

        p = pp + 1;
    }

    mHeight = int(lines.size());

    for (int y = 0; y < mHeight; y++) {
        int x = 0;
        for (const char* p = lines[size_t(y)]; *p; ++p, ++x) {
            float posX = CELL_SIZE * float(x);
            float posY = CELL_SIZE * float(y);

            switch (*p) {
                case '.':
                case ' ':
                    continue;

                case '*':
                    mPlayer->setPosition2D(posX, posY);
                    appendChild(mPlayer);
                    continue;

                case 'T': {
                    static const float xOffset[] = { -1.0f, -1.0f,  1.0f, 1.0f };
                    static const float yOffset[] = { -1.0f,  1.0f, -1.0f, 1.0f };
                    float z = -mEngine->renderer()->meshBBoxMin(mTreeMesh).y;
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
