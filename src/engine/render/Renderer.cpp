#include "Renderer.h"
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

void Renderer::setProjectionMatrix(const glm::mat4& projection)
{
    mProjectionMatrix = projection;
    mFlags |= ProjectionMatrixChanged;
}

void Renderer::setViewMatrix(const glm::mat4& view)
{
    mViewMatrix = view;
    mFlags |= ViewMatrixChanged;
}
