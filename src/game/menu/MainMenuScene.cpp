#include "MainMenuScene.h"
#include "GameLoadingScene.h"
#include "src/engine/scene/camera/OrthoCamera.h"
#include "src/engine/scene/Button.h"
#include "src/engine/scene/RootNode.h"
#include "src/engine/Engine.h"

MainMenuScene::MainMenuScene(Engine* engine)
{
    auto rootNode = std::make_shared<RootNode>();
    rootNode->set2D(true);
    rootNode->setCamera(std::make_shared<OrthoCamera>());
    setRootNode(rootNode);

    const float BUTTON_WIDTH = 100.0f;
    const float BUTTON_HEIGHT = 40.0f;

    auto newGameButton = std::make_shared<Button>(BUTTON_WIDTH, BUTTON_HEIGHT);
    newGameButton->setPosition2D(0.0f, BUTTON_HEIGHT);
    newGameButton->onClick = [engine]() {
            engine->setScene(std::make_shared<GameLoadingScene>(engine));
        };
    rootNode->appendChild(newGameButton);
}
