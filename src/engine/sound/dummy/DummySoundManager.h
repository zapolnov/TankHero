
#pragma once
#include "src/engine/sound/SoundManager.h"

class DummySoundManager : public SoundManager
{
public:
    explicit DummySoundManager(Engine* engine);
    ~DummySoundManager();

    void loadSound(uint16_t sound) override;
    void unloadAllSounds() override;

    void setListenerPosition(const glm::vec3& position) override;
    void setListenerOrientation(const glm::vec3& forward, const glm::vec3& up) override;

    void play(uint16_t id, bool looping) override;
    void play(const glm::vec3& position, uint16_t id, bool looping) override;
};
