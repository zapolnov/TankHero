
#pragma once
#include "src/engine/scene/Scene.h"
#include "src/engine/render/Renderer.h"
#include <vector>
#include <memory>

class Engine
{
public:
    Engine();
    ~Engine();

    Renderer* renderer() const { return mRenderer.get(); }

    const std::shared_ptr<Scene>& currentScene() const;
    void setScene(const std::shared_ptr<Scene>& scene);
    void pushScene(const std::shared_ptr<Scene>& scene);
    void popScene();

    void touchBegin(float x, float y);
    void touchContinue(float x, float y);
    void touchEnd(float x, float y);
    void touchCancel(float x, float y);

    void runFrame(int width, int height, float time);

private:
    std::unique_ptr<Renderer> mRenderer;
    std::vector<std::shared_ptr<Scene>> mScenes;
    int mScreenWidth = 0;
    int mScreenHeight = 0;
    float mLastTouchX = 0.0f;
    float mLastTouchY = 0.0f;
    bool mSceneChanged = false;
    bool mTouchActive = false;

    Engine(const Engine&) = delete;
    Engine& operator=(const Engine&) = delete;
};
