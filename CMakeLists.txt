
cmake_minimum_required(VERSION 3.5)
project(Game)

include(cmake/common.cmake)

add_subdirectory(lib/glm)

include_directories(BEFORE "${CMAKE_CURRENT_SOURCE_DIR}")

#######################################################################################################################
# Assets

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

#######################################################################################################################
# Platform-independent sources

set(source_files
    src/engine/mesh/Mesh.h
    src/engine/mesh/VertexData.cpp
    src/engine/mesh/VertexData.h
    src/engine/mesh/VertexFormat.cpp
    src/engine/mesh/VertexFormat.h
    src/game/Game.cpp
    src/game/Game.h
)

#######################################################################################################################
# Platform-specific sources

set(libraries)

# FIXME
if(TRUE)
    add_definitions(-DPLATFORM_QT)

    find_package(Qt5Widgets REQUIRED)
    find_package(Qt5Gui REQUIRED)
    find_package(Qt5Core REQUIRED)

    qt5_wrap_cpp(moc_files src/engine/platform/qt/MainWindow.h)
    foreach(file ${moc_files})
        get_filename_component(name "${file}" NAME_WE)
        if("${name}" MATCHES "^moc_")
            source_group("Generated Files" FILES ${file})
        endif()
    endforeach()

    list(APPEND source_files
        ${moc_files}
        src/engine/platform/qt/main.cpp
        src/engine/platform/qt/MainWindow.cpp
        src/engine/platform/qt/MainWindow.h
    )

    list(APPEND libraries Qt5::Widgets Qt5::Gui Qt5::Core)
endif()

#######################################################################################################################

set_source_groups_with_dir("Source Files" "src" ${source_files})
add_executable(Game ${source_files} ${asset_src_files} ${asset_bin_files})
target_link_libraries(Game glm ${libraries})
