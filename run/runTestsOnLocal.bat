@echo off

cd..
cd resources

::call grunt updateTestData

call grunt default

call grunt report

::cd..

cd resources
::call grunt emailableReport

pause
