
#pragma once
#include "OpenGL.h"
#include "GLES2UberShader.h"
#include "src/engine/mesh/VertexFormat.h"
#include <vector>

class GLES2Mesh
{
public:
    GLES2Mesh();
    ~GLES2Mesh();

    void load(const std::string& file);

    size_t elementCount() const { return mElements.size(); }

    void renderElement(size_t index, const GLES2UberShader& shader) const;

private:
    struct Element
    {
        size_t bufferOffset;
        size_t firstIndex;
        size_t indexCount;
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
