#include "src/engine/mesh/Mesh.h"
#include "src/engine/mesh/VertexFormat.h"
#include "src/engine/mesh/VertexData.h"
#include <tinyxml.h>
#include <assimp/Importer.hpp>
#include <assimp/scene.h>
#include <assimp/postprocess.h>
#include <limits>
#include <string>
#include <cstdlib>
#include <cstdint>
#include <cstring>
#include <cstdio>
#include <cerrno>
#include <vector>
#include <memory>

#include "src/engine/mesh/VertexFormat.cpp"
#include "src/engine/mesh/VertexData.cpp"

#ifdef _MSC_VER
 #pragma warning(push, 0)
 #pragma warning(disable:4996)
#endif
#include "miniball/src/cpp/main/Seb.h"
#ifdef _MSC_VER
 #pragma warning(pop)
#endif

static const char* gOutputFile = nullptr;
static const char* gXmlFile = nullptr;
static std::string gInputDirectory;
static std::string gMeshFile;
static bool gPositions = true;
static bool gNormals = true;
static bool gTangents = true;
static bool gBitangents = true;
static bool gTexCoords0 = true;
static bool gColors = false;
static bool gFixInfacingNormals = true;
static bool gFlipUVs = true;
static std::vector<Mesh::Element> gMeshElements;
static std::unique_ptr<VertexData> gVertexData;
static std::vector<uint16_t> gIndexData;
static glm::vec3 gBoundingBoxMin;
static glm::vec3 gBoundingBoxMax;
static glm::vec3 gBoundingSphereCenter;
static float gBoundingSphereRadius;

static std::string stripFileName(const std::string& path)
{
    size_t index = path.rfind('/');

  #ifdef _WIN32
    size_t index2 = path.rfind('\\');
    if (index2 != std::string::npos && (index == std::string::npos || index2 > index))
        index = index2;
  #endif

    if (index == std::string::npos)
        return std::string();

    return path.substr(0, index + 1);
}

static void parseCommandLine(int argc, char** argv)
{
    for (int i = 1; i < argc; i++) {
        if (argv[i][0] == '-') {
            fprintf(stderr, "unknown command line option \"%s\".\n", argv[i]);
            exit(1);
        } else if (!gXmlFile)
            gXmlFile = argv[i];
        else if (!gOutputFile)
            gOutputFile = argv[i];
        else {
            fprintf(stderr, "too many files was specified on the command line.\n");
            exit(1);
        }
    }

    if (!gXmlFile) {
        fprintf(stderr, "missing input file on the command line.\n");
        exit(1);
    }
    if (!gOutputFile) {
        fprintf(stderr, "missing output file on the command line.\n");
        exit(1);
    }
}

static bool xmlToBool(const TiXmlElement* element)
{
    const char* text = element->GetText();
    if (text && !std::strcmp(text, "true"))
        return true;
    if (text && !std::strcmp(text, "false"))
        return false;

    fprintf(stderr, "in file \"%s\" at line %d, column %d: invalid value \"%s\" for element \"%s\".\n",
        gXmlFile, element->Row(), element->Column(), text, element->Value());
    exit(1);
}

static void readXmlFile()
{
    const std::string XML_ROOT = "Mesh";
    const std::string XML_FILE = "File";

    TiXmlDocument doc;
    if (!doc.LoadFile(gXmlFile)) {
        fprintf(stderr, "unable to parse file \"%s\": at line %d, column %d: %s\n",
            gXmlFile, doc.ErrorRow(), doc.ErrorCol(), doc.ErrorDesc());
        exit(1);
    }

    const TiXmlElement* root = doc.RootElement();
    if (root->ValueStr() != XML_ROOT) {
        fprintf(stderr, "unable to parse file \"%s\": root element is not a \"%s\".\n", gXmlFile, XML_ROOT.c_str());
        exit(1);
    }

    const char* meshFile = nullptr;

    for (const auto* element = root->FirstChildElement(); element; element = element->NextSiblingElement()) {
        if (element->ValueStr() == XML_FILE)
            meshFile = element->GetText();
        else if (element->ValueStr() == "IncludePositions")
            gPositions = xmlToBool(element);
        else if (element->ValueStr() == "IncludeNormals")
            gNormals = xmlToBool(element);
        else if (element->ValueStr() == "IncludeTangents")
            gTangents = xmlToBool(element);
        else if (element->ValueStr() == "IncludeBitangents")
            gBitangents = xmlToBool(element);
        else if (element->ValueStr() == "IncludeTexCoords0")
            gTexCoords0 = xmlToBool(element);
        else if (element->ValueStr() == "IncludeColors")
            gColors = xmlToBool(element);
        else if (element->ValueStr() == "FixInfacingNormals")
            gFixInfacingNormals = xmlToBool(element);
        else if (element->ValueStr() == "FlipUVs")
            gFlipUVs = xmlToBool(element);
        else {
            fprintf(stderr, "unable to parse file \"%s\": at line %d, column %d: unexpected element \"%s\".\n",
                gXmlFile, element->Row(), element->Column(), element->Value());
            exit(1);
        }
    }

    if (!meshFile) {
        fprintf(stderr, "missing element \"%s\" in \"%s\".\n", XML_FILE.c_str(), gXmlFile);
        exit(1);
    }

    gMeshFile = meshFile;
}

