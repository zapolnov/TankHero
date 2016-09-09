
#pragma once
#include "src/engine/sound/SoundManager.h"

class DummySoundManager : public SoundManager
{
public:
    explicit DummySoundManager(Engine* engine);
    ~DummySoundManager();

    void loadSound(uint16_t sound) override;
    void unloadAllSounds() override;
};
