#include "GLES2Renderbuffer.h"

GLES2Renderbuffer::GLES2Renderbuffer()
    : mHandle(0)
{
    glGenRenderbuffers(1, &mHandle);
}

GLES2Renderbuffer::~GLES2Renderbuffer()
{
    glDeleteRenderbuffers(1, &mHandle);
}
