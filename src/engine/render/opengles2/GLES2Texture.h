
#pragma once
#include "OpenGL.h"

class GLES2Texture
{
public:
    GLES2Texture();
    ~GLES2Texture();

    void bind(GLenum target) const;

    void load(const std::string& file);

private:
    GLuint mHandle;

    GLES2Texture(const GLES2Texture&) = delete;
    GLES2Texture& operator=(const GLES2Texture&) = delete;
};
