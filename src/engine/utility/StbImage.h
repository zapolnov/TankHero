
#pragma once

#define STBI_NO_STDIO

//#define STBI_NEON
#define STBI_MINGW_ENABLE_SSE2
#define STBI_SUPPORT_ZLIB

#define STBI_NO_HDR
#define STBI_NO_LINEAR
#define STBI_NO_BMP
#define STBI_NO_PSD
#define STBI_NO_TGA
#define STBI_NO_GIF
#define STBI_NO_HDR
#define STBI_NO_PIC
#define STBI_NO_PNM

#define STBI_ONLY_JPEG
#define STBI_ONLY_PNG

#include "stb/src/stb_image.h"
