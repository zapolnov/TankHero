#include "Button.h"
#include "src/engine/Engine.h"

Button::Button(float width, float height)
    : mWidth(width)
    , mHeight(height)
    , mPressed(false)
{
}

void Button::draw(Renderer* renderer)
{
    /*
    renderer->setModelMatrix(worldMatrix());
    renderer->useShader(Shader::SolidColor);

    if (mPressed)
        renderer->setColor(glm::vec4(1.0f, 1.0f, 0.0f, 1.0f));
    else
        renderer->setColor(glm::vec4(0.7f, 0.7f, 0.0f, 1.0f));

    float halfWidth = mWidth * 0.5f;
    float halfHeight = mHeight * 0.5f;
    renderer->drawSolidRect(-halfWidth, -halfHeight, halfWidth, halfHeight);
    */
}

bool Button::touchBegin(float x, float y)
{
    if (mouseInside(x, y)) {
        mPressed = true;
        return true;
    }
    return false;
}

void Button::touchContinue(float x, float y)
{
    mPressed = mouseInside(x, y);
}

void Button::touchEnd(float x, float y)
{
    mPressed = false;
    if (mouseInside(x, y)) {
        if (onClick)
            onClick();
    }
}

void Button::touchCancel(float, float)
{
    mPressed = false;
}

bool Button::mouseInside(float x, float y)
{
    float halfWidth = mWidth * 0.5f;
    float halfHeight = mHeight * 0.5f;

    auto pos = inverseWorldMatrix() * glm::vec4(x, y, 0.0f, 1.0f);
    return (pos.x >= -halfWidth && pos.y >= -halfHeight && pos.x <= halfWidth && pos.y <= halfHeight);
}
