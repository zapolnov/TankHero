#include "OpenALSound.h"
#include "src/engine/utility/StbVorbis.h"
#include <cassert>

OpenALSound::OpenALSound(ALCcontext* context)
    : mContext(context)
    , mBuffer(0)
{
    if (mContext) {
        alcMakeContextCurrent(mContext);
        alGenBuffers(1, &mBuffer);
    }
}

OpenALSound::~OpenALSound()
{
    if (mContext) {
        alcMakeContextCurrent(mContext);
        alDeleteBuffers(1, &mBuffer);
    }
}

void OpenALSound::load(const std::string& file)
{
    if (!mContext)
        return;

    short* buffer = nullptr;
    int channels = 0;
    int sampleRate = 0;
    int nSamples = stb_vorbis_decode_filename(file.c_str(), &channels, &sampleRate, &buffer);
    assert(nSamples > 0);
    if (nSamples <= 0) {
        if (buffer)
            free(buffer);
        return;
    }

    assert(channels == 1 || channels == 2);
    if (channels != 1 && channels != 2) {
        free(buffer);
        return;
    }

    ALenum format = (channels == 1 ? AL_FORMAT_MONO16 : AL_FORMAT_STEREO16);
    size_t bufferSize = size_t(nSamples) * size_t(channels) * sizeof(short);

    alcMakeContextCurrent(mContext);
    alBufferData(mBuffer, format, buffer, bufferSize, sampleRate);

    free(buffer);
}

void OpenALSound::play(ALuint source, bool looping)
{
    if (!mContext)
        return;

    alcMakeContextCurrent(mContext);
    alSourcef(source, AL_PITCH, 1.0f);
    alSourcef(source, AL_GAIN, 1.0f);
    alSourcei(source, AL_BUFFER, mBuffer);
    alSourcei(source, AL_LOOPING, (looping ? AL_TRUE : AL_FALSE));
    alSourcePlay(source);
}