
#pragma once
#include "src/engine/scene/Scene.h"
#include <unordered_set>

class Engine;

struct PendingResources
{
    std::unordered_set<uint16_t> meshes;
    std::unordered_set<uint16_t> textures;
};

class LoadingScene : public Scene
{
public:
    explicit LoadingScene(Engine* engine);

    virtual std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) = 0;
};
