#include "GLES2Renderer.h"
#include "src/engine/utility/TarGzDecompressor.h"
#include "src/engine/render/Canvas.h"
#include "OpenGL.h"
#include <glm/gtc/matrix_transform.hpp>

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

    mShader2D.load(mShaderSources);
}

GLES2Renderer::~GLES2Renderer()
{
}

void GLES2Renderer::beginFrame(int width, int height)
{
    mViewportWidth = width;
    mViewportHeight = height;

    glViewport(0, 0, width, height);
    glClearColor(0.1f, 0.3f, 0.5f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void GLES2Renderer::endFrame()
{
    if (mDrawCalls.empty())
        return;

    glEnable(GL_DEPTH_TEST);
    glDisable(GL_BLEND);

    //////////////////////////////////////////////////////////////////////////////////
    // Phase 1: render shadow map

    beginRenderShadowMap();

    for (const auto& drawCall : mDrawCalls) {
        switch (drawCall.type) {
            case DrawIndexedPrimitive:
                continue;

            case DrawMesh: {
                const auto& mesh = mMeshes[drawCall.u.m.mesh];

                auto& shader = useShader(GLES2UberShader::WritesShadowMap);
                glUniformMatrix4fv(shader.projectionMatrixUniform(), 1, GL_FALSE, &mProjectionMatrix[0][0]);
                glUniformMatrix4fv(shader.viewMatrixUniform(), 1, GL_FALSE, &mViewMatrix[0][0]);
                glUniformMatrix4fv(shader.modelMatrixUniform(), 1, GL_FALSE, &drawCall.modelMatrix[0][0]);

                for (size_t i = 0; i < mesh->elementCount(); i++) {
                    const auto& material = mesh->elementMaterial(i);
                    if (material.flags & MaterialCastsShadow)
                        mesh->renderElement(i, shader);
                }

                continue;
            }
        }
    }

    endRenderShadowMap();

    //////////////////////////////////////////////////////////////////////////////////
    // Phase 2: render scene

    glActiveTexture(GL_TEXTURE3);
    mShadowTexture.bind(GL_TEXTURE_2D);

    auto bindDiffuseMap = [this](GLES2UberShader::Key& key, uint16_t texture) {
        glActiveTexture(GL_TEXTURE0);
        if (texture == 0)
            glBindTexture(GL_TEXTURE_2D, 0);
        else {
            key |= GLES2UberShader::HasDiffuseMap;
            mTextures[texture]->bind(GL_TEXTURE_2D);
        }
    };

    auto bindShader = [this](GLES2UberShader::Key key, const DrawCall& drawCall) -> const GLES2UberShader* {
        auto shader = &useShader(key);
        glUniformMatrix4fv(shader->projectionMatrixUniform(), 1, GL_FALSE, &drawCall.projectionMatrix[0][0]);
        glUniformMatrix4fv(shader->viewMatrixUniform(), 1, GL_FALSE, &drawCall.viewMatrix[0][0]);
        glUniformMatrix4fv(shader->modelMatrixUniform(), 1, GL_FALSE, &drawCall.modelMatrix[0][0]);

        if (shader->shadowProjectionUniform() >= 0)
            glUniformMatrix4fv(shader->shadowProjectionUniform(), 1, GL_FALSE, &mShadowProjectionMatrix[0][0]);

        if (shader->lightPositionUniform() >= 0) {
            const auto& p = drawCall.lightPosition;
            glUniform3f(shader->lightPositionUniform(), p.x, p.y, p.z);
        }

        if (shader->lightColorUniform() >= 0) {
            const auto& c = drawCall.lightColor;
            glUniform3f(shader->lightColorUniform(), c.x, c.y, c.z);
        }

        if (shader->lightPowerUniform() >= 0)
            glUniform1f(shader->lightPowerUniform(), drawCall.lightPower);

        if (shader->diffuseMapUniform() >= 0)
            glUniform1i(shader->diffuseMapUniform(), 0);
        if (shader->normalMapUniform() >= 0)
            glUniform1i(shader->normalMapUniform(), 1);
        if (shader->specularMapUniform() >= 0)
            glUniform1i(shader->specularMapUniform(), 2);
        if (shader->shadowMapUniform() >= 0)
            glUniform1i(shader->shadowMapUniform(), 3);

        return shader;
    };

    for (const auto& drawCall : mDrawCalls) {
        GLES2UberShader::Key baseKey = 0;

        switch (drawCall.type) {
            case DrawIndexedPrimitive: {
                mStreamVertexBuffer.bind(GL_ARRAY_BUFFER);
                glBufferData(GL_ARRAY_BUFFER, drawCall.u.ip.vertexCount * drawCall.u.ip.format.stride(),
                    drawCall.u.ip.vertices, GL_STREAM_DRAW);

                mStreamIndexBuffer.bind(GL_ELEMENT_ARRAY_BUFFER);
                glBufferData(GL_ELEMENT_ARRAY_BUFFER, drawCall.u.ip.indexCount * sizeof(uint16_t),
                    drawCall.u.ip.indices, GL_STREAM_DRAW);

                bindDiffuseMap(baseKey, drawCall.u.ip.texture);
                auto shader = bindShader(baseKey, drawCall);

                glEnable(GL_DEPTH_TEST);
                glEnable(GL_CULL_FACE);
                glCullFace(GL_BACK);
                glEnable(GL_BLEND);
                glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

                if (shader->ambientColorUniform() >= 0)
                    glUniform3f(shader->ambientColorUniform(), 0.3f, 0.3f, 0.3f);
                if (shader->diffuseColorUniform() >= 0)
                    glUniform3f(shader->diffuseColorUniform(), 1.0f, 1.0, 1.0f);
                if (shader->specularColorUniform() >= 0)
                    glUniform3f(shader->specularColorUniform(), 0.0f, 0.0f, 0.0f);
                if (shader->opacityUniform() >= 0)
                    glUniform1f(shader->opacityUniform(), 1.0f);
                if (shader->shininessUniform() >= 0)
                    glUniform1f(shader->shininessUniform(), 0.0f);

                GLES2Mesh::enableAttributes(*shader, drawCall.u.ip.format);
                glDrawElements(GL_TRIANGLES, GLsizei(drawCall.u.ip.indexCount), GL_UNSIGNED_SHORT, nullptr);
                GLES2Mesh::disableAttributes(*shader, drawCall.u.ip.format);
                continue;
            }

            case DrawMesh: {
                const auto& mesh = mMeshes[drawCall.u.m.mesh];

                if (mesh->vertexFormat().hasNormal()
                    && mesh->vertexFormat().hasTangent()
                    && mesh->vertexFormat().hasBitangent())
                    baseKey |= GLES2UberShader::HasLighting;
                if (mesh->vertexFormat().hasColor())
                    baseKey |= GLES2UberShader::HasColorAttribute;

                GLES2UberShader::Key previousKey;
                const GLES2UberShader* shader;

                for (size_t i = 0; i < mesh->elementCount(); i++) {
                    const auto& material = mesh->elementMaterial(i);

                    GLES2UberShader::Key key = baseKey;

                    if (material.flags & MaterialAcceptsShadow)
                        key |= GLES2UberShader::AcceptsShadow;

                    bindDiffuseMap(key, material.diffuseMap);

                    glActiveTexture(GL_TEXTURE1);
                    if (!(key & GLES2UberShader::HasLighting) || material.normalMap == 0)
                        glBindTexture(GL_TEXTURE_2D, 0);
                    else {
                        key |= GLES2UberShader::HasNormalMap;
                        mTextures[material.normalMap]->bind(GL_TEXTURE_2D);
                    }

                    glActiveTexture(GL_TEXTURE2);
                    if (!(key & GLES2UberShader::HasLighting) || material.specularMap == 0)
                        glBindTexture(GL_TEXTURE_2D, 0);
                    else {
                        key |= GLES2UberShader::HasSpecularMap;
                        mTextures[material.specularMap]->bind(GL_TEXTURE_2D);
                    }

                    if (i == 0 || previousKey != key) {
                        previousKey = key;
                        shader = bindShader(key, drawCall);
                    }

                    mesh->renderElement(i, *shader);
                }

                continue;
            }
        }
    }

    mDrawCalls.clear();
}

void GLES2Renderer::loadTexture(uint16_t texture)
{
    if (texture >= mTextures.size())
        mTextures.resize(texture + 1);

    if (!mTextures[texture]) {
        assert(mTextureNames.size() > texture);
        mTextures[texture].reset(new GLES2Texture);
        mTextures[texture]->load(mTextureNames[texture]);
    }
}

void GLES2Renderer::unloadAllTextures()
{
    mTextures.clear();
}

void GLES2Renderer::loadMesh(uint16_t mesh)
{
    if (mesh >= mMeshes.size())
        mMeshes.resize(mesh + 1);

    if (!mMeshes[mesh]) {
        assert(mMeshNames.size() > mesh);
        mMeshes[mesh].reset(new GLES2Mesh);
        mMeshes[mesh]->load(this, mMeshNames[mesh]);
    }
}

void GLES2Renderer::unloadAllMeshes()
{
    mMeshes.clear();
}

const glm::vec3& GLES2Renderer::meshBBoxMin(uint16_t id) const
{
    return mMeshes[id]->bboxMin();
}

const glm::vec3& GLES2Renderer::meshBBoxMax(uint16_t id) const
{
    return mMeshes[id]->bboxMax();
}

const glm::vec3& GLES2Renderer::meshSphereCenter(uint16_t id) const
{
    return mMeshes[id]->sphereCenter();
}

float GLES2Renderer::meshSphereRadius(uint16_t id) const
{
    return mMeshes[id]->sphereRadius();
}

const GLES2UberShader& GLES2Renderer::useShader(GLES2UberShader::Key key)
{
    auto it = mShaders.find(key);
    if (it != mShaders.end()) {
        it->second.use();
        return it->second;
    } else {
        auto& shader = mShaders[key];
        shader.load(mShaderSources, key);
        shader.use();
        return shader;
    }
}

void GLES2Renderer::beginRenderShadowMap()
{
    int shadowMapWidth = 2048;//mViewportWidth;
    int shadowMapHeight = 2048;//mViewportHeight;

    GLint savedFramebuffer = 0;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &savedFramebuffer);
    mSavedFramebuffer = savedFramebuffer;

    if (shadowMapWidth == mShadowMapWidth && shadowMapHeight == mShadowMapHeight)
        glBindFramebuffer(GL_FRAMEBUFFER, mShadowFramebuffer.handle());
    else {
        glBindRenderbuffer(GL_RENDERBUFFER, mShadowRenderbuffer.handle());
        glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, shadowMapWidth, shadowMapHeight);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, mShadowTexture.handle());
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, shadowMapWidth, shadowMapHeight, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);

        glBindFramebuffer(GL_FRAMEBUFFER, mShadowFramebuffer.handle());
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, mShadowTexture.handle(), 0);
        glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, mShadowRenderbuffer.handle());

        mShadowMapWidth = shadowMapWidth;
        mShadowMapHeight = shadowMapHeight;

        glBindRenderbuffer(GL_RENDERBUFFER, 0);
        assert(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE);
    }

    glViewport(0, 0, mShadowMapWidth, mShadowMapHeight);

    glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glEnable(GL_CULL_FACE);
    glCullFace(GL_FRONT);

    mSavedProjectionMatrix = mProjectionMatrix;
    mSavedViewMatrix = mViewMatrix;

    mProjectionMatrix = glm::ortho(mShadowMapMin.x, mShadowMapMax.x, mShadowMapMin.y, mShadowMapMax.y, -1000.0f, 1000.0f);
    mViewMatrix = glm::lookAt(-mLightPosition, glm::vec3(0.0f), glm::vec3(0.0f, 1.0f, 0.0f));

    mShadowProjectionMatrix = mProjectionMatrix * mViewMatrix;
}

