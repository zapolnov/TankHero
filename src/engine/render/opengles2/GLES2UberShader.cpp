#include "GLES2UberShader.h"
#include <sstream>
#include <iostream>
#include <cassert>

GLES2UberShader::GLES2UberShader()
{
    mVertexShader = glCreateShader(GL_VERTEX_SHADER);
    mFragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    mProgram = glCreateProgram();
}

GLES2UberShader::~GLES2UberShader()
{
    glDeleteProgram(mProgram);
    glDeleteShader(mFragmentShader);
    glDeleteShader(mVertexShader);
}

void GLES2UberShader::use() const
{
    glUseProgram(mProgram);
}

void GLES2UberShader::load(const std::unordered_map<std::string, std::string>& sources, Key key)
{
    std::set<std::string> defines;
    if (key & HasColorAttribute)
        defines.emplace("SHADER_HAS_COLOR_ATTRIBUTE");

    auto vertexShader = sources.find("GLES2UberShader_Vertex.glsl");
    compileShader(mVertexShader, defines, (vertexShader != sources.end() ? vertexShader->second : std::string()));

    auto fragmentShader = sources.find("GLES2UberShader_Fragment.glsl");
    compileShader(mFragmentShader, defines, (fragmentShader != sources.end() ? fragmentShader->second : std::string()));

    glAttachShader(mProgram, mVertexShader);
    glAttachShader(mProgram, mFragmentShader);

    linkProgram();

    mProjectionMatrixUniform = glGetUniformLocation(mProgram, "u_projection");
    mViewMatrixUniform = glGetUniformLocation(mProgram, "u_view");
    mModelMatrixUniform = glGetUniformLocation(mProgram, "u_model");
    mDiffuseColorUniform = glGetUniformLocation(mProgram, "u_materialDiffuse");

    mPositionAttribute = glGetAttribLocation(mProgram, "a_position");
    mColorAttribute = glGetAttribLocation(mProgram, "a_color");
}

void GLES2UberShader::compileShader(GLuint shader, const std::set<std::string>& defines, const std::string& source)
{
    std::stringstream ss;
    for (const auto& def : defines)
        ss << "#define " << def << '\n';
    std::string prefix = ss.str();

    const char* p[2];
    p[0] = prefix.c_str();
    p[1] = source.c_str();
    GLint lengths[2];
    lengths[0] = GLint(prefix.length());
    lengths[1] = GLint(source.length());
    glShaderSource(shader, 2, p, lengths);

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

void GLES2UberShader::linkProgram()
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
