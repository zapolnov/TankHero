
#pragma once
#include <glm/glm.hpp>
#include <cstdint>
#include <unordered_map>
#include <string>
#include <vector>
#include <memory>

class Engine;
class Canvas;

class Renderer
{
public:
    static Renderer* create(Engine* engine);
    ~Renderer();

    virtual void beginFrame(int width, int height) = 0;
    virtual void endFrame() = 0;

    uint16_t textureNameId(const std::string& name);
    const std::string& textureName(uint16_t id) const;

    uint16_t meshNameId(const std::string& name);
    const std::string& meshName(uint16_t id) const;
    virtual const glm::vec3& meshBBoxMin(uint16_t id) const = 0;
    virtual const glm::vec3& meshBBoxMax(uint16_t id) const = 0;
    virtual const glm::vec3& meshSphereCenter(uint16_t id) const = 0;
    virtual float meshSphereRadius(uint16_t id) const = 0;

    virtual void loadTexture(uint16_t texture) = 0;
    virtual void unloadAllTextures() = 0;

    virtual void loadMesh(uint16_t mesh) = 0;
    virtual void unloadAllMeshes() = 0;

    void setProjectionMatrix(const glm::mat4& projection);
    void setViewMatrix(const glm::mat4& view);

    Canvas* begin2D();
    void end2D();

    void setLight(const glm::vec3& position, const glm::vec3& color, float power)
    {
        mLightPosition = position;
        mLightColor = color;
        mLightPower = power;
    }

    void setShadowMapBoundaries(const glm::vec2& min, const glm::vec2& max)
    {
        mShadowMapMin = min;
        mShadowMapMax = max;
    }

    void drawMesh(const glm::mat4& model, uint16_t mesh);

protected:
    struct DrawCall
    {
        glm::mat4 projectionMatrix;
        glm::mat4 viewMatrix;
        glm::mat4 modelMatrix;
        glm::vec3 lightPosition;
        glm::vec3 lightColor;
        float lightPower;
        uint16_t mesh;
    };

    Engine* mEngine;
    glm::mat4 mProjectionMatrix;
    glm::mat4 mViewMatrix;
    uint32_t mFlags;
    std::unordered_map<std::string, uint16_t> mTextureIds;
    std::unordered_map<std::string, uint16_t> mMeshIds;
    std::vector<DrawCall> mDrawCalls;
    std::vector<std::string> mTextureNames;
    std::vector<std::string> mMeshNames;
    std::unique_ptr<Canvas> mCanvas;
    glm::vec3 mLightPosition;
    glm::vec3 mLightColor;
    glm::vec2 mShadowMapMin{-10.0f};
    glm::vec2 mShadowMapMax{10.0f};
    float mLightPower;
    int mIn2d = 0;

    explicit Renderer(Engine* engine);

    virtual void submitCanvas(const Canvas*) = 0;

    Renderer(const Renderer&) = delete;
    Renderer& operator=(const Renderer&) = delete;
};
