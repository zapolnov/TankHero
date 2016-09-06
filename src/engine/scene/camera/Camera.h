
#pragma once
#include <glm/glm.hpp>
#include <cstdint>

class Camera
{
public:
    Camera();
    virtual ~Camera() = default;

    virtual void setSize(float width, float height) = 0;

    const glm::mat4& projectionMatrix();
    const glm::mat4& viewMatrix();

    const glm::mat4& inverseProjectionMatrix();
    const glm::mat4& inverseViewMatrix();
    const glm::mat4& inverseProjectionViewMatrix();

    virtual bool unproject2D(glm::vec2& point) = 0;

protected:
    virtual void calcProjectionMatrix(glm::mat4& m) const = 0;
    virtual void calcViewMatrix(glm::mat4& m) const = 0;

    void invalidateProjectionMatrix();
    void invalidateViewMatrix();

private:
    enum : uint8_t {
        ProjectionMatrixDirty = 0x01,
        ViewMatrixDirty = 0x02,
        InverseProjectionMatrixDirty = 0x04,
        InverseViewMatrixDirty = 0x08,
        InverseProjectionViewMatrixDirty = 0x10,
    };

    glm::mat4 mProjectionMatrix;
    glm::mat4 mViewMatrix;
    glm::mat4 mInverseProjectionMatrix;
    glm::mat4 mInverseViewMatrix;
    glm::mat4 mInverseProjectionViewMatrix;
    uint8_t mFlags = 0;

    Camera(const Camera&) = delete;
    Camera& operator=(const Camera&) = delete;
};
