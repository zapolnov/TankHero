#include "HelpScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/render/Canvas.h"
#include "src/engine/Engine.h"

const glm::vec4 HelpScene::BACKGROUND_COLOR(0.156863f, 0.156863f, 0.156863f, 1.0f);

static const float IMAGE_W = 1024.0f;
static const float IMAGE_H = 1024.0f;

namespace
{
    class Root : public RootNode
    {
    public:
        void adjustCameraSize(float& width, float& height) override
        {
            if (height < 768.0f) {
                float aspect = width / height;
                height = 768.0f;
                width = height * aspect;
            }
        }
    };

    class Image : public Node
    {
    public:
        explicit Image(uint16_t texture)
            : mTexture(texture)
        {
        }

        void draw(Renderer* renderer) override
        {
            float x1 = -IMAGE_W * 0.5f;
            float y1 = IMAGE_H * 0.5f;
            float x2 = IMAGE_W * 0.5f;
            float y2 = -IMAGE_H * 0.5f;

            auto canvas = renderer->begin2D();
            canvas->pushMatrix(worldMatrix());
            canvas->pushColor(glm::vec4(1.0f, 1.0f, 1.0f, 1.0f));

            canvas->drawSolidRect(glm::vec2(x1, y1), glm::vec2(x2, y2), mTexture);

            canvas->popColor();
            canvas->popMatrix();
            renderer->end2D();
        }

    private:
        uint16_t mTexture;
    };
}

HelpScene::HelpScene(Engine* engine, PendingResources& resourceQueue)
    : mEngine(engine)
{
    mEngine->renderer()->setClearColor(HelpScene::BACKGROUND_COLOR);

    resourceQueue.sounds.emplace(mClickSound = engine->soundManager()->soundNameId("button_click.ogg"));

    resourceQueue.textures.emplace(mImage = engine->renderer()->textureNameId("help_screen.jpg"));
    resourceQueue.textures.emplace(mGoBackNormalImage = engine->renderer()->textureNameId("gotit_normal.png"));
    resourceQueue.textures.emplace(mGoBackPressedImage = engine->renderer()->textureNameId("gotit_pressed.png"));

    resourceQueue.custom.emplace_back([this] {
        auto rootNode = std::make_shared<Root>();
        rootNode->set2D(true);
        rootNode->setCamera(std::make_shared<OrthoCamera>());
        setRootNode(rootNode);

        rootNode->appendChild(std::make_shared<Image>(mImage));

        const float BUTTON_WIDTH = 256.0f;
        const float BUTTON_HEIGHT = 64.0f;

        auto returnButton = std::make_shared<Button>(mEngine, BUTTON_WIDTH, BUTTON_HEIGHT,
            mClickSound, mGoBackNormalImage, mGoBackPressedImage);
        returnButton->setPosition2D(0.0f, -300.0f);
        returnButton->onClick = [this]() {
                mEngine->popScene();
            };
        rootNode->appendChild(returnButton);
    });
}
