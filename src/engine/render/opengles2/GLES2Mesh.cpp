#include "GLES2Mesh.h"
#include "GLES2UberShader.h"
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

void GLES2Mesh::load(const std::string& file)
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
        mElements.emplace_back(std::move(element));
    }
}

void GLES2Mesh::renderElement(size_t index, const GLES2UberShader& shader) const
{
    const auto& element = mElements[index];

    glBindBuffer(GL_ARRAY_BUFFER, mBuffers[0]);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mBuffers[1]);

    if (shader.positionAttribute() >= 0) {
        if (!mVertexFormat->hasPosition()) {
            glVertexAttrib4f(shader.positionAttribute(), 0.0f, 0.0f, 0.0f, 0.0f);
        } else {
            glVertexAttribPointer(shader.positionAttribute(), 3, GL_FLOAT, GL_FALSE, mVertexFormat->stride(),
                reinterpret_cast<void*>(mVertexFormat->positionOffset() + element.bufferOffset * mVertexFormat->stride()));
            glEnableVertexAttribArray(shader.positionAttribute());
        }
    }

    if (shader.colorAttribute() >= 0) {
        if (!mVertexFormat->hasColor()) {
            glVertexAttrib4f(shader.colorAttribute(), 1.0f, 1.0f, 1.0f, 1.0f);
        } else {
            glVertexAttribPointer(shader.colorAttribute(), 4, GL_UNSIGNED_BYTE, GL_TRUE, mVertexFormat->stride(),
                reinterpret_cast<void*>(mVertexFormat->colorOffset() + element.bufferOffset * mVertexFormat->stride()));
            glEnableVertexAttribArray(shader.colorAttribute());
        }
    }

    glDrawElements(GL_TRIANGLES, element.indexCount, GL_UNSIGNED_SHORT,
        reinterpret_cast<void*>(element.firstIndex * sizeof(uint16_t)));

    if (shader.colorAttribute() >= 0) {
        if (mVertexFormat->hasColor())
            glDisableVertexAttribArray(shader.colorAttribute());
    }
    if (shader.positionAttribute() >= 0) {
        if (mVertexFormat->hasPosition())
            glDisableVertexAttribArray(shader.positionAttribute());
    }
}
