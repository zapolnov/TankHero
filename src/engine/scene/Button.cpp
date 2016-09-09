#include "Button.h"
#include "src/engine/sound/SoundManager.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/Engine.h"

Button::Button(Engine* engine, float width, float height, uint16_t clickSound, uint16_t norm, uint16_t press)
    : mEngine(engine)
    , mWidth(width)
    , mHeight(height)
    , mNormalTexture(norm)
    , mPressedTexture(press)
    , mClickSound(clickSound)
    , mNormalColor(mNormalTexture != 0 ? glm::vec4(1.0f) : glm::vec4(0.7f, 0.7f, 0.0f, 1.0f))
    , mPressedColor(mPressedTexture != 0 ? glm::vec4(1.0f) : glm::vec4(1.0f, 1.0f, 0.0f, 1.0f))
    , mPressed(false)
{
}

void Button::draw(Renderer* renderer)
{
    Canvas* canvas = renderer->begin2D();
    canvas->pushMatrix(worldMatrix());
    canvas->pushColor(mPressed ? mPressedColor : mNormalColor);

    float halfWidth = mWidth * 0.5f;
    float halfHeight = mHeight * 0.5f;
    canvas->drawSolidRect(glm::vec2(-halfWidth, halfHeight), glm::vec2(halfWidth, -halfHeight),
        (mPressed ? mPressedTexture : mNormalTexture));

    canvas->popColor();
    canvas->popMatrix();
    renderer->end2D();
}

bool Button::touchBegin(float x, float y)
{
    if (mouseInside(x, y)) {
        mPressed = true;
        if (mClickSound != 0)
            mEngine->soundManager()->play(mClickSound);
        return true;
    }
    return false;
}

void Button::touchContinue(float x, float y)
{
    bool nowPressed = mouseInside(x, y);
    if (!mPressed && nowPressed) {
        if (mClickSound != 0)
            mEngine->soundManager()->play(mClickSound);
    }
    mPressed = nowPressed;
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
