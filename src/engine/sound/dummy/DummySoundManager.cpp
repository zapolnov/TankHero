#include "DummySoundManager.h"

DummySoundManager::DummySoundManager(Engine* engine)
    : SoundManager(engine)
{
}

DummySoundManager::~DummySoundManager()
{
}

void DummySoundManager::loadSound(uint16_t texture)
{
}

void DummySoundManager::unloadAllSounds()
{
}

SoundManager* SoundManager::create(Engine* engine)
{
    return new DummySoundManager(engine);
}
