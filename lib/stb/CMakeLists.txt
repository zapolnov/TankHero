
add_library(stb INTERFACE)

target_include_directories(stb BEFORE INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/..")
target_include_directories(stb SYSTEM BEFORE INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/..")
