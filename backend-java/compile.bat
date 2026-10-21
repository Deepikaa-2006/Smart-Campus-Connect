@echo off
echo ========================================================
echo  Compiling Java Servlets, DAOs, and JDBC Module...
echo ========================================================

if not exist "bin" mkdir bin

javac -encoding UTF-8 -d bin -cp "lib/*" src/com/smartcampus/config/*.java src/com/smartcampus/dao/*.java src/com/smartcampus/servlets/*.java src/com/smartcampus/server/*.java

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] All Java classes compiled successfully into bin/!
) else (
    echo [ERROR] Compilation failed. Please inspect the errors above.
)
