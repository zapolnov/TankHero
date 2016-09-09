
#pragma once
#include "src/engine/mesh/VertexFormat.h"
#include <glm/glm.hpp>
#include <cstdint>
#include <vector>

class Canvas
{
public:
    enum Primitive
    {
        Points,
        Lines,
        Triangles,
        TriangleStrip,
    };

    struct Vertex
    {
        glm::vec2 position;
        glm::vec2 texCoord;
        VertexColor color;
    };

    struct DrawCall
    {
        Primitive primitive;
        glm::mat4 modelMatrix;
        size_t firstIndex;
        size_t indexCount;
        uint16_t texture;
    };

    Canvas();
    ~Canvas();

    void reset();

    const std::vector<DrawCall>& drawCalls() const { return mDrawCalls; }
    const std::vector<Vertex>& vertexBuffer() const { return mVertexBuffer; }
    const std::vector<uint16_t>& indexBuffer() const { return mIndexBuffer; }

    const glm::mat4& matrix() const { return mMatrixStack.back(); }
    void pushMatrix(const glm::mat4& matrix);
    void popMatrix();

    const glm::vec4& color() const { return mColorStack.back(); }
    void pushColor(const glm::vec4& color);
    void popColor();

    void beginPrimitive(Primitive primitive, uint16_t texture = 0);
    void endPrimitive();

    uint16_t emitVertex(const glm::vec2& position, const glm::vec4& color);
    uint16_t emitVertex(const glm::vec2& position, const VertexColor& color);
    uint16_t emitVertex(const glm::vec2& position, const glm::vec2& texCoord, const glm::vec4& color);
    uint16_t emitVertex(const glm::vec2& position, const glm::vec2& texCoord, const VertexColor& color);
    void emitIndex(uint16_t index);

    void drawSolidRect(const glm::vec2& tl, const glm::vec2& br, uint16_t texture = 0,
        const glm::vec2& t1 = glm::vec2(0.0f), const glm::vec2& t2 = glm::vec2(1.0f));

private:
    std::vector<DrawCall> mDrawCalls;
    std::vector<Vertex> mVertexBuffer;
    std::vector<uint16_t> mIndexBuffer;
    std::vector<glm::mat4> mMatrixStack;
    std::vector<glm::vec4> mColorStack;
    bool mInPrimitive = false;

    Canvas(const Canvas&) = delete;
    Canvas& operator=(const Canvas&) = delete;
};
