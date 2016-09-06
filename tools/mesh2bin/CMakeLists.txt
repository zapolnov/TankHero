
set(src
    mesh2bin.cpp
    )

source_group("Source Files" FILES ${src})

add_executable(mesh2bin ${src})
target_link_libraries(mesh2bin engine glm assimp tinyxml miniball)
set_target_properties(mesh2bin PROPERTIES FOLDER "Tools")
