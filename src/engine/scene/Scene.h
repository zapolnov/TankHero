
#pragma once
#include "Node.h"
#include <memory>

class Scene
{
public:
    Scene();
    ~Scene();

    const std::shared_ptr<Node>& rootNode() const { return mRootNode; }
    void setRootNode(const std::shared_ptr<Node>& node);

    const std::shared_ptr<Node>& hudNode() const { return mHudNode; }
    void setHudNode(const std::shared_ptr<Node>& node);

    bool isPartOfScene(const std::shared_ptr<TouchableNode>& node) const;

    virtual bool touchBegin(float x, float y);
    virtual void touchContinue(float x, float y);
    virtual void touchEnd(float x, float y);
    virtual void touchCancel(float x, float y);

    virtual void resize(float width, float height);

    virtual void runFrame(Renderer* renderer, float frameTime);

private:
    std::shared_ptr<Node> mRootNode;
    std::shared_ptr<Node> mHudNode;
    std::weak_ptr<TouchableNode> mTouchingNode;
    float mWidth = 0.0f;
    float mHeight = 0.0f;
    bool mRootSizeChanged = true;
    bool mHudSizeChanged = true;

    Scene(const Scene&) = delete;
    Scene& operator=(const Scene&) = delete;
};
