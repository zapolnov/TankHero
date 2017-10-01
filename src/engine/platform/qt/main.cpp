#include "OpenGLWidget.h"
#include "src/engine/Game.h"
#include <QSurfaceFormat>
#include <QApplication>

#ifdef _WIN32
 #define WIN32_LEAN_AND_MEAN 1
 #include <windows.h>
 #include <shlwapi.h>
#endif

#ifdef __APPLE__
 #include <ApplicationServices/ApplicationServices.h>
#endif

int main(int argc, char** argv)
{
    QApplication::setAttribute(Qt::AA_UseDesktopOpenGL);
    QApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

    QSurfaceFormat format;
    format.setDepthBufferSize(24);
    format.setStencilBufferSize(8);
    format.setVersion(2, 1);
    format.setProfile(QSurfaceFormat::NoProfile);
    format.setSwapInterval(0);
    QSurfaceFormat::setDefaultFormat(format);

    QApplication app(argc, argv);

  #if defined(_WIN32) && defined(NDEBUG)
    WCHAR buf[MAX_PATH];
    GetModuleFileNameW(nullptr, buf, MAX_PATH);
    PathRemoveFileSpecW(buf);
    PathAppendW(buf, L"data");
    SetCurrentDirectoryW(buf);
  #endif

  #if defined(__APPLE__) && defined(NDEBUG)
    CFBundleRef bundle = CFBundleGetMainBundle();
    if (bundle) {
        CFURLRef resourcesURL = CFBundleCopyResourcesDirectoryURL(bundle);
        CFStringRef last = CFURLCopyLastPathComponent(resourcesURL);
        if (CFStringCompare(CFSTR("Resources"), last, 0) == kCFCompareEqualTo) {
            char resourcesPath[MAXPATHLEN];
            if (CFURLGetFileSystemRepresentation(resourcesURL, true, (UInt8*)resourcesPath, MAXPATHLEN))
                chdir(resourcesPath);
        }
        CFRelease(last);
        CFRelease(resourcesURL);
    }
  #endif

    OpenGLWidget mainWindow(&gameInit);
    mainWindow.resize(1024, 768);
    mainWindow.show();

    return app.exec();
}

#ifdef _WIN32
int APIENTRY WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd)
{
    return main(__argc, __argv);
}
#endif
