
#pragma once
#include "OpenGL.h"

class GLES2Buffer
{
public:
    GLES2Buffer();
    ~GLES2Buffer();

    void bind(GLenum target) const;

private:
    GLuint mHandle;

    GLES2Buffer(const GLES2Buffer&) = delete;
    GLES2Buffer& operator=(const GLES2Buffer&) = delete;
};
