
set_property(GLOBAL PROPERTY USE_FOLDERS TRUE)
set_property(GLOBAL PROPERTY PREDEFINED_TARGETS_FOLDER "Support")
set(COTIRE_TARGETS_FOLDER "Support")

set(CMAKE_CONFIGURATION_TYPES "Debug;Release" CACHE INTERNAL "" FORCE)
mark_as_advanced(CMAKE_INSTALL_PREFIX)

set(CMAKE_CXX_STANDARD 11)

get_filename_component(path "${CMAKE_CURRENT_LIST_FILE}" PATH)
include("${path}/cotire/CMake/cotire.cmake")

if(MSVC)
    add_definitions(-D_CRT_SECURE_NO_WARNINGS=1)
endif()

macro(disable_warnings)
    if(NOT MSVC)
        set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -w")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -w")
    else()
        string(REGEX REPLACE "/W[0-9]+" "" CMAKE_C_FLAGS "${CMAKE_C_FLAGS}")
        string(REGEX REPLACE "/W[0-9]+" "" CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
        set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} /W0 /w /wd4244 /wd4267 /wd4996")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W0 /w /wd4244 /wd4267 /wd4996")
    endif()
endmacro()

macro(set_source_groups_with_dir prefix dir)
    foreach(file ${ARGN})
        string(REGEX REPLACE "^${prefix}/${dir}/" "${prefix}/" path "${prefix}/${file}")
        get_filename_component(path "${path}" PATH)
        string(REPLACE "/" "\\" path "${path}")
        source_group("${path}" FILES "${file}")
    endforeach()
endmacro()

macro(add_mesh)
    set(options)
    set(oneValueArgs INPUT OUTPUT)
    set(multiValueArgs DEPENDS)
    cmake_parse_arguments(MESH "${options}" "${oneValueArgs}" "${multiValueArgs}" ${ARGN})

    get_filename_component(infile "${MESH_INPUT}" ABSOLUTE)
    get_filename_component(outfile "${MESH_OUTPUT}" ABSOLUTE)

    set_source_groups_with_dir("Data Files/src" "data/src" "${MESH_INPUT}" ${MESH_DEPENDS})
    set_source_groups_with_dir("Data Files/bin" "data/bin" "${MESH_OUTPUT}")

    list(APPEND asset_src_files "${MESH_INPUT}" ${MESH_DEPENDS})
    list(APPEND asset_bin_files "${MESH_OUTPUT}")

    set_source_files_properties("${MESH_INPUT}" ${MESH_DEPENDS} PROPERTIES HEADER_FILE_ONLY TRUE)

    if(TARGET mesh2bin)
        set_source_files_properties("${outfile}" PROPERTIES GENERATED TRUE)
        add_custom_command(OUTPUT "${outfile}"
            COMMAND mesh2bin "${infile}" "${outfile}"
            DEPENDS mesh2bin "${infile}" ${MESH_DEPENDS}
            MAIN_DEPENDENCY "${infile}"
            WORKING_DIRECTORY "${CMAKE_BINARY_DIR}"
            )
    endif()
endmacro()

macro(pack_sprites)
    set(options)
    set(oneValueArgs OUTPUT WIDTH HEIGHT)
    set(multiValueArgs INPUT DEPENDS)
    cmake_parse_arguments(PACK "${options}" "${oneValueArgs}" "${multiValueArgs}" ${ARGN})

    set(infiles)
    foreach(file ${PACK_INPUT})
        get_filename_component(infile "${file}" ABSOLUTE)
        list(APPEND infiles "${infile}")
    endforeach()

    get_filename_component(outfile "${PACK_OUTPUT}" ABSOLUTE)

    set_source_groups_with_dir("Data Files/src" "data/src" ${PACK_INPUT} ${PACK_DEPENDS})
    set_source_groups_with_dir("Data Files/bin" "data/bin" "${PACK_OUTPUT}")

    list(APPEND asset_src_files ${PACK_INPUT} ${PACK_DEPENDS})
    list(APPEND asset_bin_files "${PACK_OUTPUT}")

    set_source_files_properties(${PACK_INPUT} ${PACK_DEPENDS} PROPERTIES HEADER_FILE_ONLY TRUE)

    if(TARGET packsprites)
        set(width 512)
        if(PACK_WIDTH)
            set(width "${PACK_WIDTH}")
        endif()

        set(height 512)
        if(PACK_HEIGHT)
            set(height "${PACK_HEIGHT}")
        endif()

        set_source_files_properties("${outfile}" PROPERTIES GENERATED TRUE)
        add_custom_command(OUTPUT "${outfile}"
            COMMAND packsprites -o "${outfile}" -w "${width}" -h "${height}" ${infiles}
            DEPENDS packsprites ${infiles} ${PACK_DEPENDS}
            WORKING_DIRECTORY "${CMAKE_BINARY_DIR}"
            )
    endif()
endmacro()
