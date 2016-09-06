#include "OpenGLWidget.h"
#include "src/game/Game.h"
#include <QMouseEvent>
#include <QWheelEvent>

QOpenGLFunctions* gl;

OpenGLWidget::OpenGLWidget()
{
    setUpdateBehavior(NoPartialUpdate);

    mTimer = new QTimer(this);
    mTimer->setSingleShot(false);
    mTimer->setInterval(8);
    connect(mTimer, &QTimer::timeout, this, static_cast<void(OpenGLWidget::*)()>(&OpenGLWidget::update));
    mTimer->start();
}

OpenGLWidget::~OpenGLWidget()
{
    makeCurrent();
    cleanupGL();
    doneCurrent();
}

void OpenGLWidget::initializeGL()
{
    initializeOpenGLFunctions();
    gl = this;
    mElapsedTimer.start();
    mGame = new Game;
}

void OpenGLWidget::cleanupGL()
{
    delete mGame;
}

void OpenGLWidget::resizeGL(int width, int height)
{
    mWidth = width;
    mHeight = height;
}

void OpenGLWidget::paintGL()
{
    auto time = mElapsedTimer.restart();
    float frameTime = float(double(time) / 1000.0);
    mGame->runFrame(mWidth, mHeight, frameTime);
}

void OpenGLWidget::keyPressEvent(QKeyEvent*)
{
}

void OpenGLWidget::keyReleaseEvent(QKeyEvent*)
{
}

void OpenGLWidget::mousePressEvent(QMouseEvent*)
{
}

void OpenGLWidget::mouseReleaseEvent(QMouseEvent*)
{
}

void OpenGLWidget::mouseMoveEvent(QMouseEvent*)
{
}

void OpenGLWidget::wheelEvent(QWheelEvent*)
{
}