void GLES2Renderer::endRenderShadowMap()
{
    glBindFramebuffer(GL_FRAMEBUFFER, mSavedFramebuffer);
    mSavedFramebuffer = 0;

    glViewport(0, 0, mViewportWidth, mViewportHeight);

    mProjectionMatrix = mSavedProjectionMatrix;
    mViewMatrix = mSavedViewMatrix;
}

void GLES2Renderer::submitCanvas(const Canvas* canvas)
{
    mShader2D.use();

    glDisable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    const auto& vb = canvas->vertexBuffer();
    mStreamVertexBuffer.bind(GL_ARRAY_BUFFER);
    glBufferData(GL_ARRAY_BUFFER, vb.size() * sizeof(Canvas::Vertex), vb.data(), GL_STREAM_DRAW);

    const auto& ib = canvas->indexBuffer();
    mStreamIndexBuffer.bind(GL_ELEMENT_ARRAY_BUFFER);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, ib.size() * sizeof(uint16_t), ib.data(), GL_STREAM_DRAW);

    glUniformMatrix4fv(mShader2D.projectionMatrixUniform(), 1, GL_FALSE, &(mProjectionMatrix * mViewMatrix)[0][0]);

    glVertexAttribPointer(mShader2D.positionAttribute(), 2, GL_FLOAT, GL_FALSE, sizeof(Canvas::Vertex),
        reinterpret_cast<void*>(offsetof(Canvas::Vertex, position)));
    glVertexAttribPointer(mShader2D.texCoordAttribute(), 2, GL_FLOAT, GL_FALSE, sizeof(Canvas::Vertex),
        reinterpret_cast<void*>(offsetof(Canvas::Vertex, texCoord)));
    glVertexAttribPointer(mShader2D.colorAttribute(), 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(Canvas::Vertex),
        reinterpret_cast<void*>(offsetof(Canvas::Vertex, color)));

    glEnableVertexAttribArray(mShader2D.positionAttribute());
    glEnableVertexAttribArray(mShader2D.texCoordAttribute());
    glEnableVertexAttribArray(mShader2D.colorAttribute());

    for (const auto& call : canvas->drawCalls()) {
        GLenum p = GLenum(-1);
        switch (call.primitive) {
            case Canvas::Points: p = GL_POINTS; break;
            case Canvas::Lines: p = GL_LINES; break;
            case Canvas::Triangles: p = GL_TRIANGLES; break;
            case Canvas::TriangleStrip: p = GL_TRIANGLE_STRIP; break;
        }

        glUniformMatrix4fv(mShader2D.modelMatrixUniform(), 1, GL_FALSE, &call.modelMatrix[0][0]);

        glDrawElements(p, GLsizei(call.indexCount), GL_UNSIGNED_SHORT,
            reinterpret_cast<void*>(call.firstIndex * sizeof(uint16_t)));
    }

    glDisableVertexAttribArray(mShader2D.positionAttribute());
    glDisableVertexAttribArray(mShader2D.texCoordAttribute());
    glDisableVertexAttribArray(mShader2D.colorAttribute());
}

Renderer* Renderer::create(Engine* engine)
{
    return new GLES2Renderer(engine);
}
