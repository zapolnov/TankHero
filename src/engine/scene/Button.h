
#pragma once
#include "Node.h"
#include <functional>

class Engine;

class Button : public Node
{
public:
    std::function<void()> onClick;

    Button(Engine* engine, float width, float height, uint16_t clickSound, uint16_t norm = 0, uint16_t press = 0);

protected:
    bool pressed() const { return mPressed; }

    void draw(Renderer* renderer) override;

    bool touchBegin(float x, float y) override;
    void touchContinue(float x, float y) override;
    void touchEnd(float x, float y) override;
    void touchCancel(float x, float y) override;

private:
    Engine* mEngine;
    float mWidth;
    float mHeight;
    uint16_t mNormalTexture;
    uint16_t mPressedTexture;
    uint16_t mClickSound;
    glm::vec4 mNormalColor;
    glm::vec4 mPressedColor;
    bool mPressed;

    bool mouseInside(float x, float y);
};
