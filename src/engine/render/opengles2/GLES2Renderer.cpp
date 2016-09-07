#include "GLES2Renderer.h"
#include "src/engine/utility/TarGzDecompressor.h"
#include "src/engine/render/Canvas.h"
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

    mShader2D.load(mShaderSources);
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

void GLES2Renderer::submitCanvas(const Canvas* canvas)
{
    mShader2D.use();

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

        glDrawElements(p, call.indexCount, GL_UNSIGNED_SHORT,
            reinterpret_cast<void*>(call.firstIndex * sizeof(uint16_t)));
    }

    glDisableVertexAttribArray(mShader2D.positionAttribute());
    glDisableVertexAttribArray(mShader2D.texCoordAttribute());
    glDisableVertexAttribArray(mShader2D.colorAttribute());
}
