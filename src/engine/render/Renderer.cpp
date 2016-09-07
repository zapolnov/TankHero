#include "Renderer.h"
#include "Canvas.h"
#include <cassert>

#ifdef RENDERER_GLES2
 #include "opengles2/GLES2Renderer.h"
 Renderer* Renderer::create(Engine* engine) { return new GLES2Renderer(engine); }
#endif

Renderer::Renderer(Engine* engine)
    : mEngine(engine)
    , mProjectionMatrix(1.0f)
    , mViewMatrix(1.0f)
    , mFlags(0)
{
    mTextureNames.emplace_back(std::string());
    mTextureIds.emplace(std::string(), 0);
    mMeshNames.emplace_back(std::string());
    mMeshIds.emplace(std::string(), 0);
}

Renderer::~Renderer()
{
}

uint16_t Renderer::textureNameId(const std::string& name)
{
    auto it = mTextureIds.find(name);
    if (it != mTextureIds.end())
        return it->second;

    assert(mTextureNames.size() < 65536);
    auto id = uint16_t(mTextureNames.size());
    mTextureNames.emplace_back(name);
    mTextureIds.emplace(name, id);

    return id;
}

const std::string& Renderer::textureName(uint16_t id) const
{
    assert(id < mTextureNames.size());
    return mTextureNames[id];
}

uint16_t Renderer::meshNameId(const std::string& name)
{
    auto it = mMeshIds.find(name);
    if (it != mMeshIds.end())
        return it->second;

    assert(mMeshNames.size() < 65536);
    auto id = uint16_t(mMeshNames.size());
    mMeshNames.emplace_back(name);
    mMeshIds.emplace(name, id);

    return id;
}

const std::string& Renderer::meshName(uint16_t id) const
{
    assert(id < mMeshNames.size());
    return mMeshNames[id];
}

void Renderer::setProjectionMatrix(const glm::mat4& projection)
{
    mProjectionMatrix = projection;
}

void Renderer::setViewMatrix(const glm::mat4& view)
{
    mViewMatrix = view;
}

Canvas* Renderer::begin2D()
{
    if (mIn2d++ == 0) {
        if (!mCanvas)
            mCanvas.reset(new Canvas);
    }
    return mCanvas.get();
}

void Renderer::end2D()
{
    assert(mIn2d);
    if (mIn2d && --mIn2d == 0) {
        submitCanvas(mCanvas.get());
        mCanvas.reset();
    }
}

void Renderer::drawMesh(const glm::mat4& model, uint16_t mesh)
{
    mDrawCalls.emplace_back();
    auto& drawCall = mDrawCalls.back();

    drawCall.projectionMatrix = mProjectionMatrix;
    drawCall.viewMatrix = mViewMatrix;
    drawCall.modelMatrix = model;
    drawCall.lightPosition = mLightPosition;
    drawCall.lightColor = mLightColor;
    drawCall.lightPower = mLightPower;
    drawCall.mesh = mesh;
}
