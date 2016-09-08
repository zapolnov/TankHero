
#pragma once
#include "src/engine/scene/Node.h"
#include "src/engine/math/OBB2D.h"
#include "src/game/menu/LoadingScene.h"

class Obstacle : public Node
{
public:
    Obstacle(Engine* engine, uint16_t mesh);

    const OBB2D& boundingBox();

private:
    Engine* mEngine;
    OBB2D mBoundingBox;
    uint16_t mMesh;
    bool mBoundingBoxValid = false;

    void draw(Renderer* renderer) override;
};
