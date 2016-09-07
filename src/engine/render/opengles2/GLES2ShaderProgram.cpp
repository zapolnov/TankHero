#include "GLES2ShaderProgram.h"
#include <sstream>
#include <iostream>
#include <cassert>

GLES2ShaderProgram::GLES2ShaderProgram()
{
    mVertexShader = glCreateShader(GL_VERTEX_SHADER);
    mFragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    mProgram = glCreateProgram();
}

GLES2ShaderProgram::~GLES2ShaderProgram()
{
    glDeleteProgram(mProgram);
    glDeleteShader(mFragmentShader);
    glDeleteShader(mVertexShader);
}

void GLES2ShaderProgram::use() const
{
    glUseProgram(mProgram);
}

int GLES2ShaderProgram::getAttribLocation(const char* name) const
{
    return glGetAttribLocation(mProgram, name);
}

int GLES2ShaderProgram::getUniformLocation(const char* name) const
{
    return glGetUniformLocation(mProgram, name);
}

void GLES2ShaderProgram::init(const std::string& vertexSource, const std::string& fragmentSource)
{
    compileShader(mVertexShader, vertexSource);
    compileShader(mFragmentShader, fragmentSource);

    glAttachShader(mProgram, mVertexShader);
    glAttachShader(mProgram, mFragmentShader);

    linkProgram();
}

void GLES2ShaderProgram::compileShader(GLuint shader, const std::string& source)
{
    const char* p = source.c_str();
    GLint length = GLint(source.length());
    glShaderSource(shader, 1, &p, &length);

    glCompileShader(shader);

  #ifndef NDEBUG
    GLint status = GL_FALSE;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &status);
    if (status != GL_TRUE) {
        GLint length = 0;
        glGetShaderiv(shader, GL_SHADER_SOURCE_LENGTH, &length);

        std::unique_ptr<char[]> source(new char[length]);
        GLsizei sourceLength = 0;
        glGetShaderSource(shader, length, &sourceLength, source.get());
        source[sourceLength] = 0;

        length = 0;
        glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &length);

        std::unique_ptr<char[]> infoLog(new char[length]);
        GLsizei infoLogLength = 0;
        glGetShaderInfoLog(shader, length, &infoLogLength, infoLog.get());
        infoLog[infoLogLength] = 0;

        std::stringstream ss;
        ss << "-[compile]---------------\n";
        const char* p = source.get();
        const char* end = p + sourceLength;
        int line = 1;
        while (p < end) {
            const char* n = strchr(p, '\n');
            n = (n ? n + 1 : end);

            char buf[32];
            sprintf(buf, "%3d: ", line++);

            ss << buf;
            ss.write(p, std::streamsize(n - p));
            p = n;
        }
        ss << "-------------------------\n";
        ss.write(infoLog.get(), std::streamsize(infoLogLength));

        std::string message = ss.str();
        std::cerr << message << std::endl;
    }
  #endif
}

void GLES2ShaderProgram::linkProgram()
{
    glLinkProgram(mProgram);

  #ifndef NDEBUG
    GLint status = GL_FALSE;
    glGetProgramiv(mProgram, GL_LINK_STATUS, &status);
    if (status != GL_TRUE) {
        GLint length = 0;
        glGetProgramiv(mProgram, GL_INFO_LOG_LENGTH, &length);

        std::unique_ptr<char[]> infoLog(new char[length]);
        GLsizei infoLogLength = 0;
        glGetProgramInfoLog(mProgram, length, &infoLogLength, infoLog.get());
        infoLog[infoLogLength] = 0;

        std::stringstream ss;
        ss << "-[link]------------------\n";
        ss.write(infoLog.get(), std::streamsize(infoLogLength));

        std::string message = ss.str();
        std::cerr << message << std::endl;
    }
  #endif
}
