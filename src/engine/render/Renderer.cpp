#include "Renderer.h"

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
}

Renderer::~Renderer()
{
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
