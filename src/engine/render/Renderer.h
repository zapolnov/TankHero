
#pragma once

class Engine;

class Renderer
{
public:
    explicit Renderer(Engine* engine);
    ~Renderer();

    void beginFrame(int width, int height);
    void endFrame();

private:
    Engine* mEngine;

    Renderer(const Renderer&) = delete;
    Renderer& operator=(const Renderer&) = delete;
};
