
#pragma once
#include "src/engine/scene/Scene.h"
#include <functional>
#include <unordered_set>

class Engine;

struct PendingResources
{
    std::unordered_set<uint16_t> meshes;
    std::unordered_set<uint16_t> textures;
    std::vector<std::function<void()>> custom;

    size_t totalPending() const { return meshes.size() + textures.size() + custom.size(); }
};

class LoadingScene : public Scene
{
public:
    explicit LoadingScene(Engine* engine);

    virtual std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) = 0;
};
