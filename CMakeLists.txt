
cmake_minimum_required(VERSION 3.5)
project(Game)

include(cmake/common.cmake)

add_subdirectory(lib/glm)

include_directories(BEFORE "${CMAKE_CURRENT_SOURCE_DIR}")

set(source_files
    src/Game.cpp
    src/Game.h
)

set(libraries)

# FIXME
if(TRUE)
    add_definitions(-DPLATFORM_QT)

    find_package(Qt5Widgets REQUIRED)
    find_package(Qt5Gui REQUIRED)
    find_package(Qt5Core REQUIRED)

    qt5_wrap_cpp(moc_files src/platform/qt/MainWindow.h)
    foreach(file ${moc_files})
        get_filename_component(name "${file}" NAME_WE)
        if("${name}" MATCHES "^moc_")
            source_group("Generated Files" FILES ${file})
        endif()
    endforeach()

    list(APPEND source_files
        ${moc_files}
        src/platform/qt/main.cpp
        src/platform/qt/MainWindow.cpp
        src/platform/qt/MainWindow.h
    )

    list(APPEND libraries Qt5::Widgets Qt5::Gui Qt5::Core)
endif()

set_source_groups_with_dir("Source Files" "src" ${source_files})

add_executable(Game ${source_files})
target_link_libraries(Game glm ${libraries})
