
#pragma once
#include "src/engine/scene/Scene.h"
#include <cstdint>
#include <functional>
#include <unordered_set>
#include <vector>

class Engine;

struct PendingResources
{
    std::unordered_set<uint16_t> meshes;
    std::unordered_set<uint16_t> textures;
    std::unordered_set<uint16_t> sounds;
    std::vector<std::function<void()>> custom;

    size_t totalPending() const { return meshes.size() + textures.size() + sounds.size() + custom.size(); }
};

class LoadingScene : public Scene
{
public:
    explicit LoadingScene(Engine* engine);

    virtual std::shared_ptr<Scene> constructNextScene(Engine* engine, PendingResources& resources) = 0;
    virtual void advanceToScene(const std::shared_ptr<Scene>& scene);

    void setProgressBarPosition(float y);
    void setProgressBarColors(const glm::vec4& fill, const glm::vec4& border);

protected:
    Engine* mEngine;
};
