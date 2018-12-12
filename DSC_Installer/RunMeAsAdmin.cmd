@echo off

rem This script is golden and is proven to work, 2016/10/13

echo This must be run from a cmd promt that is "Run As Administrator!" Detecting if you got it right...

net session >nul 2>&1
if %errorLevel% == 0 (
	echo Success: Administrative permissions confirmed! You did it right. Have a cookie!
) else (
	echo Failure: First, run cmd "as administrator" then rerun this script 
	GOTO:EOF
)

SET var=%~dp0
powershell "&set-executionpolicy Bypass;get-executionpolicy"
powershell -file "%var%\installer.ps1"

pause