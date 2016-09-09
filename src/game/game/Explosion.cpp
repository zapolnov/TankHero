#include "Explosion.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/scene/camera/Camera.h"
#include <cassert>

Explosion::Explosion(Camera* camera, uint16_t texture, float size, size_t numFrames)
    : mCamera(camera)
    , mTexture(texture)
    , mSize(size)
    , mNumFrames(numFrames)
    , mTime(0.0f)
    , mVertexFormat(VertexFormat::Position | VertexFormat::TexCoord0)
{
    assert(mVertexFormat.stride() == sizeof(Vertex));
    assert(mVertexFormat.positionOffset() == offsetof(Vertex, position));
    assert(mVertexFormat.texCoord0Offset() == offsetof(Vertex, texCoord));

    mVertices.resize(4);
    mIndices.resize(6);
    mIndices[0] = 0;
    mIndices[1] = 1;
    mIndices[2] = 2;
    mIndices[3] = 2;
    mIndices[4] = 1;
    mIndices[5] = 3;
}

void Explosion::update(float time)
{
    mTime += time * 24.0f;
    if (mTime >= float(mNumFrames)) {
        mTime = float(mNumFrames);
        removeFromParent();
    }
}

static const float TSTEPX = 64.0f / 512.0f;
static const float TSTEPY = 64.0f / 512.0f;
static const float TX = 0.5f / 512.0f;
static const float TY = 0.5f / 512.0f;
static const float TW = 63.5f / 512.0f;
static const float TH = 63.5f / 512.0f;

void Explosion::draw(Renderer* renderer)
{
    const auto& viewMatrix = mCamera->viewMatrix();

    glm::vec3 center(0.0f, 0.0f, 0.0f);
    glm::vec3 cameraRight = glm::vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    glm::vec3 cameraUp = glm::vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

    size_t frame = size_t(mTime) % mNumFrames;
    float tx = float(frame % (512 / 64));
    float ty = float(frame / (512 / 64));

    mVertices[0].position = center - cameraRight * 0.5f * mSize - cameraUp * 0.5f * mSize;
    mVertices[0].texCoord = glm::vec2(tx * TSTEPX + TX, ty * TSTEPY + TY);
    mVertices[1].position = center + cameraRight * 0.5f * mSize - cameraUp * 0.5f * mSize;
    mVertices[1].texCoord = glm::vec2(tx * TSTEPX + TW, ty * TSTEPY + TY);
    mVertices[2].position = center - cameraRight * 0.5f * mSize + cameraUp * 0.5f * mSize;
    mVertices[2].texCoord = glm::vec2(tx * TSTEPX + TX, ty * TSTEPY + TH);
    mVertices[3].position = center + cameraRight * 0.5f * mSize + cameraUp * 0.5f * mSize;
    mVertices[3].texCoord = glm::vec2(tx * TSTEPX + TW, ty * TSTEPY + TH);

    renderer->drawIndexedPrimitive(worldMatrix(), mVertexFormat, mVertices.data(), mVertices.size(),
        mIndices.data(), mIndices.size(), mTexture);
}
