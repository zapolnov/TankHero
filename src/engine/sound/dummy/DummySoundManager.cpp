#include "DummySoundManager.h"

DummySoundManager::DummySoundManager(Engine* engine)
    : SoundManager(engine)
{
}

DummySoundManager::~DummySoundManager()
{
}

void DummySoundManager::loadSound(uint16_t)
{
}

void DummySoundManager::unloadAllSounds()
{
}

void DummySoundManager::setListenerPosition(const glm::vec3&)
{
}

void DummySoundManager::setListenerOrientation(const glm::vec3&, const glm::vec3&)
{
}

void DummySoundManager::play(uint16_t, bool)
{
}

void DummySoundManager::play(const glm::vec3&, uint16_t, bool)
{
}

SoundManager* SoundManager::create(Engine* engine)
{
    return new DummySoundManager(engine);
}
