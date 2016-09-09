
#pragma once
#include "OpenGL.h"
#include "GLES2UberShader.h"
#include "src/engine/mesh/MaterialDesc.h"
#include "src/engine/mesh/VertexFormat.h"
#include <vector>
#include <memory>

class Renderer;

class GLES2Mesh
{
public:
    GLES2Mesh();
    ~GLES2Mesh();

    void load(Renderer* renderer, const std::string& file);

    const VertexFormat& vertexFormat() const { return *mVertexFormat; }

    const glm::vec3& bboxMin() const { return mBBoxMin; }
    const glm::vec3& bboxMax() const { return mBBoxMax; }
    const glm::vec3& sphereCenter() const { return mSphereCenter; }
    float sphereRadius() const { return mSphereRadius; }

    size_t elementCount() const { return mElements.size(); }
    const MaterialDesc& elementMaterial(size_t index) const { return mElements[index].material; }

    static void enableAttributes(const GLES2UberShader& shader, const VertexFormat& format, size_t bufferOffset = 0);
    static void disableAttributes(const GLES2UberShader& shader, const VertexFormat& format);

    void renderElement(size_t index, const GLES2UberShader& shader) const;

private:
    struct Element
    {
        size_t bufferOffset;
        size_t firstIndex;
        size_t indexCount;
        MaterialDesc material;
    };

    GLuint mBuffers[2];
    glm::vec3 mBBoxMin;
    glm::vec3 mBBoxMax;
    glm::vec3 mSphereCenter;
    float mSphereRadius;
    std::unique_ptr<VertexFormat> mVertexFormat;
    std::vector<Element> mElements;

    GLES2Mesh(const GLES2Mesh&) = delete;
    GLES2Mesh& operator=(const GLES2Mesh&) = delete;
};
