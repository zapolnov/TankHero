#include <cstdio>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <memory>
#include <algorithm>
#include "src/engine/utility/StbImage.h"

#define STB_IMAGE_WRITE_IMPLEMENTATION
#define STB_IMAGE_WRITE_STATIC
#include "stb/src/stb_image_write.h"

#include "src/engine/utility/StbImage.cpp"

int main(int argc, char** argv)
{
    const char* outputFile = nullptr;
    std::vector<const char*> inputFiles;
    int outWidth = 512;
    int outHeight = 512;

    for (int i = 1; i < argc; i++) {
        if (argv[i][0] != '-')
            inputFiles.emplace_back(argv[i]);
        else {
            if (!std::strcmp(argv[i], "-w")) {
                if (i == argc - 1) {
                    fprintf(stderr, "missing value after \"%s\".\n", argv[i]);
                    return 1;
                }
                outWidth = std::atoi(argv[++i]);
            } else if (!std::strcmp(argv[i], "-h")) {
                if (i == argc - 1) {
                    fprintf(stderr, "missing value after \"%s\".\n", argv[i]);
                    return 1;
                }
                outHeight = std::atoi(argv[++i]);
            } else if (!std::strcmp(argv[i], "-o")) {
                if (i == argc - 1) {
                    fprintf(stderr, "missing value after \"%s\".\n", argv[i]);
                    return 1;
                }
                outputFile = argv[++i];
            } else {
                fprintf(stderr, "unknown command line option \"%s\".\n", argv[i]);
                return 1;
            }
        }
    }

    if (inputFiles.empty()) {
        fprintf(stderr, "missing input files on the command line.\n");
        return 1;
    }
    if (!outputFile) {
        fprintf(stderr, "missing output file on the command line.\n");
        return 1;
    }

    struct Pixel { uint8_t r, g, b, a; };
    std::unique_ptr<Pixel[]> output;

    output.reset(new Pixel[outWidth * outHeight]);
    memset(output.get(), 0, outWidth * outHeight);

    int outX = 0;
    int outY = 0;
    int nextY = 0;

    for (const auto& inputFile : inputFiles) {
        int w = 0, h = 0;
        auto pixels = stbi_load(inputFile, &w, &h, nullptr, 4);
        if (!pixels) {
            fprintf(stderr, "unable to read file \"%s\": %s.\n", inputFile, stbi_failure_reason());
            return 1;
        }

        if (outX + w > outWidth) {
            outX = 0;
            outY = nextY;
        }

        if (outX + w > outWidth || outY + h > outHeight) {
            stbi_image_free(pixels);
            fprintf(stderr, "image \"%s\" does not fit into the atlas.\n", inputFile);
            return 1;
        }

        nextY = std::max(nextY, outY + h);

        for (int y = 0; y < h; y++) {
            const uint8_t* src = reinterpret_cast<const uint8_t*>(pixels) + y * w * 4;
            const uint8_t* srcEnd = src + w * 4;
            Pixel* dst = &output[(outY + y) * outWidth + outX];
            while (src < srcEnd) {
                dst->r = *src++;
                dst->g = *src++;
                dst->b = *src++;
                dst->a = *src++;
                ++dst;
            }
        }

        stbi_image_free(pixels);

        outX += w;
    }

    if (!stbi_write_png(outputFile, outWidth, outHeight, 4, output.get(), outWidth * 4)) {
        fprintf(stderr, "unable to write file \"%s\".\n", outputFile);
        return 1;
    }

    return 0;
}
