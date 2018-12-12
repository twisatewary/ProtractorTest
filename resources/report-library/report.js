
var xml2js = require('./xml2js');
var mkdirp=require('./mkdirp');
var parser = new xml2js.Parser();
var jade = require('./jade');
var fsExtra=require('./fs-extra');
var fs = require('fs');

var now = new Date();
var summary = {
    x:1,
    totalTests:0,
    totalSuccess:0,
    totalFailures:0,
    totalSkipped:0,
    totalExecutionTime:0,
    totalExecutionTimeString:'',
    numTests: 0,
    suiteCount:0,
    numFailures: 0,
    numSuccess: 0,
    summaryReportGenDateTime: now.toLocaleString(),
    suites: []
};

var jadeTemplateIndexHtml =
    "doctype html\n" +
    "html(lang='en')\n" +
    "    meta(charset='utf-8')\n" +
    "    meta(http-equiv='X-UA-Compatible', content='IE=edge')\n" +
    "    meta(name='viewport', content='width=device-width, initial-scale=1')\n" +
    "    title Protractor Test Report\n" +
    "    script(type='text/javascript', src='https://www.google.com/jsapi') \n"+
    "    script(type='text/javascript'). \n"+
    "      google.load('visualization', '1', {packages:['corechart']}); \n" +
    "      google.setOnLoadCallback(drawSummaryChart);\n" +
    "      function drawSummaryChart() {\n" +
    "        var data = google.visualization.arrayToDataTable([\n" +
    "          ['Result', 'Number of Tests'],\n" +
    "          ['Success', #{totalSuccess}],\n" +
    "          ['Failure', #{totalFailures}],\n" +
    "          ['Skipped', #{totalSkipped}],\n" +
    "        ]);\n" +
    "        var options = {\n" +
    "          'chartArea': {'width': '90%', 'height': '90%'},\n" +
    "          'legend': 'none',\n" +
    "          colors: ['#4ca64c', '#FE2E2E', '#ffff00']\n" +
    "        };\n" +
    "        var chart = new google.visualization.PieChart(document.getElementById('summaryPieChart'));\n" +
    "        chart.draw(data, options);\n" +
    "      }\n" +
    "  \n"+
    "  head\n" +
    "    meta(http-equiv='Content-Type', content='text/html; charset=UTF-8')\n"+
    "    style. \n"+
    "      ul,li{margin-left:0;padding-left:0;width:100%;font-weight:bold;}table{width:95%;text-align:left;border-spacing:0;border-collapse: separate;margin-bottom:5px;}li{font-weight:bold;padding-left:5px;list-style:none;}ul table li{font-weight: normal}th,td{padding: 10px;border: 1px solid #000;}td.desc-col{width:390px;margin-left:20px;}th.desc-col{width: 390px;}td.status-col{width:75px;}th.status-col{width: 75px;}td.browser-col{width:150px;}th.browser-col{width: 150px;}td.os-col{width:90px;}th.os-col{width: 90px;}td.msg-col{width:300px;}th.msg-col{width: 300px;}table.header{background-color: gray; color: #fff;margin-left:20px;}.traceinfo{position: fixed;top: 0; bottom: 0;left: 0;right:0;background: rgba(0,0,0,0.8);z-index: 99999;opacity:0;-webkit-transition: opacity 400ms ease-in;transition: opacity 400ms ease-in;pointer-events: none;}.traceinfo.visible{opacity:1;pointer-events: auto;}.traceinfo > div{width: 400px;position: relative;margin: 10% auto;padding: 5px 20px 13px 20px;background: #fff;}.traceinfo .close{background: #606061;color: #FFFFFF;line-height: 25px;position: absolute;right: -12px;text-align: center;top: -10px;width: 24px;text-decoration: none;font-weight: bold;}.traceinfo .close:hover{background: #00d9ff;}body{width:100%;style='font-family:Arial;'} \n"+
    "  body\n"+
    "    div(style='margin-left:20px;')\n" +
    "        h1 Protractor Test Results\n"+
    "        .logo(style='margin-left:20px; margin-right:40px;')\n" +
    "          a(href='http://www.zenq.com ' target='_blank')\n"+
    "           img(src='http://zenq.com/Portals/0/logo.png',align='right', width='10%', height='10%')\n"+
    "    div#summaryPieChart(style='width: 420px; height: 170px;')\n" +
    "    div(style='background-color:gray; color:white; margin-left:20px; margin-right:40px; padding:4px;')\n" +
    "      .viewlog(style='text-align: right; align:right') \n"+
   // "       button(type='button',target='_blank',onClick='location.href=(../../../logs/logFile.log)') View Log\n"+
    "       a(type='button',href='../../../logs/logFile.log',target='_blank') View LogOutput\n"+
    "      h2 \n" +
    "        u Result Summary \n "+
    "      b Total Test Cases \n "+
    "      |: \n" +
    "      b #{totalTests} \n "+
    "       br\n"+
    "      b Total Tests Passed \n "+
    "      |: \n" +
    "      b #{totalSuccess} \n "+
    "       br\n"+
    "      b Total Tests Failed \n "+
    "      |: \n" +
    "      b #{totalFailures} \n "+
    "       br\n"+
    "      b Total Tests Skipped \n "+
    "      |: \n" +
    "      b #{totalSkipped} \n "+
    "       br\n"+
    "      b Total Time Taken \n "+
    "      |: \n" +
    "      b #{totalExecutionTimeString} \n "+
    "       br\n"+
    "      b This report is generated on \n "+
    "      |: \n" +
    "      b #{summaryReportGenDateTime} \n "+
    "    br\n"+
    "    br\n"+
    "    table.header\n"+
    "      tr\n"+
    "        th.desc-col(style='width:30%;text-align:center') Description\n"+
    "        th.status-col(style='width:10%;text-align:center') Status\n"+
    "        th.browser-col(style='width:10%;text-align:center') Browser\n"+
    "        th.os-col(style='width:10%;text-align:center') OS\n"+
    "        th.msg-col(style='width:30%;text-align:center') Message\n"+
    "        th.img-col(style='width:10%;text-align:center') Screenshot\n"+
    "    - each suite in suites\n" +
    "      li(style='margin-left:20px;')\n"+
    "        h3.span= suite.name \n "+
    "      table(style='margin-left:20px;table-layout: fixed')\n"+
    "        - each testcase in suite.cases\n" +
    "          tr.status\n"+
    "            td.desc-col(style='width:30%;table-layout:fixed;')\n" +
    "              span= testcase.name \n"+
    "              -if (testcase.failures.length > 0)\n" +
    "                td.status-col(style='color:#fff;background-color: #FE2E2E;width:10%; text-align:center') Fail\n" +
    "                td.browser-col(style='width:10%;overflow-y: hidden;text-align:center') \n " +
    "                  span= suite.browserName+' v '+suite.browserVersion \n"+
    "                td.os-col(style='width:10%;overflow-y: hidden;text-align:center')\n"+
    "                  span= suite.osName \n"+
    "              -else if (testcase.numSkipped > 0)\n" +
    "                td.status-col(style='color:##ffff00;background-color: #ffff00;width:10%;text-align:center') Skipped \n"+
    "                td.browser-col(style='width:10%;text-align:center') \n " +
    "                  span= suite.browserName+' v '+suite.browserVersion \n"+
    "                td.os-col(style='width:10%;text-align:center')\n"+
    "                  span= suite.osName \n"+
    "                td.msg-col(style='width:30%;text-align:center;overflow-y:hidden;') Temporarily disabled with xit \n " +
    "                td.img-col(style='width:10%;text-align:center') -- \n"+
    "              -else\n" +
    "                td.status-col(style='color:#fff;background-color: green;width:10%; text-align:center') Pass\n"+
    "                td.browser-col(style='width:10%;overflow-y: hidden;text-align:center') \n " +
    "                  span= suite.browserName+' v '+suite.browserVersion \n"+
    "                td.os-col(style='width:10%;overflow-y: hidden;text-align:center')\n"+
    "                  span= suite.osName \n"+
    "                td.msg-col(style='width:30%;overflow-y: hidden;text-align:center') Passed \n " +
    "                td.img-col(style='width:10%;text-align:center') -- \n"+
    "            - each failure in testcase.failures\n" +
    "              -if(testcase.failures.length > 0 && failure.message && failure.message.message && failure.message.message.length > 0)\n" +
    "               td.msg-col(style='width:30%;overflow-x:scroll;overflow-y:hidden;')\n " +
    "                 span= failure.message.message\n" +
    "                td.img-col(style='width:10%;text-align:center')\n"+
    "                  a(class='button',href=suite.screenshotUrl+suite.platformName+'-'+suite.browserName +'-' + suite.name +' '+ testcase.name +'-expect failure-'+0+'.png',target='_blank') View\n"+
    "\n"+
    "script(src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js')\n" +
    "script(src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js')";

