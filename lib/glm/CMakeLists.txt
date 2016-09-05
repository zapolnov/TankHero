
add_library(glm INTERFACE)

target_include_directories(glm BEFORE INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/src")
target_include_directories(glm SYSTEM BEFORE INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/src")