static void readMeshFile()
{
    Assimp::Importer importer;

    importer.SetPropertyInteger(AI_CONFIG_PP_FD_REMOVE, 1);
    importer.SetPropertyInteger(AI_CONFIG_PP_RVC_FLAGS, aiComponent_LIGHTS | aiComponent_CAMERAS);
    importer.SetPropertyInteger(AI_CONFIG_PP_SLM_VERTEX_LIMIT, 65535);
    importer.SetPropertyInteger(AI_CONFIG_PP_SLM_TRIANGLE_LIMIT, std::numeric_limits<int>::max());
    importer.SetPropertyInteger(AI_CONFIG_PP_SBP_REMOVE,
        aiPrimitiveType_POINT | aiPrimitiveType_LINE | aiPrimitiveType_POLYGON);

    unsigned flags = 0
        | aiProcess_Triangulate
        | aiProcess_SortByPType
        | aiProcess_RemoveComponent
        | aiProcess_RemoveRedundantMaterials
        | aiProcess_FindInvalidData
        | aiProcess_OptimizeMeshes
        | aiProcess_SplitLargeMeshes
        | aiProcess_JoinIdenticalVertices
        | aiProcess_ImproveCacheLocality
        | aiProcess_PreTransformVertices
        ;

    uint8_t meshComponents = 0;
    if (gPositions)
        meshComponents |= VertexFormat::Position;

    if (gNormals || gTangents || gBitangents) {
        flags |= aiProcess_GenSmoothNormals;
        if (gFixInfacingNormals)
            flags |= aiProcess_FixInfacingNormals;

        if (gNormals)
            meshComponents |= VertexFormat::Normal;

        if (gTangents || gBitangents) {
            flags |= aiProcess_CalcTangentSpace;
            if (gTangents)
                meshComponents |= VertexFormat::Tangent;
            if (gBitangents)
                meshComponents |= VertexFormat::Bitangent;
        }
    }

    if (gTexCoords0) {
        flags |= aiProcess_GenUVCoords | aiProcess_TransformUVCoords;
        if (gFlipUVs)
            flags |= aiProcess_FlipUVs;

        meshComponents |= VertexFormat::TexCoord0;
    }

    if (gColors)
        meshComponents |= VertexFormat::Color;

    if (meshComponents == 0) {
        fprintf(stderr, "no vertex components to process.\n");
        exit(1);
    }

    VertexFormat vertexFormat(meshComponents);

    std::string meshFilePath = gInputDirectory + gMeshFile;
    const aiScene* scene = importer.ReadFile(meshFilePath, flags);
    if (!scene) {
        fprintf(stderr, "unable to read file \"%s\".\n", meshFilePath.c_str());
        exit(1);
    }

    gMeshElements.reserve(scene->mNumMeshes);

    gVertexData.reset(new VertexData(vertexFormat));
    size_t vertexDataCurrentBase = 0;
    size_t vertexDataCurrentEnd = 0;

    bool firstVertex = true;
    VertexPosition min;
    VertexPosition max;

    std::vector<VertexPosition> allPoints;
    aiString materialName;

    for (size_t meshIndex = 0; meshIndex < scene->mNumMeshes; meshIndex++) {
        const aiMesh* sceneMesh = scene->mMeshes[meshIndex];

        if (sceneMesh->mPrimitiveTypes != aiPrimitiveType_TRIANGLE)
            continue;

        size_t vertexCount = sceneMesh->mNumVertices;
        if (vertexCount > 65535) {
            fprintf(stderr, "internal error: too many vertices.\n");
            exit(1);
        }

        size_t indexCount = 0;
        for (size_t i = 0; i < sceneMesh->mNumFaces; i++) {
            if (sceneMesh->mFaces[i].mNumIndices != 3)
                continue;
            indexCount += 3;
        }

        if (vertexCount == 0 || indexCount < 3)
            continue;

        const bool hasPositions = sceneMesh->HasPositions();
        const bool hasColors = sceneMesh->HasVertexColors(0);
        const bool hasTexCoords0 = sceneMesh->HasTextureCoords(0);
        const bool hasNormals = sceneMesh->HasNormals();
        const bool hasTangents = hasNormals && sceneMesh->HasTangentsAndBitangents();

        gMeshElements.emplace_back();
        auto& element = gMeshElements.back();
        if (gMeshElements.size() > 255) {
            fprintf(stderr, "mesh \"%s\" has too many elements.\n", meshFilePath.c_str());
            exit(1);
        }

        size_t vertexDataSize = gVertexData->vertexCount();
        if (vertexDataCurrentEnd + vertexCount > 65535) {
            vertexDataCurrentBase = vertexDataSize;
            vertexDataCurrentEnd = 0;
        }

        std::memset(&element, 0, sizeof(element));
        element.bufferOffset = uint32_t(vertexDataCurrentBase);
        element.firstIndex = uint32_t(gIndexData.size());
        element.indexCount = uint32_t(indexCount);

        size_t indexBase = vertexDataCurrentEnd;
        vertexDataCurrentEnd += vertexCount;

        gVertexData->setVertexCount(vertexDataSize + vertexCount);
        allPoints.reserve(allPoints.size() + vertexCount);

        for (size_t i = 0; i < vertexCount; i++) {
            size_t offset = vertexDataCurrentBase + i;

            if (hasPositions && gPositions) {
                auto& position = vertexFormat.position(gVertexData->data(), offset);
                position.x = sceneMesh->mVertices[i].x;
                position.y = sceneMesh->mVertices[i].y;
                position.z = sceneMesh->mVertices[i].z;

                if (!firstVertex) {
                    min = glm::min(min, position);
                    max = glm::max(max, position);
                } else {
                    min = position;
                    max = position;
                    firstVertex = false;
                }

                allPoints.emplace_back(position);
            }

            if (hasNormals && gNormals) {
                auto& normal = vertexFormat.normal(gVertexData->data(), offset);
                normal.x = sceneMesh->mNormals[i].x;
                normal.y = sceneMesh->mNormals[i].y;
                normal.z = sceneMesh->mNormals[i].z;
            }

            if (hasTangents && gTangents) {
                auto& tangent = vertexFormat.tangent(gVertexData->data(), offset);
                tangent.x = sceneMesh->mTangents[i].x;
                tangent.y = sceneMesh->mTangents[i].y;
                tangent.z = sceneMesh->mTangents[i].z;
            }

            if (hasTangents && gBitangents) {
                auto& bitangent = vertexFormat.bitangent(gVertexData->data(), offset);
                bitangent.x = sceneMesh->mBitangents[i].x;
                bitangent.y = sceneMesh->mBitangents[i].y;
                bitangent.z = sceneMesh->mBitangents[i].z;
            }

            if (hasTexCoords0 && gTexCoords0) {
                auto& texCoord = vertexFormat.texCoord0(gVertexData->data(), offset);
                texCoord.x = sceneMesh->mTextureCoords[0][i].x;
                texCoord.y = sceneMesh->mTextureCoords[0][i].y;
            }

            if (gColors) {
                auto& color = vertexFormat.color(gVertexData->data(), offset);
                if (hasColors) {
                    color[0] = uint8_t(glm::clamp(int(sceneMesh->mColors[0][i].r * 255.0f), 0, 255));
                    color[1] = uint8_t(glm::clamp(int(sceneMesh->mColors[0][i].g * 255.0f), 0, 255));
                    color[2] = uint8_t(glm::clamp(int(sceneMesh->mColors[0][i].b * 255.0f), 0, 255));
                    color[3] = uint8_t(glm::clamp(int(sceneMesh->mColors[0][i].a * 255.0f), 0, 255));
                } else {
                    color[0] = 0xFF;
                    color[1] = 0xFF;
                    color[2] = 0xFF;
                    color[3] = 0xFF;
                }
            }
        }

        gIndexData.reserve(gIndexData.size() + indexCount);
        for (size_t i = 0; i < sceneMesh->mNumFaces; i++) {
            if (sceneMesh->mFaces[i].mNumIndices != 3)
                continue;
            gIndexData.emplace_back(uint16_t(sceneMesh->mFaces[i].mIndices[0] + indexBase));
            gIndexData.emplace_back(uint16_t(sceneMesh->mFaces[i].mIndices[1] + indexBase));
            gIndexData.emplace_back(uint16_t(sceneMesh->mFaces[i].mIndices[2] + indexBase));
        }
    }

    gBoundingBoxMin = min;
    gBoundingBoxMax = max;

    if (allPoints.empty()) {
        gBoundingSphereCenter = glm::vec3(0.0f);
        gBoundingSphereRadius = 0.0f;
    } else {
        Seb::Smallest_enclosing_ball<float, glm::vec3> sphereCalculator(3, allPoints);
        const float* c = sphereCalculator.center_begin();
        gBoundingSphereCenter = glm::vec3(c[0], c[1], c[2]);
        gBoundingSphereRadius = sphereCalculator.radius();
    }
}

