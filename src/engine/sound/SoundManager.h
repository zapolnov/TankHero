
#pragma once
#include <cstdint>
#include <unordered_map>
#include <vector>
#include <string>

class Engine;

class SoundManager
{
public:
    static SoundManager* create(Engine* engine);
    virtual ~SoundManager();

    uint16_t soundNameId(const std::string& name);
    const std::string& soundName(uint16_t id) const;

    virtual void loadSound(uint16_t sound) = 0;
    virtual void unloadAllSounds() = 0;

    virtual void play(uint16_t id, bool looping = false) = 0;

protected:
    Engine* mEngine;
    std::unordered_map<std::string, uint16_t> mSoundIds;
    std::vector<std::string> mSoundNames;

    explicit SoundManager(Engine* engine);

    SoundManager(const SoundManager&) = delete;
    SoundManager& operator=(const SoundManager&) = delete;
};
