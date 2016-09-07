
#pragma once
#include "src/engine/render/Renderer.h"
#include "GLES2Shader2D.h"
#include "GLES2UberShader.h"
#include "GLES2Buffer.h"
#include "GLES2Texture.h"
#include "GLES2Mesh.h"
#include "GLES2Renderbuffer.h"
#include "GLES2Framebuffer.h"
#include <string>
#include <unordered_map>
#include <vector>

class Engine;

class GLES2Renderer : public Renderer
{
public:
    explicit GLES2Renderer(Engine* engine);
    ~GLES2Renderer();

    void beginFrame(int width, int height) override;
    void endFrame() override;

    void loadTexture(uint16_t texture) override;
    void unloadAllTextures() override;

    void loadMesh(uint16_t mesh) override;
    void unloadAllMeshes() override;

    const glm::vec3& meshBBoxMin(uint16_t id) const override;
    const glm::vec3& meshBBoxMax(uint16_t id) const override;
    const glm::vec3& meshSphereCenter(uint16_t id) const override;
    float meshSphereRadius(uint16_t id) const override;

    const GLES2UberShader& useShader(GLES2UberShader::Key key);

private:
    std::unordered_map<std::string, std::string> mShaderSources;
    std::unordered_map<GLES2UberShader::Key, GLES2UberShader> mShaders;
    std::vector<std::unique_ptr<GLES2Texture>> mTextures;
    std::vector<std::unique_ptr<GLES2Mesh>> mMeshes;
    glm::mat4 mSavedProjectionMatrix;
    glm::mat4 mSavedViewMatrix;
    GLES2Shader2D mShader2D;
    GLES2Buffer mStreamVertexBuffer;
    GLES2Buffer mStreamIndexBuffer;
    GLES2Framebuffer mShadowFramebuffer;
    GLES2Renderbuffer mShadowRenderbuffer;
    GLES2Texture mShadowTexture;
    glm::mat4 mShadowProjectionMatrix;
    int mViewportWidth = 0;
    int mViewportHeight = 0;
    int mShadowMapWidth = 0;
    int mShadowMapHeight = 0;
    GLuint mSavedFramebuffer;

    void beginRenderShadowMap();
    void endRenderShadowMap();

    void submitCanvas(const Canvas*) override;

    GLES2Renderer(const GLES2Renderer&) = delete;
    GLES2Renderer& operator=(const GLES2Renderer&) = delete;
};
