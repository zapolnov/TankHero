#include "OpenGLWidget.h"
#include "src/engine/Engine.h"
#include <QKeyEvent>
#include <QMouseEvent>

QOpenGLFunctions* gl;

OpenGLWidget::OpenGLWidget(const std::function<void(Engine*)>& gameInit, QWidget* parent)
    : QOpenGLWidget(parent)
    , mGameInit(gameInit)
{
  #if QT_VERSION >= QT_VERSION_CHECK(5, 5, 0)
    setUpdateBehavior(QOpenGLWidget::NoPartialUpdate);
  #endif

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

static Key mapKey(int key)
{
    switch (key) {
        case Qt::Key_Up: return KeyUp;
        case Qt::Key_Down: return KeyDown;
        case Qt::Key_Left: return KeyLeft;
        case Qt::Key_Right: return KeyRight;
        case Qt::Key_Space: return KeyShoot;
        default: return KeyUnknown;
    }
}

void OpenGLWidget::keyPressEvent(QKeyEvent* event)
{
    if (mEngine)
        mEngine->keyPressed(mapKey(event->key()));
}

void OpenGLWidget::keyReleaseEvent(QKeyEvent* event)
{
    if (mEngine)
        mEngine->keyReleased(mapKey(event->key()));
}

void OpenGLWidget::mousePressEvent(QMouseEvent* event)
{
    if (mEngine && !mLeftButtonDown && event->button() == Qt::LeftButton) {
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
