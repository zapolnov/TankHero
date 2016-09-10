
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

    void setListenerPosition(const glm::vec3& position) override;
    void setListenerOrientation(const glm::vec3& forward, const glm::vec3& up) override;

    void play(uint16_t id, bool looping) override;
    void play(const glm::vec3& position, uint16_t id, bool looping) override;

private:
    ALCdevice* mDevice;
    ALCcontext* mContext;
    std::vector<ALuint> mAllSources;
    std::vector<std::unique_ptr<OpenALSound>> mSounds;
  #ifdef PLATFORM_EMSCRIPTEN
    glm::vec3 mListenerPosition;
  #endif

    ALuint allocSource();
};
