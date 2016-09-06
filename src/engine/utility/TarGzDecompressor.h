
#pragma once
#include <cstdint>
#include <memory>
#include <string>

class TarGzDecompressor
{
public:
    TarGzDecompressor(const void* data, size_t size);
    ~TarGzDecompressor() = default;

    bool init();
    bool next();

    const std::string& currentFileName() const { return mCurrentFileName; }
    const uint8_t* currentFileData() const { return mCurrentFileData; }
    size_t currentFileSize() const { return mCurrentFileSize; }

private:
    const uint8_t* mData;
    std::unique_ptr<uint8_t[]> mTarData;
    size_t mDataSize;
    size_t mTarSize;
    const uint8_t* mTarPosition;
    const uint8_t* mTarEnd;
    std::string mCurrentFileName;
    const uint8_t* mCurrentFileData;
    size_t mCurrentFileSize;
};
