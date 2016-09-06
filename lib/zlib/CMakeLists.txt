
disable_warnings()

set(src
    src/adler32.c
    src/crc32.c
    src/crc32.h
    src/infback.c
    src/inffast.c
    src/inffast.h
    src/inffixed.h
    src/inflate.c
    src/inflate.h
    src/inftrees.c
    src/inftrees.h
    src/trees.c
    src/trees.h
    src/uncompr.c
    src/zconf.h
    src/zlib.h
    src/zutil.c
    src/zutil.h
    )

source_group("Source Files" FILES ${src})

add_library(zlib STATIC ${src})
set_target_properties(zlib PROPERTIES FOLDER "Libraries" OUTPUT_NAME "z")

target_include_directories(zlib BEFORE PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/src")
target_include_directories(zlib SYSTEM BEFORE PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/src")
