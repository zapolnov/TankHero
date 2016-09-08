#include "Obstacle.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"

Obstacle::Obstacle(Engine* engine, uint16_t mesh)
    : mEngine(engine)
    , mMesh(mesh)
{
}

const OBB2D& Obstacle::boundingBox()
{
    if (!mBoundingBoxValid) {
        auto min = mEngine->renderer()->meshBBoxMin(mMesh);
        auto max = mEngine->renderer()->meshBBoxMax(mMesh);

        mBoundingBox.p[0] = glm::vec2(worldMatrix() * glm::vec4(min.x, min.y, min.z, 1.0f));
        mBoundingBox.p[1] = glm::vec2(worldMatrix() * glm::vec4(max.x, min.y, min.z, 1.0f));
        mBoundingBox.p[2] = glm::vec2(worldMatrix() * glm::vec4(max.x, min.y, max.z, 1.0f));
        mBoundingBox.p[3] = glm::vec2(worldMatrix() * glm::vec4(min.x, min.y, max.z, 1.0f));
    }
    return mBoundingBox;
}

void Obstacle::draw(Renderer* renderer)
{
    /*
    Canvas* canvas = renderer->begin2D();
    canvas->beginPrimitive(Canvas::Lines);
    const auto& b = boundingBox();
    canvas->emitVertex(b.p[0], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[1], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[1], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[2], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[2], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[3], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[3], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->emitVertex(b.p[0], glm::vec4(1.0f, 0.0f, 0.0f, 1.0f));
    canvas->endPrimitive();
    renderer->end2D();
    */

    renderer->drawMesh(worldMatrix(), mMesh);
}
