
#pragma once
#include "Node.h"
#include <functional>

class Button : public Node
{
public:
    std::function<void()> onClick;

    Button(float width, float height);

protected:
    bool pressed() const { return mPressed; }

    void draw(Renderer* renderer) override;

    bool touchBegin(float x, float y) override;
    void touchContinue(float x, float y) override;
    void touchEnd(float x, float y) override;
    void touchCancel(float x, float y) override;

private:
    float mWidth;
    float mHeight;
    bool mPressed;

    bool mouseInside(float x, float y);
};
