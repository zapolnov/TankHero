
#pragma once
#include "VertexFormat.h"
#include <cstdint>
#include <vector>

class VertexData
{
public:
    explicit VertexData(const VertexFormat& format, size_t count = 0);
    ~VertexData();

    const VertexFormat& format() const { return mFormat; }

    size_t sizeInBytes() const { return mData.size() * sizeof(void*); }
    size_t vertexCount() const { return sizeInBytes() / mFormat.stride(); }
    void setVertexCount(size_t count);

    void* data() { return mData.data(); }
    const void* data() const { return mData.data(); }

private:
    std::vector<void*> mData;
    VertexFormat mFormat;
};
