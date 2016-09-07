#include "Canvas.h"
#include <cassert>

static VertexColor convertColor(const glm::vec4& color)
{
    VertexColor c;
    c.r = uint8_t(glm::clamp(int(color.r * 255.0f), 0, 255));
    c.g = uint8_t(glm::clamp(int(color.g * 255.0f), 0, 255));
    c.b = uint8_t(glm::clamp(int(color.b * 255.0f), 0, 255));
    c.a = uint8_t(glm::clamp(int(color.a * 255.0f), 0, 255));
    return c;
}

Canvas::Canvas()
{
    mMatrixStack.reserve(16);
    mMatrixStack.resize(1, glm::mat4(1.0f));

    mColorStack.reserve(16);
    mColorStack.resize(1, glm::vec4(1.0f));
}

Canvas::~Canvas()
{
}

void Canvas::reset()
{
    assert(!mInPrimitive);
    mMatrixStack.resize(1);
    mColorStack.resize(1);
    mDrawCalls.clear();
    mVertexBuffer.clear();
    mIndexBuffer.clear();
}

void Canvas::pushMatrix(const glm::mat4& matrix)
{
    assert(!mInPrimitive);
    mMatrixStack.push_back(matrix);
}

void Canvas::popMatrix()
{
    assert(!mInPrimitive);
    assert(mMatrixStack.size() > 1);
    if (mMatrixStack.size() > 1)
        mMatrixStack.pop_back();
}

void Canvas::pushColor(const glm::vec4& color)
{
    assert(!mInPrimitive);
    mColorStack.push_back(color);
}

void Canvas::popColor()
{
    assert(!mInPrimitive);
    assert(mColorStack.size() > 1);
    if (mColorStack.size() > 1)
        mColorStack.pop_back();
}

void Canvas::beginPrimitive(Primitive primitive)
{
    assert(!mInPrimitive);

    mDrawCalls.emplace_back();
    auto& drawCall = mDrawCalls.back();

    drawCall.primitive = primitive;
    drawCall.modelMatrix = mMatrixStack.back();
    drawCall.firstIndex = mIndexBuffer.size();
    drawCall.indexCount = 0;

    mInPrimitive = true;
}

void Canvas::endPrimitive()
{
    assert(mInPrimitive);

    auto& drawCall = mDrawCalls.back();
    drawCall.indexCount = mIndexBuffer.size() - drawCall.firstIndex;

    mInPrimitive = false;
}

uint16_t Canvas::emitVertex(const glm::vec2& position, const glm::vec4& color)
{
    return emitVertex(position, glm::vec2(1.0f), color);
}

uint16_t Canvas::emitVertex(const glm::vec2& position, const VertexColor& color)
{
    return emitVertex(position, glm::vec2(1.0f), color);
}

uint16_t Canvas::emitVertex(const glm::vec2& position, const glm::vec2& texCoord, const glm::vec4& color)
{
    return emitVertex(position, texCoord, convertColor(color));
}

uint16_t Canvas::emitVertex(const glm::vec2& position, const glm::vec2& texCoord, const VertexColor& color)
{
    assert(mInPrimitive);

    assert(mVertexBuffer.size() < 65535);
    auto index = uint16_t(mVertexBuffer.size());

    mVertexBuffer.emplace_back(Vertex{ position, texCoord, color });
    emitIndex(index);

    return index;
}

void Canvas::emitIndex(uint16_t index)
{
    assert(mInPrimitive);
    mIndexBuffer.emplace_back(index);
}

void Canvas::drawSolidRect(const glm::vec2& tl, const glm::vec2& br)
{
    auto c = convertColor(color());
    beginPrimitive(TriangleStrip);
    emitVertex(glm::vec2(tl.x, tl.y), glm::vec2(0.0f, 0.0f), c);
    emitVertex(glm::vec2(br.x, tl.y), glm::vec2(1.0f, 0.0f), c);
    emitVertex(glm::vec2(tl.x, br.y), glm::vec2(0.0f, 1.0f), c);
    emitVertex(glm::vec2(br.x, br.y), glm::vec2(1.0f, 1.0f), c);
    endPrimitive();
}
