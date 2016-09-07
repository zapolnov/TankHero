
#pragma once
#include "OpenGL.h"
#include <string>

class GLES2ShaderProgram
{
public:
    GLES2ShaderProgram();
    ~GLES2ShaderProgram();

    void use() const;

    int getAttribLocation(const char* name) const;
    int getUniformLocation(const char* name) const;

    void init(const std::string& vertexSource, const std::string& fragmentSource);

private:
    GLuint mVertexShader;
    GLuint mFragmentShader;
    GLuint mProgram;

    void compileShader(GLuint shader, const std::string& source);
    void linkProgram();

    GLES2ShaderProgram(const GLES2ShaderProgram&) = delete;
    GLES2ShaderProgram& operator=(const GLES2ShaderProgram&) = delete;
};
