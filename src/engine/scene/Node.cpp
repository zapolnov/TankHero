#include "Node.h"
#include <glm/gtc/matrix_transform.hpp>
#include <cassert>

Node::Node()
    : mPosition(0.0f)
    , mRotation(0.0f)
    , mScale(1.0f)
{
    invalidateLocalTransform();
}

Node::~Node()
{
}

bool Node::recursiveIsChildOf(const std::shared_ptr<TouchableNode>& node) const
{
    if (node.get() == this)
        return true;

    auto p = parent();
    while (p) {
        if (p.get() == node.get())
            return true;
        p = p->parent();
    }

    return false;
}

void Node::appendChild(const std::shared_ptr<Node>& node)
{
    assert(node->parent() == nullptr);
    node->mPositionInParent = mChildren.insert(mChildren.end(), node);
    node->mParent = shared_from_this();
    node->invalidateWorldTransform();
}

void Node::removeFromParent()
{
    auto p = parent();
    if (p) {
        p->mChildren.erase(mPositionInParent);
        mParent = std::shared_ptr<Node>();
        invalidateWorldTransform();
    }
}

void Node::setPosition2D(const glm::vec2& pos)
{
    mPosition = glm::vec3(pos, 0.0f);
    invalidateLocalTransform();
}

void Node::setRotation2D(float radians)
{
    mRotation = glm::vec3(0.0f, 0.0f, radians);
    invalidateLocalTransform();
}

void Node::setScale2D(const glm::vec2& s)
{
    mScale = glm::vec3(s.x, s.y, 1.0f);
    invalidateLocalTransform();
}

void Node::setPosition(const glm::vec3& pos)
{
    mPosition = pos;
    invalidateLocalTransform();
}

void Node::setRotation(const glm::vec3& r)
{
    mRotation = r;
    invalidateLocalTransform();
}

void Node::setScale(const glm::vec3& s)
{
    mScale = s;
    invalidateLocalTransform();
}

const glm::mat4& Node::localMatrix()
{
    if (mFlags & LocalMatrixDirty) {
        mLocalMatrix = glm::translate(glm::mat4(1.0f), mPosition);
        mLocalMatrix = glm::rotate(mLocalMatrix, mRotation.x, glm::vec3(1.0f, 0.0f, 0.0f));
        mLocalMatrix = glm::rotate(mLocalMatrix, mRotation.y, glm::vec3(0.0f, 1.0f, 0.0f));
        mLocalMatrix = glm::rotate(mLocalMatrix, mRotation.z, glm::vec3(0.0f, 0.0f, 1.0f));
        mLocalMatrix = glm::scale(mLocalMatrix, mScale);
        mFlags &= ~LocalMatrixDirty;
    }
    return mLocalMatrix;
}

const glm::mat4& Node::worldMatrix()
{
    if (mFlags & WorldMatrixDirty) {
        auto p = parent();
        if (!p)
            mWorldMatrix = localMatrix();
        else
            mWorldMatrix = p->worldMatrix() * localMatrix();
        mFlags &= ~WorldMatrixDirty;
    }
    return mWorldMatrix;
}

const glm::mat4& Node::inverseLocalMatrix()
{
    if (mFlags & InverseLocalMatrixDirty) {
        if (!mInverseLocalMatrix)
            mInverseLocalMatrix.reset(new glm::mat4);
        *mInverseLocalMatrix = glm::inverse(localMatrix());
        mFlags &= ~InverseLocalMatrixDirty;
    }
    return *mInverseLocalMatrix;
}

const glm::mat4& Node::inverseWorldMatrix()
{
    if (mFlags & InverseWorldMatrixDirty) {
        if (!mInverseWorldMatrix)
            mInverseWorldMatrix.reset(new glm::mat4);
        *mInverseWorldMatrix = glm::inverse(worldMatrix());
        mFlags &= ~InverseWorldMatrixDirty;
    }
    return *mInverseWorldMatrix;
}

std::shared_ptr<TouchableNode> Node::recursiveTouchBegin(float x, float y)
{
    for (auto it = mChildren.rbegin(); it != mChildren.rend(); ) {
        auto child = *it++;
        auto node = child->recursiveTouchBegin(x, y);
        if (node)
            return node;
    }

    if (touchBegin(x, y))
        return shared_from_this();

    return nullptr;
}

void Node::recursiveUpdate(float frameTime)
{
    update(frameTime);
    for (auto it = mChildren.begin(); it != mChildren.end(); ) {
        auto child = *it++;
        child->recursiveUpdate(frameTime);
    }
}

void Node::recursiveDraw(Renderer* renderer)
{
    beforeDraw(renderer);
    draw(renderer);

    for (auto it = mChildren.begin(); it != mChildren.end(); ) {
        auto child = *it++;
        child->recursiveDraw(renderer);
    }

    afterDraw(renderer);
}

void Node::resize(float, float)
{
}

void Node::update(float)
{
}

void Node::beforeDraw(Renderer*)
{
}

void Node::afterDraw(Renderer*)
{
}

void Node::draw(Renderer*)
{
}

bool Node::touchBegin(float, float)
{
    return false;
}

void Node::touchContinue(float, float)
{
}

void Node::touchEnd(float, float)
{
}

void Node::touchCancel(float, float)
{
}

void Node::invalidateLocalTransform()
{
    mFlags |= (LocalMatrixDirty | InverseLocalMatrixDirty);
    invalidateWorldTransform();
}

void Node::invalidateWorldTransform()
{
    mFlags |= (WorldMatrixDirty | InverseWorldMatrixDirty);
    for (const auto& child : mChildren)
        child->invalidateWorldTransform();
}
