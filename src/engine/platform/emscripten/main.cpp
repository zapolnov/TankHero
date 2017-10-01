#include "src/engine/Game.h"
#include "src/engine/Engine.h"
#include <SDL.h>
#include <SDL_opengles2.h>
#include <SDL_main.h>
#include <emscripten.h>
#include <limits>

static SDL_Window* gWindow;
static double gTime;
static Engine* gEngine;
static bool gDragging;

template <typename TYPE> static Key mapKey(TYPE key)
{
    switch (key) {
        case SDLK_w: return KeyUp;
        case SDLK_a: return KeyLeft;
        case SDLK_s: return KeyDown;
        case SDLK_d: return KeyRight;
        case SDLK_KP_8: return KeyUp;
        case SDLK_KP_4: return KeyLeft;
        case SDLK_KP_6: return KeyRight;
        case SDLK_KP_2: return KeyDown;
        case SDLK_KP_ENTER: return KeyShoot;
        case SDLK_RETURN: return KeyShoot;
        case SDLK_RETURN2: return KeyShoot;
        case SDLK_UP: return KeyUp;
        case SDLK_DOWN: return KeyDown;
        case SDLK_LEFT: return KeyLeft;
        case SDLK_RIGHT: return KeyRight;
        case SDLK_SPACE: return KeyShoot;
        default: return KeyUnknown;
    }
}

static void mainLoop()
{
    int screenW = 0, screenH = 0;
    double time, frameTime;
    SDL_Event event;

    while (SDL_PollEvent(&event)) {
        switch (event.type)
        {
        case SDL_KEYDOWN:
            gEngine->keyPressed(mapKey(event.key.keysym.sym));
            break;

        case SDL_KEYUP:
            gEngine->keyReleased(mapKey(event.key.keysym.sym));
            break;

        case SDL_MOUSEBUTTONDOWN:
            if (event.button.button == SDL_BUTTON_LEFT) {
                if (!gDragging) {
                    gEngine->touchBegin(event.button.x, event.button.y);
                    gDragging = true;
                }
            }
            break;

        case SDL_MOUSEBUTTONUP:
            if (event.button.button == SDL_BUTTON_LEFT) {
                if (gDragging) {
                    gEngine->touchEnd(event.button.x, event.button.y);
                    gDragging = false;
                }
            }
            break;

        case SDL_MOUSEMOTION:
            if (gDragging)
                gEngine->touchContinue(event.button.x, event.button.y);
            break;
        }
    }

    SDL_GetWindowSize(gWindow, &screenW, &screenH);

    time = (double)SDL_GetTicks() * 0.001;
    frameTime = (time > gTime ? time - gTime : 0.0);
    if (frameTime > 1.0f / 10.0f)
        frameTime = 1.0f / 10.0f;
    gTime = time;

    gEngine->runFrame(screenW, screenH, frameTime);
    SDL_GL_SwapWindow(gWindow);
}

int main()
{
    SDL_GLContext glcontext;

    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        EM_ASM(alert("Unable to initialize WebGL."));
        return 1;
    }

    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
    SDL_GL_SetAttribute(SDL_GL_STENCIL_SIZE, 8);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);

    gWindow = SDL_CreateWindow("", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        1024, 768, SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE);
    if (!gWindow) {
        EM_ASM(alert("Unable to initialize WebGL."));
        return 1;
    }

    glcontext = SDL_GL_CreateContext(gWindow);
    if (!glcontext) {
        EM_ASM(alert("Unable to initialize WebGL."));
        return 1;
    }

    gEngine = new Engine;
    gameInit(gEngine);

    gTime = std::numeric_limits<double>::max();
    emscripten_set_main_loop(mainLoop, 0, 1);

    return 0;
}
