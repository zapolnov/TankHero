#include "MedKit.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

MedKit::MedKit(Engine* engine, uint16_t mesh)
    : Collidable(engine)
    , mAngle(0.0f)
    , mMesh(mesh)
{
    setScale(0.3f);
}

std::pair<glm::vec3, glm::vec3> MedKit::localAABox() const
{
    auto min = mEngine->renderer()->meshBBoxMin(mMesh);
    auto max = mEngine->renderer()->meshBBoxMax(mMesh);
    return std::make_pair(min, max);
}

void MedKit::update(float time)
{
    mAngle += glm::radians(90.0f) * time;
    while (mAngle > glm::radians(360.0f))
        mAngle -= glm::radians(360.0f);
}

void MedKit::draw(Renderer* renderer)
{
    renderer->drawMesh(worldMatrix(), mMesh);
    setRotation(glm::radians(90.0f), mAngle, 0.0f);
}
