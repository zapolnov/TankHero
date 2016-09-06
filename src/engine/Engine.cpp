#include "Engine.h"

static const std::shared_ptr<Scene> nullScene;

Engine::Engine()
{
    mRenderer.reset(new Renderer(this));
}

Engine::~Engine()
{
    mRenderer.reset();
}

const std::shared_ptr<Scene>& Engine::currentScene() const
{
    if (!mScenes.empty())
        return mScenes.back();
    return nullScene;
}

void Engine::setScene(const std::shared_ptr<Scene>& scene)
{
    if (mTouchActive)
        touchCancel(mLastTouchX, mLastTouchY);

    mScenes.clear();
    mScenes.emplace_back(scene);
    mSceneChanged = true;
}

void Engine::pushScene(const std::shared_ptr<Scene>& scene)
{
    if (mTouchActive)
        touchCancel(mLastTouchX, mLastTouchY);

    mScenes.emplace_back(scene);
    mSceneChanged = true;
}

void Engine::popScene()
{
    if (mTouchActive)
        touchCancel(mLastTouchX, mLastTouchY);

    assert(!mScenes.empty());
    mScenes.pop_back();
    mSceneChanged = true;
}

void Engine::touchBegin(float x, float y)
{
    x =        (x / float(mScreenWidth)  * 2.0f) - 1.0f;
    y = 2.0f - (y / float(mScreenHeight) * 2.0f) - 1.0f;

    mLastTouchX = x;
    mLastTouchY = y;

    if (mTouchActive)
        touchCancel(x, y);

    auto scene = currentScene();
    if (scene) {
        if (scene->touchBegin(x, y))
            mTouchActive = true;
    }
}

void Engine::touchContinue(float x, float y)
{
    x =        (x / float(mScreenWidth)  * 2.0f) - 1.0f;
    y = 2.0f - (y / float(mScreenHeight) * 2.0f) - 1.0f;

    mLastTouchX = x;
    mLastTouchY = y;

    if (mTouchActive) {
        auto scene = currentScene();
        assert(scene != nullptr);
        scene->touchContinue(x, y);
    }
}

void Engine::touchEnd(float x, float y)
{
    x =        (x / float(mScreenWidth)  * 2.0f) - 1.0f;
    y = 2.0f - (y / float(mScreenHeight) * 2.0f) - 1.0f;

    mLastTouchX = x;
    mLastTouchY = y;

    if (mTouchActive) {
        mTouchActive = false;
        auto scene = currentScene();
        if (scene)
            scene->touchEnd(x, y);
    }
}

void Engine::touchCancel(float x, float y)
{
    x =        (x / float(mScreenWidth)  * 2.0f) - 1.0f;
    y = 2.0f - (y / float(mScreenHeight) * 2.0f) - 1.0f;

    mLastTouchX = x;
    mLastTouchY = y;

    if (mTouchActive) {
        mTouchActive = false;
        auto scene = currentScene();
        if (scene)
            scene->touchCancel(x, y);
    }
}

void Engine::runFrame(int width, int height, float time)
{
    auto scene = currentScene();

    if (width != mScreenWidth || height != mScreenHeight || mSceneChanged) {
        if (mTouchActive)
            touchCancel(mLastTouchX, mLastTouchY);

        mSceneChanged = false;
        mScreenWidth = width;
        mScreenHeight = height;

        if (scene)
            scene->resize(float(width), float(height));
    }

    mRenderer->beginFrame(width, height);
    if (scene)
        scene->runFrame(time);
    mRenderer->endFrame();
}
