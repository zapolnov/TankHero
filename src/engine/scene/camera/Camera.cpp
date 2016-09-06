#include "Camera.h"

Camera::Camera()
    : mFlags(0)
{
    invalidateProjectionMatrix();
    invalidateViewMatrix();
}

const glm::mat4& Camera::projectionMatrix()
{
    if (mFlags & ProjectionMatrixDirty) {
        calcProjectionMatrix(mProjectionMatrix);
        mFlags &= ~ProjectionMatrixDirty;
    }
    return mProjectionMatrix;
}

const glm::mat4& Camera::viewMatrix()
{
    if (mFlags & ViewMatrixDirty) {
        calcViewMatrix(mViewMatrix);
        mFlags &= ~ViewMatrixDirty;
    }
    return mViewMatrix;
}

const glm::mat4& Camera::inverseProjectionMatrix()
{
    if (mFlags & InverseProjectionMatrixDirty) {
        mInverseProjectionMatrix = glm::inverse(projectionMatrix());
        mFlags &= ~InverseProjectionMatrixDirty;
    }
    return mInverseProjectionMatrix;
}

const glm::mat4& Camera::inverseViewMatrix()
{
    if (mFlags & InverseViewMatrixDirty) {
        mInverseViewMatrix = glm::inverse(viewMatrix());
        mFlags &= ~InverseViewMatrixDirty;
    }
    return mInverseViewMatrix;
}

const glm::mat4& Camera::inverseProjectionViewMatrix()
{
    if (mFlags & InverseProjectionViewMatrixDirty) {
        mInverseProjectionViewMatrix = glm::inverse(projectionMatrix() * viewMatrix());
        mFlags &= ~InverseProjectionViewMatrixDirty;
    }
    return mInverseProjectionViewMatrix;
}

void Camera::invalidateProjectionMatrix()
{
    mFlags |= (ProjectionMatrixDirty | InverseProjectionMatrixDirty | InverseProjectionViewMatrixDirty);
}

void Camera::invalidateViewMatrix()
{
    mFlags |= (ViewMatrixDirty | InverseViewMatrixDirty | InverseProjectionViewMatrixDirty);
}
