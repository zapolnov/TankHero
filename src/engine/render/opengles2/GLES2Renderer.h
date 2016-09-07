
#pragma once
#include "src/engine/render/Renderer.h"
#include "GLES2Shader2D.h"
#include "GLES2UberShader.h"
#include "GLES2Buffer.h"
#include <string>
#include <unordered_map>

class Engine;

class GLES2Renderer : public Renderer
{
public:
    explicit GLES2Renderer(Engine* engine);
    ~GLES2Renderer();

    void beginFrame(int width, int height) override;
    void endFrame() override;

    void useShader(GLES2UberShader::Key key);

private:
    std::unordered_map<std::string, std::string> mShaderSources;
    std::unordered_map<GLES2UberShader::Key, GLES2UberShader> mShaders;
    GLES2Shader2D mShader2D;
    GLES2Buffer mStreamVertexBuffer;
    GLES2Buffer mStreamIndexBuffer;

    void submitCanvas(const Canvas*) override;

    GLES2Renderer(const GLES2Renderer&) = delete;
    GLES2Renderer& operator=(const GLES2Renderer&) = delete;
};