#include "Scene.h"
#include "src/engine/render/Renderer.h"
#include <glm/gtc/matrix_transform.hpp>
#include <cassert>

Scene::Scene()
{
}

Scene::~Scene()
{
}

void Scene::setRootNode(const std::shared_ptr<Node>& node)
{
    if (mRootNode != node) {
        mRootNode = node;
        mRootSizeChanged = true;
    }
}

void Scene::setHudNode(const std::shared_ptr<Node>& hud)
{
    if (mHudNode != hud) {
        mHudNode = hud;
        mHudSizeChanged = true;
    }
}

bool Scene::isPartOfScene(const std::shared_ptr<TouchableNode>& node) const
{
    if (!node)
        return false;

    return (mRootNode && node->recursiveIsChildOf(mRootNode))
        || (mHudNode  && node->recursiveIsChildOf(mHudNode));
}

bool Scene::touchBegin(float x, float y)
{
    auto touchingNode = mTouchingNode.lock();
    if (touchingNode)
        touchingNode->touchCancel(x, y);
    mTouchingNode = std::shared_ptr<TouchableNode>();

    if (mHudNode) {
        touchingNode = mHudNode->recursiveTouchBegin(x, y);
        if (touchingNode) {
            mTouchingNode = std::move(touchingNode);
            return true;
        }
    }

    if (mRootNode) {
        touchingNode = mRootNode->recursiveTouchBegin(x, y);
        if (touchingNode) {
            mTouchingNode = std::move(touchingNode);
            return true;
        }
    }

    return false;
}

void Scene::touchContinue(float x, float y)
{
    auto touchingNode = mTouchingNode.lock();
    if (touchingNode) {
        if (isPartOfScene(touchingNode))
            touchingNode->touchContinue(x, y);
        else {
            touchingNode->touchCancel(x, y);
            mTouchingNode = std::shared_ptr<TouchableNode>();
        }
    }
}

void Scene::touchEnd(float x, float y)
{
    auto touchingNode = mTouchingNode.lock();
    if (touchingNode) {
        if (isPartOfScene(touchingNode))
            touchingNode->touchEnd(x, y);
        else
            touchingNode->touchCancel(x, y);
    }

    mTouchingNode = std::shared_ptr<TouchableNode>();
}

void Scene::touchCancel(float x, float y)
{
    auto touchingNode = mTouchingNode.lock();
    if (touchingNode)
        touchingNode->touchCancel(x, y);

    mTouchingNode = std::shared_ptr<TouchableNode>();
}

void Scene::resize(float width, float height)
{
    if (mWidth != width || mHeight != height) {
        mWidth = width;
        mHeight = height;
        mRootSizeChanged = true;
        mHudSizeChanged = true;
    }
}

void Scene::runFrame(Renderer* renderer, float frameTime)
{
    auto rootNode = mRootNode;
    if (rootNode) {
        if (mRootSizeChanged) {
            rootNode->resize(mWidth, mHeight);
            mRootSizeChanged = false;
        }

        rootNode->recursiveUpdate(frameTime);
        rootNode->recursiveDraw(renderer);
    }

    auto hudNode = mHudNode;
    if (hudNode) {
        renderer->flushFrame();

        if (mHudSizeChanged) {
            hudNode->resize(mWidth, mHeight);
            mHudSizeChanged = false;
        }

        hudNode->recursiveUpdate(frameTime);
        hudNode->recursiveDraw(renderer);
    }
}
