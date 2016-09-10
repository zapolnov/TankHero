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

void OpenALSoundManager::setListenerPosition(const glm::vec3& position)
{
  #ifdef PLATFORM_EMSCRIPTEN
    mListenerPosition = position;
  #endif
    alListenerfv(AL_POSITION, &position[0]);
}

void OpenALSoundManager::setListenerOrientation(const glm::vec3& forward, const glm::vec3& up)
{
    float v[6] = { forward.x, forward.y, forward.z, up.x, up.y, up.z };
    alListenerfv(AL_ORIENTATION, v);
}

void OpenALSoundManager::play(uint16_t sound, bool looping)
{
    if (!mContext || sound == 0 || sound >= mSounds.size() || !mSounds[sound])
        return;

    alcMakeContextCurrent(mContext);
    ALuint source = allocSource();
    mSounds[sound]->play(source, looping);
}

void OpenALSoundManager::play(const glm::vec3& position, uint16_t sound, bool looping)
{
    if (!mContext || sound == 0 || sound >= mSounds.size() || !mSounds[sound])
        return;

  #ifdef PLATFORM_EMSCRIPTEN
    auto distance = glm::length(position - mListenerPosition);
    if (distance > 20.0f)
        return;
  #endif

    alcMakeContextCurrent(mContext);
    ALuint source = allocSource();
    mSounds[sound]->play(source, position, looping);
}

ALuint OpenALSoundManager::allocSource()
{
    ALuint source = 0;
    for (auto it : mAllSources) {
        ALint state = 0;
        alGetSourcei(it, AL_SOURCE_STATE, &state);
        if (state != AL_PLAYING) {
            source = it;
            alSourceStop(source);
            return source;
        }
    }

    alGenSources(1, &source);
    mAllSources.push_back(source);
    return source;
}

SoundManager* SoundManager::create(Engine* engine)
{
    return new OpenALSoundManager(engine);
}
