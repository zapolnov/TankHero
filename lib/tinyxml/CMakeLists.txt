
disable_warnings()

set(tinyxml_sources
    src/tinyxml.cpp
    src/tinyxml.h
    src/tinyxmlerror.cpp
    src/tinyxmlparser.cpp
    )

source_group("Source Files" FILES ${tinyxml_sources})

add_library(tinyxml STATIC ${tinyxml_sources})
set_target_properties(tinyxml PROPERTIES FOLDER "Libraries")

target_include_directories(tinyxml BEFORE PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/src")
target_include_directories(tinyxml SYSTEM BEFORE PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/src")

target_compile_definitions(tinyxml PUBLIC "TIXML_USE_STL")
