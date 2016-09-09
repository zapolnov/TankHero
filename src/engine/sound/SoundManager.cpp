#include "SoundManager.h"
#include <cassert>

SoundManager::SoundManager(Engine* engine)
    : mEngine(engine)
{
    mSoundNames.emplace_back(std::string());
    mSoundIds.emplace(std::string(), 0);
}

SoundManager::~SoundManager()
{
}

uint16_t SoundManager::soundNameId(const std::string& name)
{
    auto it = mSoundIds.find(name);
    if (it != mSoundIds.end())
        return it->second;

    assert(mSoundNames.size() < 65536);
    auto id = uint16_t(mSoundNames.size());
    mSoundNames.emplace_back(name);
    mSoundIds.emplace(name, id);

    return id;
}

const std::string& SoundManager::soundName(uint16_t id) const
{
    assert(id < mSoundNames.size());
    return mSoundNames[id];
}
