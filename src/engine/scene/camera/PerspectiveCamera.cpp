#include "PerspectiveCamera.h"
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtx/intersect.hpp>

PerspectiveCamera::PerspectiveCamera()
    : mFov(glm::radians(90.0f))
    , mAspect(1.0f)
    , mNearZ(1.0f)
    , mFarZ(10.0f)
    , mPosition(0.0f, 0.0f, 1.0f)
    , mTarget(0.0f, 0.0f, 0.0f)
    , mUpVector(0.0f, 1.0f, 0.0f)
{
}

void PerspectiveCamera::setFov(float fov)
{
    if (mFov != fov) {
        mFov = fov;
        invalidateProjectionMatrix();
    }
}

void PerspectiveCamera::setAspect(float aspect)
{
    if (mAspect != aspect) {
        mAspect = aspect;
        invalidateProjectionMatrix();
    }
}

void PerspectiveCamera::setSize(float width, float height)
{
    float aspect = width / height;
    if (mAspect != aspect) {
        mAspect = aspect;
        invalidateProjectionMatrix();
    }
}

void PerspectiveCamera::setNearZ(float nearZ)
{
    if (mNearZ != nearZ) {
        mNearZ = nearZ;
        invalidateProjectionMatrix();
    }
}

void PerspectiveCamera::setFarZ(float farZ)
{
    if (mFarZ != farZ) {
        mFarZ = farZ;
        invalidateProjectionMatrix();
    }
}

void PerspectiveCamera::setZRange(float nearZ, float farZ)
{
    if (mNearZ != nearZ || mFarZ != farZ) {
        mNearZ = nearZ;
        mFarZ = farZ;
        invalidateProjectionMatrix();
    }
}

void PerspectiveCamera::setPosition(const glm::vec3& position)
{
    if (mPosition != position) {
        mPosition = position;
        invalidateViewMatrix();
    }
}

void PerspectiveCamera::setTarget(const glm::vec3& target)
{
    if (mTarget != target) {
        mTarget = target;
        invalidateViewMatrix();
    }
}

void PerspectiveCamera::setUpVector(const glm::vec3& up)
{
    if (mUpVector != up) {
        mUpVector = up;
        invalidateViewMatrix();
    }
}

void PerspectiveCamera::lookAt(const glm::vec3& pos, const glm::vec3& target, const glm::vec3& up)
{
    mPosition = pos;
    mTarget = target;
    mUpVector = up;
    invalidateViewMatrix();
}

bool PerspectiveCamera::unproject2D(glm::vec2& point)
{
    auto nearPoint = inverseProjectionViewMatrix() * glm::vec4(point, 0.0f, 1.0f);
    if (nearPoint.w != 0.0f) {
        float coeff = 1.0f / nearPoint.w;
        nearPoint.x *= coeff;
        nearPoint.y *= coeff;
        nearPoint.z *= coeff;
    }

    auto farPoint = inverseProjectionViewMatrix() * glm::vec4(point, 1.0f, 1.0f);
    if (farPoint.w != 0.0f) {
        float coeff = 1.0f / farPoint.w;
        farPoint.x *= coeff;
        farPoint.y *= coeff;
        farPoint.z *= coeff;
    }

    auto dir = glm::vec3(farPoint) - glm::vec3(nearPoint);
    auto normalizedDir = glm::normalize(dir);
    auto upVector = glm::normalize(mUpVector);

    float distance;
    if (!glm::intersectRayPlane(glm::vec3(nearPoint), normalizedDir, glm::vec3(0.0f), upVector, distance))
        return false;

    if (distance > glm::length(dir))
        return false;

    point = glm::vec2(glm::vec3(nearPoint) + normalizedDir * distance);
    return true;
}

void PerspectiveCamera::calcProjectionMatrix(glm::mat4& m) const
{
    m = glm::perspective(mFov, mAspect, mNearZ, mFarZ);
}

void PerspectiveCamera::calcViewMatrix(glm::mat4& m) const
{
    m = glm::lookAt(mPosition, mTarget, mUpVector);
}
