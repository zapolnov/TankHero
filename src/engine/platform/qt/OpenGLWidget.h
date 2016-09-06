
#pragma once
#include <QOpenGLWidget>
#include <QOpenGLFunctions>
#include <QTimer>
#include <QElapsedTimer>

class Game;

class OpenGLWidget : public QOpenGLWidget, public QOpenGLFunctions
{
    Q_OBJECT

public:
    OpenGLWidget();
    ~OpenGLWidget();

protected:
    void initializeGL() override;
    void cleanupGL();
    void resizeGL(int width, int height) override;
    void paintGL() override;

    void keyPressEvent(QKeyEvent* event) override;
    void keyReleaseEvent(QKeyEvent* event) override;

    void mousePressEvent(QMouseEvent* event) override;
    void mouseReleaseEvent(QMouseEvent* event) override;
    void mouseMoveEvent(QMouseEvent* event) override;

    void wheelEvent(QWheelEvent* event) override;

private:
    QTimer* mTimer;
    QElapsedTimer mElapsedTimer;
    Game* mGame = nullptr;
    int mWidth = 0;
    int mHeight = 0;

    Q_DISABLE_COPY(OpenGLWidget)
};
