exports.config = {

    params: {
        appData: require('./../src/testData/appData.json'),
        sysData: require('./../src/testData/sysData.json')
    },

    framework:'jasmine2',
    jasmineNodeOpts: {
        // If true, print colors to the terminal.
        showColors: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: 600000
    },

    specs: ['./../src/testSuites/*.js'],
     multiCapabilities:[
        {
            seleniumAddress: 'http://localhost:4444/wd/hub',
            'browserName':'chrome',
            'name':'windows',
            'chromeOptions':{
                'args':['disable-infobars', //to get rid of infobar 'Chrome is being automated'
                    'start-maximized', // start chrome maximised//similar to browser.driver.manage().window().maximize()
                    '--bwsi', //"browse without sign-in" (Guest session) mode
                    '--disable-extensions', //disable extensions
                    //   'headless'
                ]
            },
        }
    ],

    plugins: [{
        package: 'jasmine2-protractor-utils',
        disableHTMLReport: true,
        disableScreenshot: false,
        screenshotOnExpectFailure: true  ,
        screenshotOnSpecFailure: false   ,
        screenshotPath: "./reports/recent/screenshots/",
        htmlReportDir:  "./reports/recent/htmlreport",
        clearFoldersBeforeTest: true
    }],


    onPrepare: function() {
        let jasmineReporters = require('jasmine-reporters');
        return global.browser.getProcessedConfig().then(function () {
            browser.getCapabilities().then(function (capabilities) {
                console.log(capabilities.name);
                jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
                    consolidateAll: true,
                    savePath: './reports/xmlfiles/',
                    filePrefix: (capabilities.get('platform')).split(" ")[0].toLowerCase() + '.' + capabilities.get('browserName') + '.' + capabilities.get('version') + '-' + capabilities.get('platform')
                }));
            });
        });
    }
};
