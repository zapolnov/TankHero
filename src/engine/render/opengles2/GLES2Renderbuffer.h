
#pragma once
#include "OpenGL.h"

class GLES2Renderbuffer
{
public:
    GLES2Renderbuffer();
    ~GLES2Renderbuffer();

    GLuint handle() const { return mHandle; }

private:
    GLuint mHandle;

    GLES2Renderbuffer(const GLES2Renderbuffer&) = delete;
    GLES2Renderbuffer& operator=(const GLES2Renderbuffer&) = delete;
};
