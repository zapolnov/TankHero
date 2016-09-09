#include "GLES2Mesh.h"
#include "GLES2UberShader.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/mesh/MeshFile.h"
#include <sys/types.h>
#include <sys/stat.h>
#include <cstdio>

GLES2Mesh::GLES2Mesh()
{
    glGenBuffers(2, mBuffers);
}

GLES2Mesh::~GLES2Mesh()
{
    glDeleteBuffers(2, mBuffers);
}

void GLES2Mesh::load(Renderer* renderer, const std::string& file)
{
    struct stat st;
    if (stat(file.c_str(), &st) < 0)
        return;

    std::unique_ptr<uint8_t[]> data;
    data.reset(new uint8_t[st.st_size]);

    FILE* f = fopen(file.c_str(), "rb");
    if (!f)
        return;

    size_t bytesRead = fread(data.get(), 1, st.st_size, f);
    fclose(f);

    if (bytesRead < st.st_size)
        return;

    auto header = reinterpret_cast<MeshFile::Header*>(data.get());
    if (header->magic != MeshFile::Magic)
        return;

    mBBoxMin = header->bboxMin;
    mBBoxMax = header->bboxMax;
    mSphereCenter = header->boundingSphereCenter;
    mSphereRadius = header->boundingSphereRadius;

    size_t stringTableAlignedSize = header->stringTableSize;
    if ((stringTableAlignedSize & 3) != 0)
        stringTableAlignedSize += 8 - (stringTableAlignedSize & 3);

    const char* stringTable = reinterpret_cast<const char*>(header) + sizeof(MeshFile::Header);
    const MeshFile::Element* elementList = reinterpret_cast<const MeshFile::Element*>(stringTable + stringTableAlignedSize);
    const char* vertexData = reinterpret_cast<const char*>(elementList) + header->elementCount * sizeof(MeshFile::Element);
    const char* indexData = vertexData + header->vertexBufferSize;

    mVertexFormat.reset(new VertexFormat(header->vertexFormat));

    glBindBuffer(GL_ARRAY_BUFFER, mBuffers[0]);
    glBufferData(GL_ARRAY_BUFFER, header->vertexBufferSize, vertexData, GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mBuffers[1]);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, header->indexBufferSize, indexData, GL_STATIC_DRAW);

    mElements.reserve(header->elementCount);
    for (size_t i = 0; i < header->elementCount; i++) {
        Element element;
        element.bufferOffset = elementList[i].bufferOffset;
        element.firstIndex = elementList[i].firstIndex;
        element.indexCount = elementList[i].indexCount;
        element.material = elementList[i].material;
        element.material.diffuseMap = renderer->textureNameId(&stringTable[element.material.diffuseMap]);
        element.material.normalMap = renderer->textureNameId(&stringTable[element.material.normalMap]);
        element.material.specularMap = renderer->textureNameId(&stringTable[element.material.specularMap]);
        mElements.emplace_back(std::move(element));
    }
}

void GLES2Mesh::enableAttributes(const GLES2UberShader& shader, const VertexFormat& format, size_t bufferOffset)
{
    if (shader.positionAttribute() >= 0) {
        if (!format.hasPosition()) {
            glVertexAttrib4f(shader.positionAttribute(), 0.0f, 0.0f, 0.0f, 0.0f);
        } else {
            glVertexAttribPointer(shader.positionAttribute(), 3, GL_FLOAT, GL_FALSE, GLsizei(format.stride()),
                reinterpret_cast<void*>(format.positionOffset() + bufferOffset * format.stride()));
            glEnableVertexAttribArray(shader.positionAttribute());
        }
    }

    if (shader.colorAttribute() >= 0) {
        if (!format.hasColor()) {
            glVertexAttrib4f(shader.colorAttribute(), 1.0f, 1.0f, 1.0f, 1.0f);
        } else {
            glVertexAttribPointer(shader.colorAttribute(), 4, GL_UNSIGNED_BYTE, GL_TRUE, GLsizei(format.stride()),
                reinterpret_cast<void*>(format.colorOffset() + bufferOffset * format.stride()));
            glEnableVertexAttribArray(shader.colorAttribute());
        }
    }

    if (shader.texCoord0Attribute() >= 0) {
        if (!format.hasTexCoord0()) {
            glVertexAttrib4f(shader.texCoord0Attribute(), 0.0f, 0.0f, 0.0f, 0.0f);
        } else {
            glVertexAttribPointer(shader.texCoord0Attribute(), 2, GL_FLOAT, GL_FALSE, GLsizei(format.stride()),
                reinterpret_cast<void*>(format.texCoord0Offset() + bufferOffset * format.stride()));
            glEnableVertexAttribArray(shader.texCoord0Attribute());
        }
    }

    if (shader.normalAttribute() >= 0) {
        if (!format.hasNormal()) {
            glVertexAttrib4f(shader.normalAttribute(), 0.0f, 1.0f, 0.0f, 0.0f);
        } else {
            glVertexAttribPointer(shader.normalAttribute(), 3, GL_FLOAT, GL_TRUE, GLsizei(format.stride()),
                reinterpret_cast<void*>(format.normalOffset() + bufferOffset * format.stride()));
            glEnableVertexAttribArray(shader.normalAttribute());
        }
    }

    if (shader.tangentAttribute() >= 0) {
        if (!format.hasTangent()) {
            glVertexAttrib4f(shader.tangentAttribute(), 1.0f, 0.0f, 0.0f, 0.0f);
        } else {
            glVertexAttribPointer(shader.tangentAttribute(), 3, GL_FLOAT, GL_TRUE, GLsizei(format.stride()),
                reinterpret_cast<void*>(format.tangentOffset() + bufferOffset * format.stride()));
            glEnableVertexAttribArray(shader.tangentAttribute());
        }
    }

    if (shader.bitangentAttribute() >= 0) {
        if (!format.hasBitangent()) {
            glVertexAttrib4f(shader.bitangentAttribute(), 1.0f, 0.0f, 0.0f, 0.0f);
        } else {
            glVertexAttribPointer(shader.bitangentAttribute(), 3, GL_FLOAT, GL_TRUE, GLsizei(format.stride()),
                reinterpret_cast<void*>(format.bitangentOffset() + bufferOffset * format.stride()));
            glEnableVertexAttribArray(shader.bitangentAttribute());
        }
    }
}

