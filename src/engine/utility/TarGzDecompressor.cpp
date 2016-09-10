#include "TarGzDecompressor.h"
#include "stb/src/stb_image.h"
#include <cstring>

TarGzDecompressor::TarGzDecompressor(const void* data, size_t size)
    : mData(reinterpret_cast<const uint8_t*>(data))
    , mDataSize(size)
    , mTarPosition(nullptr)
    , mTarEnd(nullptr)
{
}

bool TarGzDecompressor::init()
{
    ///////////////////////////////////////////////////////////////////////////
    // Parse GZIP header

    const uint8_t* p = mData;
    size_t bytesLeft = mDataSize;

    // +---+---+---+---+---+---+---+---+---+---+
    // |ID1|ID2|CM |FLG|     MTIME     |XFL|OS |
    // +---+---+---+---+---+---+---+---+---+---+

    if (bytesLeft < 10)
        return false;
    bytesLeft -= 10;

    if (*p++ != 0x1f)               // ID1
        return false;
    if (*p++ != 0x8b)               // ID2
        return false;
    if (*p++ != 8)                  // CM - compression method (8 = deflate)
        return false;

    uint8_t flags = *p++;           // FLG
    if ((flags & 0xE0) != 0)        // reserved bits
        return false;

    p += 4;                         // MTIME
    ++p;                            // XFL
    ++p;                            // OS

    // (if FLG.FEXTRA set)
    // +---+---+=================================+
    // | XLEN  |...XLEN bytes of "extra field"...|
    // +---+---+=================================+

    if (flags & 0x04) {
        if (bytesLeft < 2)
            return false;
        bytesLeft -= 2;

        size_t length =             // XLEN
            (size_t(p[0])     ) |
            (size_t(p[1]) << 8);

        if (bytesLeft < length)
            return false;
        bytesLeft -= length;

        p += length;                // skip extra field
    }

    // (if FLG.FNAME set)
    // +=========================================+
    // |...original file name, zero-terminated...|
    // +=========================================+

    if (flags & 0x08) {
        do {
            if (bytesLeft < 1)
                return false;
            bytesLeft -= 1;
        } while (*p++ != 0);
    }

    // (if FLG.FCOMMENT set)
    // +===================================+
    // |...file comment, zero-terminated...|
    // +===================================+

    if (flags & 0x10) {
        do {
            if (bytesLeft < 1)
                return false;
            bytesLeft -= 1;
        } while (*p++ != 0);
    }

    // (if FLG.FHCRC set)
    // +---+---+
    // | CRC16 |
    // +---+---+

    if (flags & 0x02) {
        if (bytesLeft < 2)
            return false;
        bytesLeft -= 2;
        p += 2;
    }

    // At the end:
    // +---+---+---+---+---+---+---+---+
    // |     CRC32     |     ISIZE     |
    // +---+---+---+---+---+---+---+---+

    if (bytesLeft < 8)
        return false;
    bytesLeft -= 8;

    mTarSize =
        (size_t(p[bytesLeft + 4])      ) |
        (size_t(p[bytesLeft + 5]) << 8 ) |
        (size_t(p[bytesLeft + 6]) << 16) |
        (size_t(p[bytesLeft + 7]) << 24);

    ///////////////////////////////////////////////////////////////////////////
    // Decompress

    mTarData.reset(new uint8_t[mTarSize]);
    int r = stbi_zlib_decode_noheader_buffer(reinterpret_cast<char*>(mTarData.get()), int(mTarSize),
        reinterpret_cast<const char*>(p), int(bytesLeft));
    if (r < 0 || r != int(mTarSize))
        return false;

    mTarPosition = mTarData.get();
    mTarEnd = mTarPosition + mTarSize;

    return true;
}

bool TarGzDecompressor::next()
{
    mCurrentFileName.clear();
    mCurrentFileSize = 0;
    mCurrentFileData = nullptr;

    if (!mTarData) {
        if (!init())
            return false;
    }

    // At the end of the TAR archive file there are two 512-byte blocks filled with zeros as an end-of-file marker
    if (mTarEnd - mTarPosition <= 1024)
        return false;

    // Validate magic signature
    if (mTarPosition[257] != 'u' ||
        mTarPosition[258] != 's' ||
        mTarPosition[259] != 't' ||
        mTarPosition[260] != 'a' ||
        mTarPosition[261] != 'r' ||
        mTarPosition[262] != 0)
        return false;

    // Validate version
    if (mTarPosition[263] != '0' ||
        mTarPosition[264] != '0')
        return false;

    // Read size
    if (mTarPosition[124] < '0' || mTarPosition[124] > '3') return false;
    if (mTarPosition[125] < '0' || mTarPosition[125] > '7') return false;
    if (mTarPosition[126] < '0' || mTarPosition[126] > '7') return false;
    if (mTarPosition[127] < '0' || mTarPosition[127] > '7') return false;
    if (mTarPosition[128] < '0' || mTarPosition[128] > '7') return false;
    if (mTarPosition[129] < '0' || mTarPosition[129] > '7') return false;
    if (mTarPosition[130] < '0' || mTarPosition[130] > '7') return false;
    if (mTarPosition[131] < '0' || mTarPosition[131] > '7') return false;
    if (mTarPosition[132] < '0' || mTarPosition[132] > '7') return false;
    if (mTarPosition[133] < '0' || mTarPosition[133] > '7') return false;
    if (mTarPosition[134] < '0' || mTarPosition[134] > '7') return false;
    size_t fileSize =
        (size_t(mTarPosition[124] - '0') << 30) +
        (size_t(mTarPosition[125] - '0') << 27) +
        (size_t(mTarPosition[126] - '0') << 24) +
        (size_t(mTarPosition[127] - '0') << 21) +
        (size_t(mTarPosition[128] - '0') << 18) +
        (size_t(mTarPosition[129] - '0') << 15) +
        (size_t(mTarPosition[130] - '0') << 12) +
        (size_t(mTarPosition[131] - '0') <<  9) +
        (size_t(mTarPosition[132] - '0') <<  6) +
        (size_t(mTarPosition[133] - '0') <<  3) +
        (size_t(mTarPosition[134] - '0'));

    // Read file name
    const char* name = reinterpret_cast<const char*>(mTarPosition);
    if (name[99] != 0)
        return false;
    const char* nameStart = std::strrchr(name, '/');
    name = (nameStart ? nameStart + 1 : name);

    // Get pointer to file data
    mTarPosition += 512;
    if (mTarPosition + fileSize > mTarEnd)
        return false;

    mCurrentFileName = name;
    mCurrentFileData = mTarPosition;
    mCurrentFileSize = fileSize;

    // Advance to the next file
    mTarPosition += (fileSize + 0x1FF) & ~size_t(0x1FF);

    return true;
}
