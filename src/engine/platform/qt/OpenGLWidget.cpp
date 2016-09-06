#include "OpenGLWidget.h"
#include "src/engine/Engine.h"
#include <QKeyEvent>
#include <QMouseEvent>

QOpenGLFunctions* gl;

OpenGLWidget::OpenGLWidget(const std::function<void(Engine*)>& gameInit, QWidget* parent)
    : QOpenGLWidget(parent)
    , mGameInit(gameInit)
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

    mEngine = new Engine;
    mGameInit(mEngine);

    mElapsedTimer.start();
}

void OpenGLWidget::cleanupGL()
{
    delete mEngine;
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
    mEngine->runFrame(mWidth, mHeight, frameTime);
}

void OpenGLWidget::keyPressEvent(QKeyEvent*)
{
}

void OpenGLWidget::keyReleaseEvent(QKeyEvent*)
{
}

void OpenGLWidget::mousePressEvent(QMouseEvent* event)
{
    if (!mLeftButtonDown && event->button() == Qt::LeftButton) {
        mLeftButtonDown = true;
        mEngine->touchBegin(event->pos().x(), event->pos().y());
    }
}

void OpenGLWidget::mouseReleaseEvent(QMouseEvent* event)
{
    if (mLeftButtonDown && event->button() == Qt::LeftButton) {
        mLeftButtonDown = false;
        mEngine->touchEnd(event->pos().x(), event->pos().y());
    }
}

void OpenGLWidget::mouseMoveEvent(QMouseEvent* event)
{
    if (mLeftButtonDown)
        mEngine->touchContinue(event->pos().x(), event->pos().y());
}