void GLES2Mesh::disableAttributes(const GLES2UberShader& shader, const VertexFormat& format)
{
    if (shader.bitangentAttribute() >= 0) {
        if (format.hasBitangent())
            glDisableVertexAttribArray(shader.bitangentAttribute());
    }
    if (shader.tangentAttribute() >= 0) {
        if (format.hasTangent())
            glDisableVertexAttribArray(shader.tangentAttribute());
    }
    if (shader.normalAttribute() >= 0) {
        if (format.hasNormal())
            glDisableVertexAttribArray(shader.normalAttribute());
    }
    if (shader.texCoord0Attribute() >= 0) {
        if (format.hasTexCoord0())
            glDisableVertexAttribArray(shader.texCoord0Attribute());
    }
    if (shader.colorAttribute() >= 0) {
        if (format.hasColor())
            glDisableVertexAttribArray(shader.colorAttribute());
    }
    if (shader.positionAttribute() >= 0) {
        if (format.hasPosition())
            glDisableVertexAttribArray(shader.positionAttribute());
    }
}

void GLES2Mesh::renderElement(size_t index, const GLES2UberShader& shader) const
{
    const auto& element = mElements[index];

    glBindBuffer(GL_ARRAY_BUFFER, mBuffers[0]);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mBuffers[1]);

    enableAttributes(shader, *mVertexFormat);

    if (shader.ambientColorUniform() >= 0) {
        const auto& c = element.material.ambientColor;
        glUniform3f(shader.ambientColorUniform(), c.r, c.g, c.b);
    }

    if (shader.diffuseColorUniform() >= 0) {
        const auto& c = element.material.diffuseColor;
        glUniform3f(shader.diffuseColorUniform(), c.r, c.g, c.b);
    }

    if (shader.specularColorUniform() >= 0) {
        const auto& c = element.material.specularColor;
        glUniform3f(shader.specularColorUniform(), c.r, c.g, c.b);
    }

    if (shader.opacityUniform() >= 0)
        glUniform1f(shader.opacityUniform(), element.material.opacity);

    if (shader.shininessUniform() >= 0)
        glUniform1f(shader.shininessUniform(), element.material.shininess);

    glEnable(GL_DEPTH_TEST);

    if (element.material.flags & MaterialTwoSided)
        glDisable(GL_CULL_FACE);
    else {
        glEnable(GL_CULL_FACE);
        glCullFace(GL_BACK);
    }

    switch (element.material.blendMode) {
        case MaterialOpaque:
            glDisable(GL_BLEND);
            break;
        case MaterialTransparent:
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            break;
        case MaterialAdditive:
            glEnable(GL_BLEND);
            glBlendFunc(GL_ONE, GL_ONE);
            break;
    }

    glDrawElements(GL_TRIANGLES, GLsizei(element.indexCount), GL_UNSIGNED_SHORT,
        reinterpret_cast<void*>(element.firstIndex * sizeof(uint16_t)));

    disableAttributes(shader, *mVertexFormat);
}
