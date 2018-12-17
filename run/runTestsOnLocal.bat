@echo off

cd..
cd resources

::call grunt updateTestData

call grunt local
call grunt report

::cd..

cd resources
::call grunt emailableReport

pause
