
#pragma once
#include "Node.h"
#include "src/engine/scene/camera/Camera.h"

class RootNode : public Node
{
public:
    RootNode();
    ~RootNode();

    const std::shared_ptr<Camera>& camera() const { return mCamera; }
    void setCamera(const std::shared_ptr<Camera>& camera);

    std::shared_ptr<TouchableNode> recursiveTouchBegin(float x, float y) override;

    float width() const { return mWidth; }
    float height() const { return mHeight; }

    void resize(float width, float height) override;

protected:
    void beforeDraw(Renderer* renderer) override;

private:
    std::shared_ptr<Camera> mCamera;
    float mWidth = 0.0f;
    float mHeight = 0.0f;
    bool mSizeChanged = true;
};
