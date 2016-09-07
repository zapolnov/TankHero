#include "GLES2Buffer.h"

GLES2Buffer::GLES2Buffer()
{
    glGenBuffers(1, &mHandle);
}

GLES2Buffer::~GLES2Buffer()
{
    glDeleteBuffers(1, &mHandle);
}

void GLES2Buffer::bind(GLenum target) const
{
    glBindBuffer(target, mHandle);
}
