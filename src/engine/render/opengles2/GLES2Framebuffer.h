
#pragma once
#include "OpenGL.h"

class GLES2Framebuffer
{
public:
    GLES2Framebuffer();
    ~GLES2Framebuffer();

    GLuint handle() const { return mHandle; }

private:
    GLuint mHandle;

    GLES2Framebuffer(const GLES2Framebuffer&) = delete;
    GLES2Framebuffer& operator=(const GLES2Framebuffer&) = delete;
};
