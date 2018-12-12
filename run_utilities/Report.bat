@echo off
node  %cd%\resources\report-library\report.js
if exist %cd%\reports\recent\htmlreport\FinalReport.html start %cd%\reports\recent\htmlreport\FinalReport.html
if not exist %cd%\reports\recent\htmlreport\FinalReport.html Exit