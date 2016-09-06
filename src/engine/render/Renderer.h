
#pragma once
#include <glm/glm.hpp>

class Engine;

class Renderer
{
public:
    static Renderer* create(Engine* engine);
    ~Renderer();

    virtual void beginFrame(int width, int height) = 0;
    virtual void endFrame() = 0;

    void setProjectionMatrix(const glm::mat4& projection);
    void setViewMatrix(const glm::mat4& view);

protected:
    enum Flags : uint32_t
    {
        ProjectionMatrixChanged = 0x00000001,
        ViewMatrixChanged = 0x00000002,
    };

    Engine* mEngine;
    glm::mat4 mProjectionMatrix;
    glm::mat4 mViewMatrix;
    uint32_t mFlags;

    explicit Renderer(Engine* engine);

    Renderer(const Renderer&) = delete;
    Renderer& operator=(const Renderer&) = delete;
};
