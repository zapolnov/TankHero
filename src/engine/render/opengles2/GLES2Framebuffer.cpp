#include "GLES2Framebuffer.h"

GLES2Framebuffer::GLES2Framebuffer()
    : mHandle(0)
{
    glGenFramebuffers(1, &mHandle);
}

GLES2Framebuffer::~GLES2Framebuffer()
{
    glDeleteFramebuffers(1, &mHandle);
}