var backup=function(){


    (function deleteDuplicateImages(){
        var screenshotsPath="././reports/recent/screenshots/";
        fs.readdir(screenshotsPath,function(err,files ) {
            files.forEach(function(file){
                for(i=0;i<files.length; i++){
                    var screenshotName=file.split("-");
                    var fileToBeremoved=screenshotsPath + screenshotName[0]+"-"+screenshotName[1]+"-"+screenshotName[2]+"-"+[i+1]+".png";
                    if(fs.existsSync(fileToBeremoved)) {
                        fs.unlinkSync(fileToBeremoved);
                    }
                }
            })
        });
    }());

    var month = [];
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "Aug";
    month[8] = "Sept";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";

    var date = new Date();
    var day = date.getDate();
    var monthString = month[date.getMonth()];
    var year = date.getFullYear();
    var hours=date.getHours();
    var min= date.getMinutes();
    var backup_dir="././reports/backupReport"+"_"+day+"-"+(monthString)+"-"+year+"_"+hours+"_"+min;
    var screenshots=backup_dir+'/screenshots';
    var htmlreports=backup_dir+'/htmlreport';
    mkdirp(backup_dir,function(err){
        if(err)
            console.log(err);
        else {
            if(fs.existsSync("././reports/screenshots")) {
                mkdirp(screenshots, function (err) {
                    if (err)
                        console.log('');
                });
            }
            else{
                console.log("**All Tests are passed, No Screenshots generated**")
            }
            mkdirp(htmlreports, function (err) {
                if (err)
                    console.log(err);
            });
        }
    });
    setTimeout(function(){
        if(fs.existsSync(backup_dir)) {
            fsExtra.copy("././reports/recent/htmlreport",htmlreports,function(err){
                if(err)
                    return console.log(err);

                console.log("Html report backup success")
            });
        }
        if(fs.existsSync(backup_dir)) {
            fsExtra.copy("././reports/recent/screenshots",screenshots,function(err){
                if(err)
                    console.log("**All Tests are passed, No Screenshots available**");
                else
                    console.log("screenshots backup success")
            });
        }
    });
};


