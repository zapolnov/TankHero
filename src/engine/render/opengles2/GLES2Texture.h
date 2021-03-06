
#pragma once
#include "OpenGL.h"
#include <string>

class GLES2Texture
{
public:
    GLES2Texture();
    ~GLES2Texture();

    GLuint handle() const { return mHandle; }

    void bind(GLenum target) const;

    void load(const std::string& file);

private:
    GLuint mHandle;

    GLES2Texture(const GLES2Texture&) = delete;
    GLES2Texture& operator=(const GLES2Texture&) = delete;
};
