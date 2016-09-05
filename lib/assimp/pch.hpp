
#pragma once

#include <memory>
#include <functional>
#include <numeric>
#include <cctype>
#include <cassert>
#include <cstdint>
#include <cstdlib>
#include <cmath>
#include <stack>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <fstream>
#include <string>
#include <map>
#include <vector>
#include <list>
#include <unordered_map>
#include <algorithm>

#include <sys/stat.h>
#include <math.h>
#include <time.h>
#include <stdint.h>
#include <stdlib.h>
#include <stdarg.h>
#include <zlib.h>

#include "src/include/assimp/cfileio.h"
#include "src/include/assimp/ai_assert.h"
#include "src/include/assimp/DefaultLogger.hpp"
#include "src/include/assimp/IOSystem.hpp"
#include "src/include/assimp/IOStream.hpp"
#include "src/include/assimp/Exporter.hpp"
#include "src/include/assimp/Importer.hpp"
#include "src/include/assimp/scene.h"
#include "src/include/assimp/version.h"
#include "src/include/assimp/anim.h"
#include "src/include/assimp/light.h"
#include "src/include/assimp/mesh.h"
#include "src/include/assimp/material.h"
#include "src/include/assimp/texture.h"
#include "src/include/assimp/types.h"
#include "src/include/assimp/postprocess.h"
#include "src/include/assimp/matrix4x4.h"
#include "src/include/assimp/vector3.h"
#include "src/include/assimp/vector2.h"
#include "src/include/assimp/color4.h"
#include "src/include/assimp/defs.h"

#include "src/code/Macros.h"
#include "src/code/Defines.h"
#include "src/code/LogAux.h"
#include "src/code/BaseImporter.h"
#include "src/code/BaseProcess.h"
#include "src/code/TinyFormatter.h"
#include "src/code/Exceptional.h"
#include "src/code/TargetAnimation.h"
#include "src/code/StringComparison.h"
#include "src/code/Importer.h"
#include "src/code/ParsingUtils.h"
#include "src/code/StandardShapes.h"
#include "src/code/PolyTools.h"
#include "src/code/Profiler.h"
#include "src/code/DefaultProgressHandler.h"
#include "src/code/SceneCombiner.h"
#include "src/code/SkeletonMeshBuilder.h"
#include "src/code/Subdivision.h"
#include "src/code/FileSystemFilter.h"
#include "src/code/MaterialSystem.h"
#include "src/code/ProcessHelper.h"
#include "src/code/DefaultIOSystem.h"
#include "src/code/DefaultIOStream.h"
#include "src/code/StreamReader.h"
#include "src/code/StreamWriter.h"
#include "src/code/ScenePrivate.h"
#include "src/code/GenericProperty.h"
#include "src/code/MemoryIOWrapper.h"
#include "src/code/Hash.h"
#include "src/code/irrXMLWrapper.h"
#include "src/code/LineSplitter.h"
#include "src/code/fast_atof.h"
#include "src/code/CInterfaceIOWrapper.h"
#include "src/code/ByteSwapper.h"
#include "src/code/RemoveComments.h"
#include "src/code/SpatialSort.h"
#include "src/code/SGSpatialSort.h"
#include "src/code/VertexTriangleAdjacency.h"
#include "src/code/StdOStreamLogStream.h"

#include "src/contrib/irrXML/irrString.h"
#include "src/contrib/irrXML/irrArray.h"
#include "src/contrib/irrXML/CXMLReaderImpl.h"
#include "src/contrib/ConvertUTF/ConvertUTF.h"
#include "src/contrib/poly2tri/poly2tri/poly2tri.h"

#ifndef ASSIMP_BUILD_NO_FBX_IMPORTER
#include "src/code/FBXConverter.h"
#include "src/code/FBXDocument.h"
#include "src/code/FBXProperties.h"
#include "src/code/FBXParser.h"
#include "src/code/FBXImportSettings.h"
#include "src/code/FBXImporter.h"
#include "src/code/FBXUtil.h"
#endif

#ifndef ASSIMP_BUILD_NO_IFC_IMPORTER
#include "src/code/IFCLoader.h"
#include "src/code/IFCReaderGen.h"
#endif

#ifndef ASSIMP_BUILD_NO_COLLADA_IMPORTER
#include "src/code/ColladaLoader.h"
#include "src/code/ColladaParser.h"
#include "src/code/ColladaHelper.h"
#endif

#ifndef ASSIMP_BUILD_NO_BLEND_IMPORTER
#include "src/code/BlenderBMesh.h"
#include "src/code/BlenderDNA.h"
#include "src/code/BlenderLoader.h"
#include "src/code/BlenderScene.h"
#include "src/code/BlenderSceneGen.h"
#include "src/code/BlenderTessellator.h"
#endif