var p="./reports/xmlfiles";
var passed=0;
var passed1=0;
fs.readdir(p,function(err,files ){
    if(err)
        console.log("No xml files generated");
    else {

        backup();
        files.forEach(function (file) {
            var xml = fs.readFileSync("./reports/xmlfiles/" + file, {encoding: 'utf-8'});// reading xml files
            var parsingSuccess = true;
            parser.parseString(xml, function (err, json) {
                if (err) {
                    console.log("An error occured while processing test suite report: " + err);
                    parsingSuccess = false;
                    return;
                }
                var testsuites = json.testsuites;
                var testsuiteArray = testsuites.testsuite;
                for (var i = 0; i < testsuiteArray.length; i++) {
                    var testsuite = testsuiteArray[i].$;
                    var suiteName = testsuite.name;
                    var divide=file.split('-');
                    var suite = {
                        platformName:divide[0].split('.')[0],
                        browserName: divide[0].split('.')[1],
                        browserVersion:divide[0].split('.')[2],
                        osName: divide[1].split('.')[0],
                        screenshotUrl: '',
                        totlTests:'',
                        name: suiteName,
                        count: summary.x++,
                        numTests: Number(testsuite.tests),
                        numSkipped: Number(testsuite.skipped),
                        numFailures: Number(testsuite.failures),
                        numErrors: Number(testsuite.errors),
                        package: testsuite.package,
                        executionTime: Number(testsuite.time),
                        timestamp: testsuite.timestamp,
                        cases: []
                    };
                    suite.osName=(suite.osName).toUpperCase();
                    suite.browserName=(suite.browserName).toUpperCase();
                    summary.totalExecutionTime+=suite.executionTime;
                    summary.totalTests=(summary.totalTests)+(suite.numTests);

                    var testcaseArray = testsuiteArray[i].testcase;
                    for (var x = 0; x <= (testcaseArray.length); x++) {
                        if (!testcaseArray[x])
                            continue;
                        var testcase = testcaseArray[x].$;
                        if (!testcase)
                            continue;
                        var failureArray = testcaseArray[x].failure;
                        var skippedArray = testcaseArray[x].skipped;
                        var disabledArray= testcaseArray[x].disabled;
                        var _case = {
                            name: testcase.name,
                            count: x + 1,
                            numFailures: 0,
                            disabled:0,
                            failures: [],
                            skipped:[],
                            numSkipped: 0,
                            numSkipped1: 0,
                            numSuccess:0,
                            failureMessage:"",
                            defaultMessage:"Passed",
                            status:''
                        };
                        if (testcase.time !== undefined && testcase.time != null)
                            _case.executionTime = Number(testcase.time);
                        if (testcase.assertions !== undefined && testcase.assertions != null)
                            _case.numAssertions = Number(testcase.assertions);


                        if (skippedArray) {
                            for (var z = 0; z < skippedArray.length; z++)
                                _case.numSkipped++;
                                summary.totalSkipped =summary.totalSkipped+ _case.numSkipped;
                                 }
                        
                        if (failureArray) {
                              for (var y = 0; y < failureArray.length; y++)
                             _case.numFailures++;
                            if(_case.numFailures>=2)
                                _case.numFailures=1;

                            summary.totalFailures=(summary.totalFailures)+(_case.numFailures);
                            var res=(summary.totalTests)-(summary.totalFailures+summary.totalSkipped);
                            if(res>0)
                                summary.totalSuccess=res;
                            else
                                summary.totalSuccess=0;
                            
                            var failure = failureArray[0];

                            if (!failure) {
                                continue;
                            }

                            var f = {
                                message: failure.$,
                                details: failure._
                            };
                            function convert(str) {
                                str = str.replace("&amp;",/&/g );
                                str = str.replace("&gt;",/>/g );
                                str = str.replace("&lt;",/</g );
                                str = str.replace("&quot;",/"/g);
                                str = str.replace("&#039;",/'/g);
                                str = str.replace("&amp;",/&/g );
                                str = str.replace("&gt;",/>/g );
                                str = str.replace("&lt;",/</g );
                                str = str.replace("&quot;",/"/g);
                                str = str.replace("&#039;",/'/g);
                                str = str.replace("&amp;",/&/g );
                                str = str.replace("&gt;",/>/g );
                                str = str.replace("&lt;",/</g );
                                str = str.replace("&quot;",/"/g);
                                str = str.replace("&#039;",/'/g);
                                str = str.replace("&apos;",'\"');
                                str = str.replace("&apos;",'\"');
                                str = str.replace("&apos;",'\"');
                                str = str.replace("&apos;",'\"');
                                str = str.replace("&apos;",'\"');
                                str = str.replace("&apos;",'\"');
                                return str;
                            }
                            f.message.message = convert(f.message.message);
                            _case.numSuccess=summary.totalSuccess;
                            _case.failures.push(f);
                        }
                        else {
                            res = (summary.totalTests) - (summary.totalFailures+summary.totalSkipped);
                            if (res>0)
                                summary.totalSuccess = res;
                            else
                                summary.totalSuccess = 0;

                        }

                        suite.screenshotUrl = '../screenshots/';
                        suite.cases.push(_case);
                    }
                    mydate=new Date(summary.totalExecutionTime * 1000);
                    summary.totalExecutionTimeString=mydate.getUTCHours()+" hours, "+mydate.getUTCMinutes()+" minutes and "+mydate.getUTCSeconds()+" second(s)";
                    summary.suites.push(suite);
                }
            });

            function writeTemplatedSummaryReports(summary) {
                if (!summary)
                    return;
                var jadeIndexOptions = {
                    "pretty": true
                };
                var indexFn = jade.compile(jadeTemplateIndexHtml, jadeIndexOptions);
                var indexHtml = indexFn(summary);
                mkdirp.sync("./reports/recent");
                var indexHtmlPath = "./reports/recent/htmlreport/FinalReport.html";
                fs.writeFileSync(indexHtmlPath, indexHtml);
                return indexHtmlPath;
            }

            var indexFile = writeTemplatedSummaryReports(summary);
            if (!indexFile || !fs.existsSync(indexFile)) {
                console.log("Unable to generate summary HTML report files.");

            } else {
                console.log("Summary HTML report has been generated and written to '" + indexFile + "'");
            }
        });
    }
});