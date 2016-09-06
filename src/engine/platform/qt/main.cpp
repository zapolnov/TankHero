#include "OpenGLWidget.h"
#include "src/engine/Game.h"
#include <QSurfaceFormat>
#include <QApplication>

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

    OpenGLWidget mainWindow(&gameInit);
    mainWindow.resize(1024, 768);
    mainWindow.show();

    return app.exec();
}
