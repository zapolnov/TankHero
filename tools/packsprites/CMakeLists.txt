
set(src
    packsprites.cpp
    )

source_group("Source Files" FILES ${src})

add_executable(packsprites ${src})
target_link_libraries(packsprites stb)
set_target_properties(packsprites PROPERTIES FOLDER "Tools")
