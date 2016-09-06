
#pragma once
#include <functional>
#include <QOpenGLWidget>
#include <QOpenGLFunctions>
#include <QTimer>
#include <QElapsedTimer>

class Engine;

class OpenGLWidget : public QOpenGLWidget, public QOpenGLFunctions
{
    Q_OBJECT

public:
    explicit OpenGLWidget(const std::function<void(Engine*)>& gameInit, QWidget* parent = nullptr);
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

private:
    std::function<void(Engine*)> mGameInit;
    QTimer* mTimer;
    QElapsedTimer mElapsedTimer;
    Engine* mEngine = nullptr;
    int mWidth = 0;
    int mHeight = 0;
    bool mLeftButtonDown = false;

    Q_DISABLE_COPY(OpenGLWidget)
};
