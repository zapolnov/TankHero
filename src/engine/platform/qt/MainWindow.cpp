#include "MainWindow.h"
#include "src/game/Game.h"
#include <QMouseEvent>
#include <QWheelEvent>

QOpenGLFunctions* gl;

MainWindow::MainWindow()
{
    setUpdateBehavior(NoPartialUpdate);

    mTimer = new QTimer(this);
    mTimer->setSingleShot(false);
    mTimer->setInterval(8);
    connect(mTimer, &QTimer::timeout, this, static_cast<void(MainWindow::*)()>(&MainWindow::update));
    mTimer->start();
}

MainWindow::~MainWindow()
{
    makeCurrent();
    cleanupGL();
    doneCurrent();
}

void MainWindow::initializeGL()
{
    initializeOpenGLFunctions();
    gl = this;
    mElapsedTimer.start();
    mGame = new Game;
}

void MainWindow::cleanupGL()
{
    delete mGame;
}

void MainWindow::resizeGL(int width, int height)
{
    mWidth = width;
    mHeight = height;
}

void MainWindow::paintGL()
{
    auto time = mElapsedTimer.restart();
    float frameTime = float(double(time) / 1000.0);
    mGame->runFrame(mWidth, mHeight, frameTime);
}

void MainWindow::keyPressEvent(QKeyEvent*)
{
}

void MainWindow::keyReleaseEvent(QKeyEvent*)
{
}

void MainWindow::mousePressEvent(QMouseEvent*)
{
}

void MainWindow::mouseReleaseEvent(QMouseEvent*)
{
}

void MainWindow::mouseMoveEvent(QMouseEvent*)
{
}

void MainWindow::wheelEvent(QWheelEvent*)
{
}
