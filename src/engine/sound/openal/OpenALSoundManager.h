
#pragma once
#include "OpenAL.h"
#include "OpenALSound.h"
#include "src/engine/sound/SoundManager.h"
#include <vector>
#include <memory>

class OpenALSoundManager : public SoundManager
{
public:
    explicit OpenALSoundManager(Engine* engine);
    ~OpenALSoundManager();

    void loadSound(uint16_t sound) override;
    void unloadAllSounds() override;

    void play(uint16_t sound, bool looping = false) override;

private:
    ALCdevice* mDevice;
    ALCcontext* mContext;
    std::vector<ALuint> mAllSources;
    std::vector<std::unique_ptr<OpenALSound>> mSounds;
};
