#include "GLES2Texture.h"
#include "src/engine/utility/StbImage.h"
#include <cstdio>
#include <cassert>

GLES2Texture::GLES2Texture()
{
    glGenTextures(1, &mHandle);
}

GLES2Texture::~GLES2Texture()
{
    glDeleteTextures(1, &mHandle);
}

void GLES2Texture::bind(GLenum target) const
{
    glBindTexture(target, mHandle);
}

void GLES2Texture::load(const std::string& file)
{
    bind(GL_TEXTURE_2D);

    bool mipmap = false;
    bool repeatX = false;
    bool repeatY = false;

    FILE* f = fopen((file + ".options").c_str(), "rb");
    if (f) {
        char buf[256];
        size_t bytesRead = fread(buf, 1, sizeof(buf), f);
        for (size_t i = 0; i < bytesRead; i++) {
            if (buf[i] == 'M')
                mipmap = true;
            else if (buf[i] == 'X')
                repeatX = true;
            else if (buf[i] == 'Y')
                repeatY = true;
        }
        fclose(f);
    }

    int w = 0, h = 0, comp = 0;
    auto pixels = stbi_load(file.c_str(), &w, &h, &comp, 0);
    if (!pixels)
        return;

    GLenum format, type;
    GLint internalFormat;
    switch (comp) {
        case 1:
            format = GL_LUMINANCE;
            internalFormat = GL_LUMINANCE;
            type = GL_UNSIGNED_BYTE;
            break;

        case 2:
            format = GL_LUMINANCE_ALPHA;
            internalFormat = GL_LUMINANCE_ALPHA;
            type = GL_UNSIGNED_BYTE;
            break;

        case 3:
            format = GL_RGB;
            internalFormat = GL_RGB;
            type = GL_UNSIGNED_BYTE;
            break;

        case 4:
            format = GL_RGBA;
            internalFormat = GL_RGBA;
            type = GL_UNSIGNED_BYTE;
            break;

        default:
            assert(false);
            return;
    }

    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexImage2D(GL_TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, pixels);

    stbi_image_free(pixels);

    if (mipmap)
        glGenerateMipmap(GL_TEXTURE_2D);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, (mipmap ? GL_LINEAR_MIPMAP_LINEAR : GL_LINEAR));
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, (repeatX ? GL_REPEAT : GL_CLAMP_TO_EDGE));
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, (repeatY ? GL_REPEAT : GL_CLAMP_TO_EDGE));
}
