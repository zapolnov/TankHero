
#pragma once
#include "Camera.h"

class PerspectiveCamera : public Camera
{
public:
    PerspectiveCamera();

    float fov() const { return mFov; }
    float aspect() const { return mAspect; }
    float nearZ() const { return mNearZ; }
    float farZ() const { return mFarZ; }

    const glm::vec3& position() const { return mPosition; }
    const glm::vec3& target() const { return mTarget; }
    const glm::vec3& upVector() const { return mUpVector; }

    void setFov(float fov);
    void setAspect(float aspect);
    void setSize(float width, float height) override;
    void setNearZ(float nearZ);
    void setFarZ(float farZ);
    void setZRange(float nearZ, float farZ);

    void setPosition(const glm::vec3& position);
    void setTarget(const glm::vec3& target);
    void setUpVector(const glm::vec3& up);
    void lookAt(const glm::vec3& pos, const glm::vec3& target, const glm::vec3& up);

    bool unproject2D(glm::vec2& point) override;

protected:
    void calcProjectionMatrix(glm::mat4& m) const override;
    void calcViewMatrix(glm::mat4& m) const override;

private:
    float mFov;
    float mAspect;
    float mNearZ;
    float mFarZ;
    glm::vec3 mPosition;
    glm::vec3 mTarget;
    glm::vec3 mUpVector;
};
