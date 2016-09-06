#include "RootNode.h"
#include "src/engine/render/Renderer.h"

RootNode::RootNode()
{
}

RootNode::~RootNode()
{
}

void RootNode::setCamera(const std::shared_ptr<Camera>& camera)
{
    if (mCamera != camera) {
        mCamera = camera;
        mSizeChanged = true;
    }
}

std::shared_ptr<TouchableNode> RootNode::recursiveTouchBegin(float x, float y)
{
    if (!mCamera)
        return Node::recursiveTouchBegin(x, y);

    auto p = glm::vec2(x, y);
    if (!mCamera->unproject2D(p))
        return nullptr;

    auto node = Node::recursiveTouchBegin(p.x, p.y);
    if (!node)
        return node;

    class Proxy : public TouchableNode
    {
    public:
        Proxy(const std::shared_ptr<TouchableNode>& node, const std::shared_ptr<Camera>& camera, const glm::vec2& p)
            : mNode(node)
            , mCamera(camera)
            , mLastPoint(p)
        {
        }

        void setSelf(const std::shared_ptr<TouchableNode>& self)
        {
            mSelf = self;
        }

        bool recursiveIsChildOf(const std::shared_ptr<TouchableNode>& node) const override
        {
            auto n = mNode.lock();
            return (n ? n->recursiveIsChildOf(node) : false);
        }

        void touchContinue(float x, float y) override
        {
            auto n = mNode.lock();
            if (n) {
                auto p = glm::vec2(x, y);
                if (mCamera->unproject2D(p)) {
                    mLastPoint = p;
                    n->touchContinue(p.x, p.y);
                }
            }
        }

        void touchEnd(float x, float y) override
        {
            auto n = mNode.lock();
            if (n) {
                auto p = glm::vec2(x, y);
                if (mCamera->unproject2D(p))
                    mLastPoint = p;
                n->touchEnd(mLastPoint.x, mLastPoint.y);
            }
            mSelf.reset();
        }

        void touchCancel(float x, float y) override
        {
            auto n = mNode.lock();
            if (n) {
                auto p = glm::vec2(x, y);
                if (mCamera->unproject2D(p))
                    mLastPoint = p;
                n->touchCancel(mLastPoint.x, mLastPoint.y);
            }
            mSelf.reset();
        }

    private:
        std::weak_ptr<TouchableNode> mNode;
        std::shared_ptr<Camera> mCamera;
        std::shared_ptr<TouchableNode> mSelf;
        glm::vec2 mLastPoint;
    };

    auto proxy = std::make_shared<Proxy>(node, mCamera, p);
    proxy->setSelf(proxy);
    node = std::move(proxy);

    return node;
}

void RootNode::resize(float width, float height)
{
    if (width != mWidth || height != mHeight) {
        mWidth = width;
        mHeight = height;
        mSizeChanged = true;
    }
}

void RootNode::beforeDraw(Renderer* renderer)
{
    if (!mCamera) {
        renderer->setProjectionMatrix(glm::mat4(1.0f));
        renderer->setViewMatrix(glm::mat4(1.0f));
    } else {
        if (mSizeChanged) {
            mCamera->setSize(mWidth, mHeight);
            mSizeChanged = false;
        }
        renderer->setProjectionMatrix(mCamera->projectionMatrix());
        renderer->setViewMatrix(mCamera->viewMatrix());
    }
}
