#include "OrthoCamera.h"
#include <glm/gtc/matrix_transform.hpp>

OrthoCamera::OrthoCamera()
    : mLeft(-1.0f)
    , mTop(1.0f)
    , mRight(1.0f)
    , mBottom(-1.0f)
    , mNearZ(-1.0f)
    , mFarZ(1.0f)
{
}

void OrthoCamera::setLeft(float left)
{
    if (mLeft != left) {
        mLeft = left;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setTop(float top)
{
    if (mTop != top) {
        mTop = top;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setRight(float right)
{
    if (mRight != right) {
        mRight = right;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setBottom(float bottom)
{
    if (mBottom != bottom) {
        mBottom = bottom;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setDimensions(float left, float right, float bottom, float top)
{
    if (mLeft != left || mRight != right || mBottom != bottom || mTop != top) {
        mLeft = left;
        mRight = right;
        mTop = top;
        mBottom = bottom;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setSize(float width, float height)
{
    float oldSizeX = (mRight - mLeft);
    float oldSizeY = (mBottom - mTop);

    if (oldSizeX == width && oldSizeY == height)
        return;

    float centerX = mLeft + oldSizeX * 0.5f;
    float centerY = mTop  + oldSizeY * 0.5f;

    float halfWidth  = width  * 0.5f;
    float halfHeight = height * 0.5f;

    if (mLeft > mRight)
        halfWidth = -halfWidth;
    if (mTop > mBottom)
        halfHeight = -halfHeight;

    mLeft   = centerX - halfWidth;
    mRight  = centerX + halfWidth;
    mTop    = centerY - halfHeight;
    mBottom = centerY + halfHeight;

    invalidateProjectionMatrix();
}

void OrthoCamera::setNearZ(float nearZ)
{
    if (mNearZ != nearZ) {
        mNearZ = nearZ;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setFarZ(float farZ)
{
    if (mFarZ != farZ) {
        mFarZ = farZ;
        invalidateProjectionMatrix();
    }
}

void OrthoCamera::setZRange(float nearZ, float farZ)
{
    if (mNearZ != nearZ || mFarZ != farZ) {
        mNearZ = nearZ;
        mFarZ = farZ;
        invalidateProjectionMatrix();
    }
}

bool OrthoCamera::unproject2D(glm::vec2& point)
{
    point = glm::vec2(inverseProjectionViewMatrix() * glm::vec4(point, 0.0f, 1.0f));
    return true;
}

void OrthoCamera::calcProjectionMatrix(glm::mat4& m) const
{
    m = glm::ortho(mLeft, mRight, mBottom, mTop, mNearZ, mFarZ);
}

void OrthoCamera::calcViewMatrix(glm::mat4& m) const
{
    m = glm::mat4(1.0f);
}
