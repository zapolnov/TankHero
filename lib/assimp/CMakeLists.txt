
disable_warnings()

add_definitions(-DOPENDDLPARSER_BUILD)
add_definitions(-DASSIMP_BUILD_NO_OWN_ZLIB)

add_definitions(-DASSIMP_BUILD_NO_3D_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_3MF_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_AC_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_ASE_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_ASSBIN_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_B3D_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_BVH_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_C4D_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_COB_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_CSM_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_DXF_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_GLTF_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_HMP_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_IFC_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_IRR_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_IRRMESH_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_LWO_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_LWS_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_MD2_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_MD3_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_MD5_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_MDC_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_MDL_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_MS3D_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_NDO_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_NFF_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_OFF_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_OGRE_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_OPENGEX_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_PLY_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_Q3BSP_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_Q3D_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_RAW_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_SIB_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_SMD_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_STL_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_TERRAGEN_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_X_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_XGL_IMPORTER)
add_definitions(-DASSIMP_BUILD_NO_EXPORT)

set(GIT_BRANCH "master")
set(GIT_COMMIT_HASH 0)
configure_file("src/revision.h.in" "${CMAKE_CURRENT_BINARY_DIR}/revision.h")

set(AI_DOUBLE_PRECISION FALSE)
file(MAKE_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/assimp")
configure_file("src/include/assimp/config.h.in" "${CMAKE_CURRENT_BINARY_DIR}/assimp/config.h")

set(generated
    "${CMAKE_CURRENT_BINARY_DIR}/revision.h"
    "${CMAKE_CURRENT_BINARY_DIR}/assimp/config.h"
)

set(src
    src/code/3DSConverter.cpp
    src/code/3DSLoader.cpp
    src/code/BaseImporter.cpp
    src/code/BaseProcess.cpp
    src/code/Bitmap.cpp
    src/code/BlenderBMesh.cpp
    src/code/BlenderDNA.cpp
    src/code/BlenderLoader.cpp
    src/code/BlenderModifier.cpp
    src/code/BlenderScene.cpp
    src/code/BlenderTessellator.cpp
    src/code/CalcTangentsProcess.cpp
    src/code/ColladaLoader.cpp
    src/code/ColladaParser.cpp
    src/code/ComputeUVMappingProcess.cpp
    src/code/ConvertToLHProcess.cpp
    src/code/DeboneProcess.cpp
    src/code/DefaultIOStream.cpp
    src/code/DefaultIOSystem.cpp
    src/code/DefaultLogger.cpp
    src/code/FBXAnimation.cpp
    src/code/FBXBinaryTokenizer.cpp
    src/code/FBXConverter.cpp
    src/code/FBXDeformer.cpp
    src/code/FBXDocument.cpp
    src/code/FBXDocumentUtil.cpp
    src/code/FBXImporter.cpp
    src/code/FBXMaterial.cpp
    src/code/FBXMeshGeometry.cpp
    src/code/FBXModel.cpp
    src/code/FBXNodeAttribute.cpp
    src/code/FBXParser.cpp
    src/code/FBXProperties.cpp
    src/code/FBXTokenizer.cpp
    src/code/FBXUtil.cpp
    src/code/FindDegenerates.cpp
    src/code/FindInstancesProcess.cpp
    src/code/FindInvalidDataProcess.cpp
    src/code/FixNormalsStep.cpp
    src/code/GenFaceNormalsProcess.cpp
    src/code/GenVertexNormalsProcess.cpp
    src/code/Importer.cpp
    src/code/ImporterRegistry.cpp
    src/code/ImproveCacheLocality.cpp
    src/code/JoinVerticesProcess.cpp
    src/code/LimitBoneWeightsProcess.cpp
    src/code/MakeVerboseFormat.cpp
    src/code/MaterialSystem.cpp
    src/code/ObjFileImporter.cpp
    src/code/ObjFileMtlImporter.cpp
    src/code/ObjFileParser.cpp
    src/code/OptimizeGraph.cpp
    src/code/OptimizeMeshes.cpp
    src/code/PostStepRegistry.cpp
    src/code/PretransformVertices.cpp
    src/code/ProcessHelper.cpp
    src/code/RemoveComments.cpp
    src/code/RemoveRedundantMaterials.cpp
    src/code/RemoveVCProcess.cpp
    src/code/SceneCombiner.cpp
    src/code/ScenePreprocessor.cpp
    src/code/SGSpatialSort.cpp
    src/code/SkeletonMeshBuilder.cpp
    src/code/SortByPTypeProcess.cpp
    src/code/SpatialSort.cpp
    src/code/SplitByBoneCountProcess.cpp
    src/code/SplitLargeMeshes.cpp
    src/code/StandardShapes.cpp
    src/code/Subdivision.cpp
    src/code/TargetAnimation.cpp
    src/code/TextureTransform.cpp
    src/code/TriangulateProcess.cpp
    src/code/ValidateDataStructure.cpp
    src/code/Version.cpp
    src/code/VertexTriangleAdjacency.cpp
    src/contrib/ConvertUTF/ConvertUTF.c
    src/contrib/irrXML/irrXML.cpp
    pch.hpp
)

set_source_groups_with_dir("Source Files" "src" ${src})
source_group("Generated Files" FILES ${generated})

add_library(assimp STATIC ${generated} ${src})
target_link_libraries(assimp zlib)

set_target_properties(assimp PROPERTIES
    FOLDER "Libraries"
    COTIRE_CXX_PREFIX_HEADER_INIT "${CMAKE_CURRENT_SOURCE_DIR}/pch.hpp"
    COTIRE_ENABLE_PRECOMPILED_HEADER TRUE
    COTIRE_ADD_UNITY_BUILD FALSE
    )

target_include_directories(assimp BEFORE PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/src/contrib/openddlparser/include"
    )

target_include_directories(assimp BEFORE PUBLIC
    "${CMAKE_CURRENT_SOURCE_DIR}/src/include"
    "${CMAKE_CURRENT_BINARY_DIR}"
    )

target_include_directories(assimp SYSTEM BEFORE PUBLIC
    "${CMAKE_CURRENT_SOURCE_DIR}/src/include"
    "${CMAKE_CURRENT_BINARY_DIR}"
    )

if(MSVC)
    cotire(assimp)
endif()