static void writeMeshFile()
{
    FILE* f = fopen(gOutputFile, "wb");
    if (!f) {
        fprintf(stderr, "unable to create file \"%s\": %s\n", gOutputFile, strerror(errno));
        exit(1);
    }

    auto write = [f](const void* data, size_t size) {
        size_t bytesWritten = fwrite(data, 1, size, f);
        if (ferror(f)) {
            fprintf(stderr, "unable to write file \"%s\": %s\n", gOutputFile, strerror(errno));
            fclose(f);
            remove(gOutputFile);
            exit(1);
        }
        if (bytesWritten != size) {
            fprintf(stderr, "unable to write file \"%s\": %s\n", gOutputFile, "incomplete write.");
            fclose(f);
            remove(gOutputFile);
            exit(1);
        }
    };

    static_assert(sizeof(Mesh::FileHeader) == 14 * sizeof(uint32_t), "sizeof(Mesh::FileHeader)");
    static_assert(sizeof(Mesh::Element) == 4 * sizeof(uint32_t), "sizeof(Mesh::Element)");

    Mesh::FileHeader header;
    std::memset(&header, 0, sizeof(header));
    header.magic = Mesh::Magic;
    header.vertexBufferSize = uint32_t(gVertexData->sizeInBytes());
    header.indexBufferSize = uint32_t(gIndexData.size() * sizeof(uint16_t));
    header.bboxMin = gBoundingBoxMin;
    header.bboxMax = gBoundingBoxMax;
    header.boundingSphereCenter = gBoundingSphereCenter;
    header.boundingSphereRadius = gBoundingSphereRadius;
    header.vertexFormat = uint8_t(gVertexData->format().components());
    header.elementCount = uint8_t(gMeshElements.size());
    write(&header, sizeof(header));

    for (const auto& element : gMeshElements)
        write(&element, sizeof(element));

    write(gVertexData->data(), gVertexData->sizeInBytes());
    write(gIndexData.data(), gIndexData.size() * sizeof(uint16_t));

    if (fflush(f) != 0) {
        fprintf(stderr, "unable to write file \"%s\": %s\n", gOutputFile, strerror(errno));
        fclose(f);
        remove(gOutputFile);
        exit(1);
    }

    fclose(f);
}

