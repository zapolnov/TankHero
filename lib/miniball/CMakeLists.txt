
add_library(miniball INTERFACE)

target_include_directories(miniball BEFORE INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/..")
target_include_directories(miniball SYSTEM BEFORE INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/..")
