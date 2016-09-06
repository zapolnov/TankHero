
#pragma once
#include "Camera.h"

class OrthoCamera : public Camera
{
public:
    OrthoCamera();

    float left() const { return mLeft; }
    float right() const { return mRight; }
    float top() const { return mTop; }
    float bottom() const { return mBottom; }

    float nearZ() const { return mNearZ; }
    float farZ() const { return mFarZ; }

    void setLeft(float left);
    void setTop(float top);
    void setRight(float right);
    void setBottom(float bottom);
    void setDimensions(float left, float right, float bottom, float top);
    void setSize(float width, float height) override;

    void setNearZ(float nearZ);
    void setFarZ(float farZ);
    void setZRange(float nearZ, float farZ);

    bool unproject2D(glm::vec2& point) override;

protected:
    void calcProjectionMatrix(glm::mat4& m) const override;
    void calcViewMatrix(glm::mat4& m) const override;

private:
    float mLeft;
    float mRight;
    float mTop;
    float mBottom;
    float mNearZ;
    float mFarZ;
};
