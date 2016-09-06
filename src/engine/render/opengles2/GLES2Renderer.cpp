#include "GLES2Renderer.h"
#include "src/engine/utility/TarGzDecompressor.h"
#include "OpenGL.h"

extern "C" {
    extern const unsigned SHADERS_len;
    extern const unsigned char SHADERS[];
}

GLES2Renderer::GLES2Renderer(Engine* engine)
    : Renderer(engine)
{
    TarGzDecompressor shadersTarGz(SHADERS, SHADERS_len);
    while (shadersTarGz.next()) {
        mShaderSources[shadersTarGz.currentFileName()] =
            std::string(reinterpret_cast<const char*>(shadersTarGz.currentFileData()), shadersTarGz.currentFileSize());
    }
}

GLES2Renderer::~GLES2Renderer()
{
}

void GLES2Renderer::beginFrame(int width, int height)
{
    glViewport(0, 0, width, height);
    glClearColor(0.1f, 0.3f, 0.5f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GLES2Renderer::endFrame()
{
}

void GLES2Renderer::useShader(GLES2UberShader::Key key)
{
    auto it = mShaders.find(key);
    if (it != mShaders.end())
        it->second.use();
    else {
        auto& shader = mShaders[key];
        shader.load(mShaderSources, key);
        shader.use();
    }
}