static void printInfo()
{
    std::string outputFile = gOutputFile;
    if (outputFile.length() > 79)
        outputFile = "..." + outputFile.substr(outputFile.length() - 76);

    auto center = (gBoundingBoxMin + gBoundingBoxMax) * 0.5f;
    printf(
        "==============================================================================\n"
        "%s\n"
        "------------------------------------------------------------------------------\n"
        "Total vertices:  %lu (%.2f KB)\n"
        "Total indices:   %lu (%.2f KB)\n"
        "Total triangles: %lu\n"
        "AABB min:        %-10f %15f %15f\n"
        "AABB max:        %-10f %15f %15f\n"
        "AABB center:     %-10f %15f %15f\n"
        "Sphere center:   %-10f %15f %15f\n"
        "Sphere radius:   %-10f\n"
        "==============================================================================\n",
        outputFile.c_str(),
        static_cast<unsigned long>(gVertexData->vertexCount()), float(gVertexData->sizeInBytes()) / 1024.0f,
        static_cast<unsigned long>(gIndexData.size()), float(gIndexData.size() * sizeof(uint16_t)) / 1024.0f,
        static_cast<unsigned long>(gIndexData.size() / 3),
        gBoundingBoxMin.x, gBoundingBoxMin.y, gBoundingBoxMin.z,
        gBoundingBoxMax.x, gBoundingBoxMax.y, gBoundingBoxMax.z,
        center.x, center.y, center.z,
        gBoundingSphereCenter.x, gBoundingSphereCenter.y, gBoundingSphereCenter.z,
        gBoundingSphereRadius
        );
}

int main(int argc, char** argv)
{
    parseCommandLine(argc, argv);
    gInputDirectory = stripFileName(gXmlFile);
    readXmlFile();
    readMeshFile();
    writeMeshFile();
    printInfo();
    return 0;
}
