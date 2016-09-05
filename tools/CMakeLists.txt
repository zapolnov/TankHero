
cmake_minimum_required(VERSION 3.5)
project(Tools)

include(../cmake/common.cmake)

add_subdirectory(../lib/zlib zlib)
add_subdirectory(../lib/assimp assimp)

include_directories(BEFORE "${CMAKE_CURRENT_SOURCE_DIR}/..")
