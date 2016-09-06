
#pragma once
#include <glm/glm.hpp>
#include <list>
#include <memory>

class TouchableNode
{
public:
    virtual bool recursiveIsChildOf(const std::shared_ptr<TouchableNode>& node) const = 0;
    virtual void touchContinue(float x, float y) = 0;
    virtual void touchEnd(float x, float y) = 0;
    virtual void touchCancel(float x, float y) = 0;
};

class Node : public TouchableNode, public std::enable_shared_from_this<Node>
{
public:
    Node();
    virtual ~Node();

    std::shared_ptr<Node> parent() const { return mParent.lock(); }
    bool recursiveIsChildOf(const std::shared_ptr<TouchableNode>& node) const override;

    void appendChild(const std::shared_ptr<Node>& node);
    void removeFromParent();

    glm::vec2 position2D() const { return glm::vec2(mPosition); }
    float rotation2D() const { return mRotation.z; }
    glm::vec2 scale2D() const { return glm::vec2(mScale); }

    const glm::vec3& position() const { return mPosition; }
    const glm::vec3& rotation() const { return mRotation; }
    const glm::vec3& scale() const { return mScale; }

    void setPosition2D(const glm::vec2& pos);
    void setPosition2D(float x, float y) { setPosition2D(glm::vec2(x, y)); }
    void setRotation2D(float radians);
    void setScale2D(const glm::vec2& s);
    void setScale2D(float scale) { setScale2D(glm::vec2(scale)); }
    void setScale2D(float sx, float sy) { setScale2D(glm::vec2(sx, sy)); }

    void setPosition(const glm::vec3& pos);
    void setPosition(float x, float y, float z) { setPosition(glm::vec3(x, y, z)); }
    void setRotation(const glm::vec3& r);
    void setRotation(float x, float y, float z) { setRotation(glm::vec3(x, y, z)); }
    void setScale(const glm::vec3& s);
    void setScale(float scale) { setScale(glm::vec3(scale)); }
    void setScale(float sx, float sy, float sz) { setScale(glm::vec3(sx, sy, sz)); }

    const glm::mat4& localMatrix();
    const glm::mat4& worldMatrix();
    const glm::mat4& inverseLocalMatrix();
    const glm::mat4& inverseWorldMatrix();

    virtual std::shared_ptr<TouchableNode> recursiveTouchBegin(float x, float y);

    void recursiveUpdate(float frameTime);
    void recursiveDraw();

    virtual void resize(float width, float height);

protected:
    virtual void update(float frameTime);

    virtual void beforeDraw();
    virtual void afterDraw();
    virtual void draw();

    virtual bool touchBegin(float x, float y);
    void touchContinue(float x, float y) override;
    void touchEnd(float x, float y) override;
    void touchCancel(float x, float y) override;

private:
    enum : uint8_t {
        LocalMatrixDirty = 0x01,
        WorldMatrixDirty = 0x02,
        InverseLocalMatrixDirty = 0x04,
        InverseWorldMatrixDirty = 0x08,
    };

    std::weak_ptr<Node> mParent;
    std::list<std::shared_ptr<Node>>::iterator mPositionInParent;
    std::list<std::shared_ptr<Node>> mChildren;
    glm::vec3 mPosition;
    glm::vec3 mRotation;
    glm::vec3 mScale;
    glm::mat4 mLocalMatrix;
    glm::mat4 mWorldMatrix;
    std::unique_ptr<glm::mat4> mInverseLocalMatrix;
    std::unique_ptr<glm::mat4> mInverseWorldMatrix;
    uint8_t mFlags = 0;

    void invalidateLocalTransform();
    void invalidateWorldTransform();

    Node(const Node&) = delete;
    Node& operator=(const Node&) = delete;
};
