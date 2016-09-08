#include "Collidable.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/render/Renderer.h"
#include "src/engine/Engine.h"
#include <cassert>

Collidable::Collidable(Engine* engine)
    : mEngine(engine)
    , mBoundingBoxValid(false)
{
}

const OBB2D& Collidable::boundingBox()
{
    if (!mBoundingBoxValid) {
        const auto& m = bboxToWorldTransform();

        const auto& aabb = localAABox();
        const auto& min = aabb.first;
        const auto& max = aabb.second;

        switch (localUpAxis()) {
            case 1:
                mBoundingBox.p[0] = glm::vec2(m * glm::vec4(min.x, min.y, min.z, 1.0f));
                mBoundingBox.p[1] = glm::vec2(m * glm::vec4(max.x, min.y, min.z, 1.0f));
                mBoundingBox.p[2] = glm::vec2(m * glm::vec4(max.x, min.y, max.z, 1.0f));
                mBoundingBox.p[3] = glm::vec2(m * glm::vec4(min.x, min.y, max.z, 1.0f));
                break;
            case 2:
                mBoundingBox.p[0] = glm::vec2(m * glm::vec4(min.x, min.y, min.z, 1.0f));
                mBoundingBox.p[1] = glm::vec2(m * glm::vec4(max.x, min.y, min.z, 1.0f));
                mBoundingBox.p[2] = glm::vec2(m * glm::vec4(max.x, max.y, min.z, 1.0f));
                mBoundingBox.p[3] = glm::vec2(m * glm::vec4(min.x, max.y, min.z, 1.0f));
                break;
            default:
                assert(false);
        }

        mBoundingBoxValid = true;
    }
    return mBoundingBox;
}

void Collidable::debugDraw(Renderer* renderer)
{
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
}
