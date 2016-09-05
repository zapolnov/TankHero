#include "VertexData.h"

static size_t vectorSize(const VertexFormat& format, size_t count)
{
    return (count * format.stride() + sizeof(void*) - 1) / sizeof(void*);
}

VertexData::VertexData(const VertexFormat& format, size_t count)
    : mData(vectorSize(format, count))
    , mFormat(format)
{
}

VertexData::~VertexData()
{
}

void VertexData::setVertexCount(size_t count)
{
    mData.resize(vectorSize(mFormat, count));
}
