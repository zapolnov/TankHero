
#pragma once
#include "src/engine/scene/Node.h"
#include "src/engine/mesh/VertexFormat.h"
#include "src/game/menu/LoadingScene.h"
#include <glm/glm.hpp>
#include <vector>

class Camera;

class Explosion : public Node
{
public:
    Explosion(Camera* camera, uint16_t texture, float size, size_t numFrames);

private:
    struct Vertex
    {
        glm::vec3 position;
        glm::vec2 texCoord;
    };

    Camera* mCamera;
    uint16_t mTexture;
    float mSize;
    size_t mNumFrames;
    float mTime;
    std::vector<Vertex> mVertices;
    std::vector<uint16_t> mIndices;
    VertexFormat mVertexFormat;

    void update(float time) override;
    void draw(Renderer* renderer) override;
};
