@echo off

cd "%~dp0"
if errorlevel 1 goto error

if not exist _build.emscripten mkdir _build.emscripten
if errorlevel 1 goto error

cd _build.emscripten
cmake -G "MinGW Makefiles" ^
    -DCMAKE_BUILD_TYPE=Release ^
    -DCMAKE_TOOLCHAIN_FILE="%~dp0cmake/emscripten.cmake" ^
    -DEMSCRIPTEN_ROOT_PATH=D:\emsdk\emscripten\1.37.40 ^
    ..
if errorlevel 1 goto error

mingw32-make -j 4
if errorlevel 1 goto error

:end
exit /b 0

:error
echo *** ERROR ***
exit /b 1
