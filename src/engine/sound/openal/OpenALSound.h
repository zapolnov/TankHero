
#pragma once
#include "OpenAL.h"
#include <glm/glm.hpp>
#include <string>

class OpenALSound
{
public:
    explicit OpenALSound(ALCcontext* context);
    ~OpenALSound();

    void load(const std::string& file);

    void play(ALuint source, bool looping);
    void play(ALuint source, const glm::vec3& position, bool looping);

private:
    ALCcontext* mContext;
    ALuint mBuffer;

    OpenALSound(const OpenALSound&) = delete;
    OpenALSound& operator=(const OpenALSound&) = delete;
};
