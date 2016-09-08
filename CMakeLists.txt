
cmake_minimum_required(VERSION 3.5)
project(Game)

include(cmake/common.cmake)
include(cmake/bin2c.cmake)

add_subdirectory(lib/glm)
add_subdirectory(lib/stb)

include_directories(BEFORE "${CMAKE_CURRENT_SOURCE_DIR}")

set(platform_libraries)
set(platform_sources)

#######################################################################################################################
# Engine

set(engine_sources
    src/engine/math/OBB2D.cpp
    src/engine/math/OBB2D.h
    src/engine/mesh/MaterialDesc.h
    src/engine/mesh/MeshFile.h
    src/engine/mesh/VertexData.cpp
    src/engine/mesh/VertexData.h
    src/engine/mesh/VertexFormat.cpp
    src/engine/mesh/VertexFormat.h
    src/engine/scene/camera/Camera.cpp
    src/engine/scene/camera/Camera.h
    src/engine/scene/camera/OrthoCamera.cpp
    src/engine/scene/camera/OrthoCamera.h
    src/engine/scene/camera/PerspectiveCamera.cpp
    src/engine/scene/camera/PerspectiveCamera.h
    src/engine/scene/Button.cpp
    src/engine/scene/Button.h
    src/engine/scene/Node.cpp
    src/engine/scene/Node.h
    src/engine/scene/RootNode.cpp
    src/engine/scene/RootNode.h
    src/engine/scene/Scene.cpp
    src/engine/scene/Scene.h
    src/engine/utility/StbImage.cpp
    src/engine/utility/StbImage.h
    src/engine/utility/TarGzDecompressor.cpp
    src/engine/utility/TarGzDecompressor.h
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
target_link_libraries(engine renderer stb glm ${platform_libraries})


#######################################################################################################################
# Renderer

set(renderer_libraries)
set(renderer_shaders)

set(renderer_sources
    src/engine/render/Canvas.cpp
    src/engine/render/Canvas.h
    src/engine/render/Renderer.cpp
    src/engine/render/Renderer.h
    )

#FIXME
if(TRUE)
    add_definitions(-DRENDERER_GLES2)

    list(APPEND renderer_sources
        src/engine/render/opengles2/GLES2Buffer.cpp
        src/engine/render/opengles2/GLES2Buffer.h
        src/engine/render/opengles2/GLES2Framebuffer.cpp
        src/engine/render/opengles2/GLES2Framebuffer.h
        src/engine/render/opengles2/GLES2Mesh.cpp
        src/engine/render/opengles2/GLES2Mesh.h
        src/engine/render/opengles2/GLES2Renderbuffer.cpp
        src/engine/render/opengles2/GLES2Renderbuffer.h
        src/engine/render/opengles2/GLES2Renderer.cpp
        src/engine/render/opengles2/GLES2Renderer.h
        src/engine/render/opengles2/GLES2Shader2D.cpp
        src/engine/render/opengles2/GLES2Shader2D.h
        src/engine/render/opengles2/GLES2ShaderProgram.cpp
        src/engine/render/opengles2/GLES2ShaderProgram.h
        src/engine/render/opengles2/GLES2Texture.cpp
        src/engine/render/opengles2/GLES2Texture.h
        src/engine/render/opengles2/GLES2UberShader.cpp
        src/engine/render/opengles2/GLES2UberShader.h
        src/engine/render/opengles2/OpenGL.h
        )

    list(APPEND renderer_shaders
        src/engine/render/opengles2/GLES2Shader2D_Fragment.glsl
        src/engine/render/opengles2/GLES2Shader2D_Vertex.glsl
        src/engine/render/opengles2/GLES2UberShader_Fragment.glsl
        src/engine/render/opengles2/GLES2UberShader_Vertex.glsl
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

set(shaders_tgz "${CMAKE_CURRENT_BINARY_DIR}/shaders.tgz")
set(shaders_tgz_c "${CMAKE_CURRENT_BINARY_DIR}/shaders.tgz.c")

add_custom_command(OUTPUT "${shaders_tgz}"
    COMMAND "${CMAKE_COMMAND}" -E tar czf "${shaders_tgz}" ${renderer_shaders}
    WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
    DEPENDS ${renderer_shaders}
    )

bin2c(SHADERS "${shaders_tgz}" "${shaders_tgz_c}")
source_group("Generated Files" FILES "${shaders_tgz_c}")

set_source_groups_with_dir("Source Files" "src/engine/render" ${renderer_sources})
set_source_groups_with_dir("Source Files" "src/engine/render" ${renderer_shaders})
add_library(renderer STATIC ${renderer_sources} ${renderer_shaders} ${shaders_tgz_c})
target_link_libraries(renderer engine glm ${renderer_libraries})


#######################################################################################################################
# Game

set(asset_src_files)
set(asset_bin_files)

if(NOT CMAKE_CROSSCOMPILING)
    add_subdirectory(tools)
endif()

#add_mesh(
#    INPUT "data/src/panzerwagen/panzerwagen.xml"
#    OUTPUT "data/bin/tank.mesh"
#    DEPENDS "data/src/panzerwagen/panzerwagen_3x3.blend"
#    )

add_mesh(
    INPUT "data/src/TankAndProps/Tanks/Body.xml"
    OUTPUT "data/bin/tank_body.mesh"
    DEPENDS "data/src/TankAndProps/Tanks/Body.dae"
    )

add_mesh(
    INPUT "data/src/TankAndProps/Tanks/Gun.xml"
    OUTPUT "data/bin/tank_gun.mesh"
    DEPENDS "data/src/TankAndProps/Tanks/Gun.dae"
    )

add_mesh(
    INPUT "data/src/lowpoly-tree/tree.xml"
    OUTPUT "data/bin/tree.mesh"
    DEPENDS "data/src/lowpoly-tree/tree.3ds"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/grass.xml"
    OUTPUT "data/bin/grass.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/grass.obj" "data/src/landscape_asset_v2a/obj/grass.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/road-straight-low.xml"
    OUTPUT "data/bin/road-straight-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/road-straight-low.obj" "data/src/landscape_asset_v2a/obj/road-straight-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/road-corner-low.xml"
    OUTPUT "data/bin/road-corner-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/road-corner-low.obj" "data/src/landscape_asset_v2a/obj/road-corner-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/road-tjunction-low.xml"
    OUTPUT "data/bin/road-tjunction-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/road-tjunction-low.obj" "data/src/landscape_asset_v2a/obj/road-tjunction-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/road-crossing-low.xml"
    OUTPUT "data/bin/road-crossing-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/road-crossing-low.obj" "data/src/landscape_asset_v2a/obj/road-crossing-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/building-office-small.xml"
    OUTPUT "data/bin/building-office-small.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/building-office-small_modified.obj" "data/src/landscape_asset_v2a/obj/building-office-small.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/river-corner-low.xml"
    OUTPUT "data/bin/river-corner-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/river-corner-low.obj" "data/src/landscape_asset_v2a/obj/river-corner-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/river-end-low.xml"
    OUTPUT "data/bin/river-end-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/river-end-low.obj" "data/src/landscape_asset_v2a/obj/river-end-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/river-straight-low.xml"
    OUTPUT "data/bin/river-straight-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/river-straight-low.obj" "data/src/landscape_asset_v2a/obj/river-straight-low.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/water.xml"
    OUTPUT "data/bin/water.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/water.obj" "data/src/landscape_asset_v2a/obj/water.mtl"
    )

add_mesh(
    INPUT "data/src/landscape_asset_v2a/obj/road-end-low.xml"
    OUTPUT "data/bin/road-end-low.mesh"
    DEPENDS "data/src/landscape_asset_v2a/obj/road-end-low.obj" "data/src/landscape_asset_v2a/obj/road-end-low.mtl"
    )

set(source_files
    ${platform_sources}
    src/game/game/Collidable.cpp
    src/game/game/Collidable.h
    src/game/game/GameScene.cpp
    src/game/game/GameScene.h
    src/game/game/Level.cpp
    src/game/game/Level.h
    src/game/game/Obstacle.cpp
    src/game/game/Obstacle.h
    src/game/game/Player.cpp
    src/game/game/Player.h
    src/game/menu/GameLoadingScene.cpp
    src/game/menu/GameLoadingScene.h
    src/game/menu/LoadingScene.cpp
    src/game/menu/LoadingScene.h
    src/game/menu/MainMenuScene.cpp
    src/game/menu/MainMenuScene.h
    src/game/main.cpp
    )

set_source_groups_with_dir("Source Files" "src" ${source_files})
add_executable(Game ${source_files} ${asset_src_files} ${asset_bin_files})
target_link_libraries(Game engine)
