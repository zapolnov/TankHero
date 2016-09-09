#include "OpenALSoundManager.h"
#include <cassert>

OpenALSoundManager::OpenALSoundManager(Engine* engine)
    : SoundManager(engine)
    , mDevice(nullptr)
    , mContext(nullptr)
{
    mDevice = alcOpenDevice(nullptr);
    if (!mDevice)
        return;

    mContext = alcCreateContext(mDevice, nullptr);
    if (!mContext)
        return;

    alcMakeContextCurrent(mContext);
}

OpenALSoundManager::~OpenALSoundManager()
{
    if (mContext) {
        alcMakeContextCurrent(mContext);
        for (ALuint& source : mAllSources)
            alDeleteSources(1, &source);
        alcDestroyContext(mContext);
    }

    if (mDevice)
        alcCloseDevice(mDevice);
}

void OpenALSoundManager::loadSound(uint16_t sound)
{
    if (sound >= mSounds.size())
        mSounds.resize(sound + 1);

    if (!mSounds[sound]) {
        assert(mSoundNames.size() > sound);
        mSounds[sound].reset(new OpenALSound(mContext));
        mSounds[sound]->load(mSoundNames[sound]);
    }
}

void OpenALSoundManager::unloadAllSounds()
{
    if (mContext) {
        alcMakeContextCurrent(mContext);
        for (auto source : mAllSources)
            alSourceStop(source);
    }

    mSounds.clear();
}

void OpenALSoundManager::play(uint16_t sound, bool looping)
{
    if (!mContext || sound == 0 || sound >= mSounds.size() || !mSounds[sound])
        return;

    alcMakeContextCurrent(mContext);

    bool found = false;
    ALuint source = 0;
    for (auto it : mAllSources) {
        ALint state = 0;
        alGetSourcei(it, AL_SOURCE_STATE, &state);
        if (state != AL_PLAYING) {
            found = true;
            source = it;
            alSourceStop(source);
            break;
        }
    }

    if (!found) {
        alGenSources(1, &source);
        mAllSources.push_back(source);
    }

    mSounds[sound]->play(source, looping);
}

SoundManager* SoundManager::create(Engine* engine)
{
    return new OpenALSoundManager(engine);
}
