
cmake_minimum_required(VERSION 3.5)
project(Game)

include(cmake/common.cmake)

add_subdirectory(lib/glm)

include_directories(BEFORE "${CMAKE_CURRENT_SOURCE_DIR}")

set(platform_libraries)
set(platform_sources)

#######################################################################################################################
# Engine

set(engine_sources
    src/engine/mesh/Mesh.h
    src/engine/mesh/VertexData.cpp
    src/engine/mesh/VertexData.h
    src/engine/mesh/VertexFormat.cpp
    src/engine/mesh/VertexFormat.h
    src/engine/scene/Node.cpp
    src/engine/scene/Node.h
    src/engine/scene/Scene.cpp
    src/engine/scene/Scene.h
    src/engine/Engine.cpp
    src/engine/Engine.h
    src/engine/Game.h
)

# FIXME
if(TRUE)
    add_definitions(-DPLATFORM_QT)

    find_package(Qt5Widgets REQUIRED)
    find_package(Qt5Gui REQUIRED)
    find_package(Qt5Core REQUIRED)

    qt5_wrap_cpp(moc_files src/engine/platform/qt/OpenGLWidget.h)
    foreach(file ${moc_files})
        get_filename_component(name "${file}" NAME_WE)
        if("${name}" MATCHES "^moc_")
            source_group("Generated Files" FILES ${file})
        endif()
    endforeach()

    list(APPEND engine_sources
        ${moc_files}
        src/engine/platform/qt/OpenGLWidget.cpp
        src/engine/platform/qt/OpenGLWidget.h
    )

    list(APPEND platform_sources
        src/engine/platform/qt/main.cpp
    )

    list(APPEND platform_libraries Qt5::Widgets Qt5::Gui Qt5::Core)
endif()

set_source_groups_with_dir("Source Files" "src/engine" ${engine_sources})
add_library(engine STATIC ${engine_sources})
target_link_libraries(engine renderer glm ${platform_libraries})


#######################################################################################################################
# Renderer

set(renderer_libraries)

set(renderer_sources
    src/engine/render/Renderer.cpp
    src/engine/render/Renderer.h
)

#FIXME
if(TRUE)
    add_definitions(-DRENDERER_GLES2)

    list(APPEND renderer_sources
        src/engine/render/opengles2/OpenGL.h
    )

    find_package(OpenGL)
    if(OPENGL_FOUND)
        if(OPENGL_INCLUDE_DIR)
            include_directories("${OPENGL_INCLUDE_DIR}")
        endif()
        if(OPENGL_LIBRARIES)
            list(APPEND renderer_libraries ${OPENGL_LIBRARIES})
        endif()
    endif()
endif()

set_source_groups_with_dir("Source Files" "src/engine/render" ${renderer_sources})
add_library(renderer STATIC ${renderer_sources})
target_link_libraries(renderer engine glm ${renderer_libraries})


#######################################################################################################################
# Game

set(asset_src_files)
set(asset_bin_files)

if(NOT CMAKE_CROSSCOMPILING)
    add_subdirectory(tools)
endif()

add_mesh(
    INPUT "data/src/panzerwagen/panzerwagen.xml"
    OUTPUT "data/bin/tank.mesh"
    DEPENDS "data/src/panzerwagen/panzerwagen_3x3.blend"
    )

set(source_files
    ${platform_sources}
    src/game/menu/MainMenuScene.cpp
    src/game/menu/MainMenuScene.h
    src/game/main.cpp
)

set_source_groups_with_dir("Source Files" "src" ${source_files})
add_executable(Game ${source_files} ${asset_src_files} ${asset_bin_files})
target_link_libraries(Game engine)
