var sysData = browser.params.sysData;
promise = require('request-promise');

var validator= require('validator');
var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' },
        { type: 'file', filename: 'logs/logFile.log', category: 'log' }
    ]
});
var logger = log4js.getLogger('log');
var fs=require('fs');
var osObj = require('os');
var protractor=require('protractor');
var exec = require('child_process').execFile;
var EC = protractor.ExpectedConditions;
var nodeUtil = require('util');
var BrowserName;
var trayballoon = require('trayballoon');
require('jasmine2-custom-message');
var width;
var currentScreenWidth;

var errorMessage;
var err_stack;
var testResult,suiteResult, specName, testcaseId, errScreenshotName,ssFileName, errScreenshotPath,itBlockName, testStepId;
var testCaseExecutionId;
var platformName;
var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');
var postTestExecution=false;
var asyncFlow= promise;
//var currentSpecs= [];
var SafeActions = {

    /**
     * @Funtion : getBrowserCapabilities
     * @Description : Function to get the browser capabilities like BrowserName, Browser Version and OS name
     * @returns {*}
     */
    getBrowserCapabilities : function(){
        return global.browser.getProcessedConfig().then(function () {
            browser.getCapabilities().then(function (capabilities) {
                BrowserName = capabilities.get('browserName')+ ' v '+ capabilities.get('version');
                platformName = capabilities.get('platform').split(" ")[0].toLowerCase();
            });
        });
    },

    /**
     * @Function  goToUrl
     * @Description  Function to launch the browser and navigates to the given url and sets the angular and non-angular settings
     either with the provided values or default values
     */
    goToUrl: function (url, options) {
        var defaultWindowOptions = {
            windowHeight: 1024,
            windowWidth: 1280,
            waitForAngular: true,
            ignoreSynchronization: false
        };
        var optionsToApply = defaultWindowOptions;
        if (url) {
            if (options) {
                optionsToApply = nodeUtil._extend(defaultWindowOptions, options);
            }
            console.log("Go to url options:", optionsToApply);
            if (optionsToApply.ignoreSynchronization) {
                console.log("Ignoring synchronization..");
                browser.ignoreSynchronization = optionsToApply.ignoreSynchronization
            }
            browser.get(url);
            if (optionsToApply.waitForAngular === true) {
                browser.waitForAngular();
            }
        }
    },

    /**
     * @Function  refreshBrowser
     * @Description  Function to refresh the current browser instance
     */
    refreshBrowser : function(){
        browser.refresh();
    },

    /**
     * @Function safeVerifyVisibilityOfElement
     * @Description for checking that an element is present on the DOM of a page and visible.
     * @param locator  - locator to be checked for visibility in web page
     * @param friendlyName - name of the element to be checked for visibility.
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeVerifyVisibilityOfElement : function(locator, friendlyName, timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var isVisible = EC.visibilityOf(locator);
        browser.wait(isVisible, timeout, friendlyName+" - is not visible - ");
    },

    safeVerifyPresenceOfElement: function(locator,friendlyName, timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var isPresent = EC.presenceOf(element(locator));
        browser.wait(isPresent, timeout, friendlyName+" - is not Present - ");
    },

    /**
     * @Function  waitAndFindElement
     * @Description  Function waits for an element until the element is found in the page.
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     * @return ele - if element is located within timeout period else throws error
     */
    waitAndFindElement : function (identifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        browser.wait(function(){
            return browser.isElementPresent(identifier);
        }, timeout).catch(function(error){
            console.log(friendlyName + " - Not Present");
            errorMessage = friendlyName + " - Not Present";
            logger.error("Waited for the element " +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });

        var ele = browser.findElement(identifier);
        browser.wait(function () {
            return ele.isDisplayed();
        }, timeout).catch(function (error) {
            console.log(friendlyName + " - Not Displayed");
            errorMessage = friendlyName + " - Not Displayed";
            logger.error("Waited for the element "+"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
        browser.wait(function () {
            return ele.isEnabled();
        }, timeout).catch(function (error) {
            console.log(friendlyName + " - Not Enabled");
            errorMessage = friendlyName + " - Not Enabled";
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
        return ele;
    },

    /**
     * @Function  safeRightClick
     * @Description  Safe Function waits for User Right Click, waits until the element is loaded and then performs a right click action
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeRightClick : function (identifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 40000;
        var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        browser.actions().mouseMove(ele).perform();
        browser.actions().click(protractor.Button.RIGHT).perform().then(function () {
            logger.info("Performed Right Click on -- " + friendlyName);
        }, function (error) {
            errorMessage = "Unable to perform Right click on " + friendlyName;
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function  safeDragandDrop
     * @Description  Safe function to perform Drag and drop operation
     * @param sourceElementIdentifier - Element which has to be dragged
     * @param destElement_X_Offset - destination element's offset value of X.
     * @param destElement_Y_Offset - destination element's offset value of Y.
     * @param friendlyName - name of the source element.
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeDragAndDrop : function (sourceElementIdentifier,destElement_X_Offset,destElement_Y_Offset, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var sourceElement = this.waitAndFindElement(sourceElementIdentifier, friendlyName, timeout);
        browser.actions().dragAndDrop(sourceElement, {x: destElement_X_Offset, y: destElement_Y_Offset}).perform().then(function (passed) {
            logger.info("Performed drag and drop from-- " + friendlyName);
        }, function (error) {
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            errorMessage = "Unable to perform drag and drop from - " + friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },
    /**
     * @Function  waitForElementUntilPresentInDom
     * @Description  Safe function to check whether the element is present or not in DOM, the promise will be fulfilled only when the element is found in DOM until then the loop will iterate
     * @param identifier - locator of element to be found
     */
    waitForElementUntilPresentInDom: function(identifier){
        browser.wait(function(){
            var deferred = protractor.promise.defer();
            element(identifier).isPresent().then(function (isPresent) {
                deferred.fulfill(isPresent);
            });
            return deferred.promise;
        });
    },

    /**
     * @Function  safeDoubleClick
     * @Description  Safe Function waits for User Double Click, waits until the element is loaded and then performs a double click action
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     *
     */
    safeDoubleClick : function (identifier, friendlyName, timeout)  {
        timeout = typeof timeout !== 'undefined' ? timeout : 40000;
        var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        browser.actions().doubleClick(ele).perform().then(function () {
            logger.info("Performed Double Click on -- " + friendlyName);
        }, function (error) {
            errorMessage = "Unable to perform Double Click on - " + friendlyName;
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function waitUntilClickable
     * @Description Function for checking whether the element is clickable
     * @param locator - locator of the element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    waitUntilClickable : function(locator, friendlyName, timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = browser.findElement(locator);
        var isClickable = EC.elementToBeClickable(element(locator));
        browser.wait(isClickable, timeout, friendlyName+" is not visible and not clickable - "); //wait for an element to become clickable
        return ele;
    },

    /**
     * @Function  safeVerifyIsAlertPresent
     * @Description  Safe function to verify whether alert is present or not
     * @returns {Function}
     */
    safeVerifyIsAlertPresent : function(timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var isAlertPresent = EC.alertIsPresent();
        browser.wait(isAlertPresent, timeout, "Alert is not present - ");
    },

    /**
     *@Function  safeAcceptAlert
     *@Description  Safe Function to verify and accept the alert
     */
    safeAcceptAlert : function(){
        this.safeVerifyIsAlertPresent();
        browser.switchTo().alert().accept().then(function () {
        }, function (error) {
            errorMessage = "Unable to accept alert";
            err_stack=error.stack;
            logger.error(error.stack);
            throw errorMessage;
        });
    },

    /**
     * @Function  safeDismissAlert
     * @Description Safe Function to verify and dismiss the alert
     */
    safeDismissAlert : function(){
        this.safeVerifyIsAlertPresent();
        browser.switchTo().alert().dismiss().then(function () {
        }, function (error) {
            errorMessage = "Unable to dismiss alert";
            err_stack=error.stack;
            logger.error(error.stack);
            throw errorMessage;
        });
    },

    /**
     * @Function   waitForTitle
     * @Description  Safe Function to verify whether the current title is expected title or not
     * @param title - title of the browser window which needs to be checked
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    waitForTitle : function(title, timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var titleFlag = EC.titleIs(title);
        browser.wait(titleFlag, timeout ,"Unable to fetch the title - ");
    },

    /**
     * @Function  waitForTitle_Contains
     * @Description Safe Function to verify whether the current title contains the expected text or not.
     * @param containedTitle - the text which need to be checked in the browser window title
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    waitForTitle_Contains : function(containedTitle,timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var EC = protractor.ExpectedConditions;
        var titleFlag = EC.titleContains(containedTitle);
        browser.wait(titleFlag, timeout," does not contains - "+containedTitle+" - " );
    },

    /**
     * @Function  waitForTitle_Contains
     * @Description Safe Function to verify whether the current title contains the expected text or not.
     * @param containedUrl - the text which need to be checked in the browser window title
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    waitForUrl_Contains : function(containedUrl,timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var EC = protractor.ExpectedConditions;
        var titleFlag = EC.urlContains(containedUrl);
        browser.wait(titleFlag, timeout," does not contains - "+containedUrl+" - " );
    },

    /**
     * @Function waitAndFindMultiple
     * @Description Safe Function waits for list of elements until the elements are found in the page.
     * @param identifier - locator of list of element to be found
     * @param friendlyName - name of the list of elements to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     * @return ele - if list of elements are located within timeout period else throws error
     */
    waitAndFindMultiple : function (identifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = browser.wait(function () {
            return browser.driver.findElements(identifier);
        }, timeout).catch(function (error) {
            console.log(friendlyName + " - Not Displayed");
            logger.error("Waited for the element" + friendlyName+" for "+timeout / 1000 +" seconds ");
            errorMessage = "Unable to find - "+ friendlyName;
            err_stack=error.stack;
            logger.error(error.stack);
            throw errorMessage;
        });
        return ele;
    },

    /**
     * @Function  safeOpenExeFile
     * @Description  Safe Function checks the exe file is present & uses child process to execute file
     * @param pathToExe - Path to the Exe file file to execute
     */
    safeOpenExeFile:function(pathToExe){
        exec(pathToExe, function(err, data){
            if(err)
                console.log(err+ "-failed to open Exe");
            console.log(data.toString());
        });
    },

    /**
     * @Function  safeType
     * @Description  Safe Function waits for User Type, waits until the element is loaded and then enters some text
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param texttoenter - text to be enter in element
     * @param timeout - the time in milli seconds to wait until returning a failure
     * @return texttoenter - if text is entered under element, else throws error
     */
    safeType : function (identifier, friendlyName, texttoenter, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        ele.sendKeys(texttoenter).then(function () {
            logger.info("Entered [" + texttoenter + "] under - " + friendlyName);
        }, function (error) {
            errorMessage = "Unable to type under - " + friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
        return texttoenter;
    },

    /**
     * @Function  safeValidateEmail
     * @Description  Safe Function waits for User Type, waits until the element is loaded and then enters email
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param texttoenter - email to be enter in element
     * @param timeout - the time in milli seconds to wait until returning a failure
     * @return texttoenter - if email is entered under element, else throws error
     */
    safeValidateEmail : function (identifier, friendlyName, texttoenter, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        var res=validator.isEmail(texttoenter);
        console.log(res+" valid Email id");
        if(res) {
            ele.sendKeys(texttoenter).then(function () {
                logger.info("Entered [" + texttoenter + "] under --" + friendlyName);
            }, function (error) {
                errorMessage = "Unable to type under " + friendlyName;
                logger.error(error.stack);
                err_stack=error.stack;
                throw errorMessage;
            })}
        return texttoenter;
    },

    /**
     * @Function  clearCookies
     * @Description  Function for delete cookies in browser
     */
    clearCookies : function () {
        browser.driver.manage().deleteCookie();
    },

    /**
     * @Function  disableCookies
     * @Description  Function for delete cookies in browser
     */
    disableCookies : function () {
        browser.driver.manage().deleteAllCookies();
    },

    /**
     * @Function  getCookiesData
     * @Description  Function for getting cookies data
     */
    getCookiesData : function () {
        browser.driver.manage().getCookies().then(function(text){
            console.log(text);
            logger.info("Cookies - "+text)
        });
    },

    /**
     * @Function  addCookie
     * @Description  Function for adding cookie
     * @param text - cookie text to be added
     */
    addCookie:function(text) {
        var res=validator.isAlpha(text);
        console.log(res);
        if(res)
            browser.driver.manage().addCookie("text",text);
        else
            console.log("Please enter a text");
    },

    /**
     * @Function safeClick
     * @Description  Safe Function waits for User Click, waits until the element is loaded and then performs a click action
     * @param locator - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     *
     */
    safeClick : function (locator,friendlyName,timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 40000;
        this.scrollIntoElementView(locator,friendlyName);
        this.safeVerifyElementPresent(locator,friendlyName,timeout);
        var ele = this.waitUntilClickable(locator,friendlyName,timeout);
        this.setHighlight(ele);
        ele.click().then(function () {
            logger.info("Clicked on - " + friendlyName);
        }).catch(function (error) {
            errorMessage = "Unable to click on - " + friendlyName;
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function scrollIntoElementView
     * @Description Function to verify whether the element is present in DOM
     * @param locator - locator of the web element whose presence is to be checked
     * @param friendlyName - name of the element to be checked in web page
     */
    scrollIntoElementView : function(locator,friendlyName){
        browser.executeScript("arguments[0].scrollIntoView();",browser.findElement(locator)).then(function(){
            logger.info(friendlyName +" - is attached to the page document");
        }, function (error) {
            errorMessage = friendlyName +" - is not attached to the page document";
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function safeSelectByNgOption
     * @Description  Safe Function for User select option mentioned with ngTag
     * @param selecttagidentifier - By.options locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param optionindex - option index value of drop down item
     */
    safeSelectByNgOptionIndex : function (selecttagidentifier, friendlyName, optionindex) {
        if (optionindex !== 'undefined') {
            var options = element.all(selecttagidentifier);
            var selectedOption=options.get(optionindex);
            selectedOption.click();
        }
        else{
            errorMessage = 'Unable to select on the option for - '+ friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        }
    },

    /**
     * @Function safeSelectByNgOption
     * @Description  Safe Function for User select option mentioned with ngTag
     * @param selecttagidentifier - By.options locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param optionindex - option text value of drop down item
     */
    safeSelectByVisibleText: function (selectoptiontagidentifier, friendlyName, optiontext) {
        if (optiontext !== 'undefined') {
            element.all(selectoptiontagidentifier).each(function (element) {
                element.getText().then(function (text) {
                    if (text === optiontext) {
                        element.click();
                    }
                })
            })
        }
        else {
            errorMessage = 'Unable to select on the option for - ' + friendlyName;
            logger.error(errorMessage);
            throw errorMessage;
        }
    },

    /**
     * @Function safeSelectOptionByNgRepeater
     * @Description  Safe Function for User select option mentioned with ngTag
     * @param selectRepeater - By.repeater locator of element to be found
     * @param selectRowChild - child element of the By.repeater locator
     * @param friendlyName - name of the element to be found
     * @param optionindex - option index value of drop down item
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeSelectOptionByNgRepeater : function (selectRepeater,selectRowChild,friendlyName, optionindex, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(selectRepeater, friendlyName, timeout);
        this.setHighlight(ele);
        if (optionindex !== 'undefined') {
            element.all(selectRepeater).then(function(posts) {
                var titleElement = posts[optionindex].element(selectRowChild);
                titleElement.click();
                logger.info("Given option selected under - " + friendlyName)
            }, timeout).then(function (error) {
                errorMessage = "Unable to select the Option specified";
                logger.error("Waited for the element" + friendlyName+" for "+timeout / 1000 +" seconds");
                logger.error(error.stack);
                err_stack=error.stack;
                throw errorMessage;
            });
        }
        else {
            errorMessage = 'Option index Value not Specified';
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        }
    },

    /**
     * @Function getRandomNumber
     * @Description  Function to get unique number by retrieving the current date and tie including seconds
     */
    getRandomNumber:function(){
        var now = new Date();
        var randomnumber = now.getDay()+"_"+now.getMonth()+"_"+now.getYear()+"_"+now.getHours()+"_"+now.getMinutes()+"_"+now.getSeconds();
        return randomnumber;
    },

    /**
     * @Function safeClearTextField
     * @Description  Safe function to clear the content of a text field/text area etc
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeClearTextField : function (identifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        ele.clear().then(function () {
            logger.info("Cleared content under --" + friendlyName);
        },function(error){
            errorMessage = "Unable to clear content under - "+friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function safeJSClick
     * @Description  Safe Function waits until the element is loaded and then performs a click action using javascript executors.
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     *
     */
    safeJSClick : function(identifier,friendlyName,timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele= this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        browser.executeScript('arguments[0].scrollIntoView();', ele).then(function () {
            ele.click();
            logger.info("JS Clicked on - " + friendlyName);
        }, function (error) {
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            errorMessage = "Unable to JS click on - " + friendlyName;
            throw errorMessage;
        });
    },


    /**
     * @Function safeVerifyElementPresent
     * @Description  Safe Function for waits for element to be present, waits until the element is loaded then verify element present
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     * @return flag - if element present then returns true else false
     */
    safeVerifyElementPresent : function (identifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var flag = browser.wait(function () {
            flag = browser.isElementPresent(identifier).then(function (passed) {
                if (passed === true) {
                    return true;
                }
            });
            flag.then(function (flag) {
                if (flag === true) {
                    return true;
                }
            }).then(function (val) {
                flag = val;
            });
            return flag;

        }, timeout).catch(function (error) {
            flag = false;
            errorMessage = friendlyName + " - Not Present\t";
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
        return flag;
    },

    /**
     * @Function safeSwitchToFrame
     * @Description  Safe Function for waits until the window present then switching to frame using any locator of the frame
     * @param frameidentifier - locator of frame to be found
     * @param friendlyName - name of the frame to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     *
     */
    safeSwitchToFrame : function (frameidentifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        this.waitAndFindElement(frameidentifier, friendlyName, timeout);
        browser.switchTo().frame(browser.driver.findElement(frameidentifier)).then(function (error) {
            errorMessage = "Unable to Switch to - " + friendlyName;
            logger.error("Waited for " +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw  errorMessage;
        });
    },

    /**
     * @Function defaultFrame
     * @Description  Function for switching back to web page from frame
     */
    defaultFrame : function () {
        browser.driver.switchTo().defaultContent();
    },

    /**
     * @Function safeClearAndType
     * @Description  Safe Function for User Clear and Type, waits until the element is loaded and then enters some text
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param texttoenter - text to be enter in element
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeClearAndType : function (identifier, friendlyName, texttoenter, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
        this.setHighlight(ele);
        ele.clear().then(function () {
            logger.info("Cleared content under --" + friendlyName);
        },function(error){
            errorMessage = "Unable to clear content under - "+friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
        ele.sendKeys(texttoenter).then(function () {
            logger.info("Entered [" + texttoenter + "] under --" + friendlyName);
        }, function (error) {
            errorMessage = "Unable to type under - " + friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function safeSelectOption
     * @Description  Safe Function for User select option, waits until the element is loaded and then select option
     * @param selecttagidentifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param optionindex - index value of drop down item
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeSelectOption : function (selecttagidentifier, friendlyName, optionindex, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(selecttagidentifier, friendlyName, timeout);
        this.setHighlight(ele);
        if (optionindex !== 'undefined') {
            ele.findElements(By.tagName('option')).then(function (options) {
                options[optionindex].click().then(function () {
                    logger.info("Given option selected under - " + friendlyName)
                });
            }, timeout).catch(function (error) {
                errorMessage = "Unable to select the option specified for - "+friendlyName;
                logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
                err_stack=error.stack;
                throw errorMessage;
            });
        }
        else {
            errorMessage = 'Option index Value not Specified';
            logger.warn(error);
            throw errorMessage;
        }
    },

    /**
     * @Function setHighlight
     * @Description  Function Highlights on current working element or locator
     * @param elementtohighlight - element to be highlighted
     */
    setHighlight : function (elementtohighlight) {
        var attribValue = "border:3px solid red;";
        var getattrib = elementtohighlight.getAttribute("style");
        browser.executeScript("arguments[0].setAttribute('style', arguments[1]);", elementtohighlight, attribValue).then(function(){
            browser.sleep(100);
        },function(error){
            errorMessage = "unable to highlight - "+elementtohighlight;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
        browser.executeScript("arguments[0].setAttribute('style', arguments[1]);", elementtohighlight, getattrib);
    },

    /**
     * @Function safeSelectCheckBox
     * @Description  Safe Function for checkbox selection, waits until the element is loaded and then selects checkbox
     * @param checkboxlocator - locator of checkbox to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeSelectCheckBox : function (checkboxlocator, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(checkboxlocator, friendlyName, timeout);
        this.setHighlight(ele);
        ele.click().then(function () {
            logger.info("Selected checkbox - " + friendlyName)
        }, function (error) {
            errorMessage= "Unable to select checkbox of - " + friendlyName;
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },

    /**
     * @Function executeExeFile
     * @Description Function to execute a '.exe' file by providing the path of the '.exe' file
     */
    executeExeFile:function(){
        browser.sleep(8000);
        exec(".\\resources\\deskTopScenario.exe",function(err,data){
            if(err)
                console.log(err);
        })
    },

    /**
     * @Function safeHovering
     * @Description  Safe Function to hover on an element based on locator using Actions,it waits until the element is loaded and then hovers on the element
     * @param elementindentifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeHovering : function (elementindentifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(elementindentifier, friendlyName, timeout);
        ele.then(function (ele) {
            browser.actions().mouseMove(ele).perform().then(function (passed) {
                logger.info("Hovered on " + friendlyName);
                console.log("Action Performed")
            });
        },function(error){
            errorMessage = "Unable to hover mouse on - " + friendlyName;
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw  errorMessage;
        });
    },

    /**
     * @Function safeHovering
     * @Description  Safe Function to hover on an element based on locator using Actions,it waits until the element is loaded and then hovers on the element
     * @param elementindentifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeActionClick : function (elementindentifier, friendlyName, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var ele = this.waitAndFindElement(elementindentifier, friendlyName, timeout);
        ele.then(function (ele) {
            browser.actions().click(ele).perform().then(function (passed) {
                logger.info("Clicked on " + friendlyName);
                console.log("Action Performed")
            });
        },function(error){
            errorMessage = "Unable to click on - " + friendlyName;
            logger.error("Waited for the element" +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw errorMessage;
        });
    },


    /**
     * @Function safeGetAttribute
     * @Description  Safe Function Gets a UI element attribute value
     * @param identifier - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param attributename - name of attribute to get value
     * @param timeout - the time in milli seconds to wait until returning a failure
     * @return returnValue - if attribute name exists of element, else throws error
     */
    safeGetAttribute : function (identifier, friendlyName, attributename, timeout) {
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        var returnValue;
        if (typeof attributename !== 'undefined') {
            var ele = this.waitAndFindElement(identifier, friendlyName, timeout);
            if (attributename.toLowerCase() === "text") {
                returnValue = ele.getText(attributename.toLowerCase());
            }
            else {
                returnValue = ele.getAttribute(attributename.toLowerCase());
            }
            returnValue.then(function (attributevalue) {
                returnValue = attributevalue;
            }, function (error) {
                errorMessage = "Unable to retrieve " + attributename + " for " + friendlyName;
                logger.error(error.stack);
                err_stack=error.stack;
                throw errorMessage;
            }).then(function (returnval) {
            });
            return returnValue;
        }
        else {
            console.log('Attribute name not passed');
            logger.error("Attribute name not passed");
        }
    },

    /**
     * @Function safeSwitchToWindow
     * @Description  Safe Function is used to switch to windows based on provided flag value
     * @param friendlyName - name of the element to be found
     * @param isNewWindow - boolean value if its true then switch to new window else switch back to parent window
     */
    safeSwitchToWindow : function (friendlyName, isNewWindow) {
        var handlePromise = browser.getAllWindowHandles();
        var handles = handlePromise.then(function (handles) {
            var parentWindowHandle = handles[0];
            var newWindowHandle = handles[1];
            if(isNewWindow == true) {
                browser.switchTo().window(newWindowHandle).then(function () {
                    browser.manage().window().maximize();
                });
            }else {
                browser.switchTo().window(parentWindowHandle);
            }
        },function (error) {
            errorMessage = "Unable to Switch to - " + friendlyName;
            logger.error("Waited for " +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw  errorMessage;
        });
    },

    /**
     * @Function safeTextMatchInParagraph
     * @Description  Safe Function for match text in multiple text
     * @param paragraphTextLocator - locator of element to be found
     * @param friendlyName - name of the element to be found
     * @param textToMatch - text to match in multiple text
     */
    safeTextMatchInParagraph : function (paragraphTextLocator, friendlyName, textToMatch) {
        var searchResult;
        element(paragraphTextLocator).getText().then(function (text) {
            var paragraphText = text;
            searchResult = paragraphText.search(textToMatch);
            if (searchResult == -1)
                console.log("search text not found");
            else
                console.log("text found");
        },function(error){
            errorMessage = "Unable to get the text from the " + friendlyName;
            logger.error("Waited for " +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw  errorMessage;
        });
    },

    /**
     * @Function safeGetText
     * @Description  Safe Function to get text from a web element
     * @param identifier - locator of element from which text has toi be retrieved
     * @param friendlyName - name of the element from which text has toi be retrieved
     * @param timeout - the time in milli seconds to wait until returning a failure
     */
    safeGetText : function(identifier, friendlyName, timeout){
        timeout = typeof timeout !== 'undefined' ? timeout : 30000;
        element(identifier).getText().then(function (text) {
            var Text = text;
            logger.info("Get text from -- " + friendlyName);
            return (Text);
        } ,function(error){
            errorMessage = "Unable to get text from - " + friendlyName;
            logger.error("Waited for the element " +"'"+friendlyName+"'"+" for "+timeout / 1000 +" seconds ");
            logger.error(error.stack);
            err_stack=error.stack;
            throw  errorMessage;
        });
    },

    /**
     * @Function safeGetTextFromTxtFile
     * @Description  Safe Function to read text from a file
     * @param filePath - path to the file
     */
    safeGetTextFromTxtFile : function (filePath) {
        var check=fs.existsSync(filePath);
        if(check) {
            var data = fs.readFileSync(filePath);
            var text1 = data.toString();
            return (text1);
        }
        else {
            console.log("File does not exists");
        }
    },

    /**
     * @Function safeTextWriteToFile
     * @Description  Safe Function to write text from a file
     * @param filePath - path to the file
     * @param textToWrite - text which has to be written into the file
     */
    safeTextWriteToFile : function (filePath,textToWrite) {
        fs.openSync(filePath, 'w');
        fs.writeFile(filePath,textToWrite);
    },

    /**
     * @Function clickDateByText
     * @Description  Safe Function for clicking date by text
     * @param identifier - locator of element to be found
     * @param tileText - text to click date
     */
    clickDateByText : function (identifier, tileText) {
        'use strict';
        identifier.filter(function (elem) {
            return elem.getText().then(function (text) {
                return text === tileText;
            });
        }).then(function (filteredElements) {
            filteredElements[0].click();
        });
    },

    /**
     * @Function getKeyValueFromTextFile
     * @Description  Function to retrieve key and value form text file
     */
    getKeyValueFromTextFile:function(key){
        var value="";
        var array = fs.readFileSync('.//src//util//properties.txt').toString().split("\n");
        for(i in array) {
            if ( array[i].indexOf(key) > -1 ) {
                value = array[i].replace(key + "=", "");
            }
        }
        return value;
    },

    /**
     * @Function getScreenResolution
     * @Description  Function for retrieving current machine's screen resolution
     */
    getScreenResolution : function(){
        var screenResolution = browser.driver.manage().window().getSize();
        currentScreenWidth = Promise.resolve(screenResolution).then(function(resolution){
            console.log("current machine screen resolution (width, height): "+resolution.width+","+resolution.height);
        });
    },

    /**
     * @Function getBalloonPopUp
     * @Description  Function to display the balloon popup at right bottom of window with the information of the current test case running.
     */
    baloonPopUp:(function() {
        var myReporter = {

            jasmineStarted: function(){
                return global.browser.getProcessedConfig().then(function () {
                    browser.getCapabilities().then(function (capabilities) {
                        BrowserName = capabilities.get('browserName')+ ' v '+ capabilities.get('version');
                        platformName = capabilities.get('platform').split(" ")[0].toLowerCase();
                    });
                });
            },

            specStarted: function(result) {
                trayballoon({
                    title: 'Currently Running Test Case',
                    text: result.description,
                    icon: '.\\resources\\image-library\\protractor.ico',
                    timeout: 2000,
                    wait : 2000
                },function(){
                    console.log("")
                });
            }
        };
        jasmine.getEnv().addReporter(myReporter);
    }()),

    /**
     * @Function start_specInfo
     * @Description  Function to print spec name in log file to separate logs of each 'it' block
     */
    /*start_specInfo :(function() {
        var myReporter = {
            specStarted: function(result) {
                this.currentSpecs = [];
                specName = result.fullName;
                itBlockName=result.description;
                logger.info('\n'+'<==== Started Test Case ['+
                    result.description  + '] ' + 'on Machine ' + '[' + osObj.hostname() + ']' +' ====>');
            }
        };
        jasmine.getEnv().addReporter(myReporter);
    }()),*/

    /**
     * @Function end_specInfo
     * @Description  Function to print spec name in log file to separate logs of each 'it' block including passed/failed result
     */
    end_specInfo:(function() {
        var myReporter = {
            specStarted: function(result) {
                specName = result.fullName;
                logger.info('\n'+'<==== Started Test Case ['+ platformName +':'+ result.description  + '] ' + 'on Machine ' + '[' + osObj.hostname() + ']' +' ====>');
            },
            specDone:  function(result) {
                logger.info('\n'+'<==== Completed Test Case - ['+ platformName+':'+
                    result.description+ '] [Test Result: ' + result.status + '] ====>');
            },
        };
        jasmine.getEnv().addReporter(myReporter);
    }()),

    /**
     * @Function expectToEqual
     * @Description Function to check the 'expect().toEqual()' method along with jasmine2 custom messages
     * @param actualValue - actual value of the webElement
     * @param expectedValue - expected value which is supposed to be equal
     */
    expectToEqual : function(actualValue,expectedValue){
        since('"#{actual}"'+' is not equal to'+' "#{expected}"').expect(actualValue).toEqual(expectedValue);
    },

    /**
     * @Function expectToContain
     * @Description Function to check the 'expect().toContain()' method along with jasmine2 custom messages
     * @param actualValue - actual value of the webElement
     * @param expectedValue - expected value which is supposed to be Contained in the actual value
     */
    expectToContain : function(actualValue, expectedValue){
        since('"#{actual}"'+' does not contain'+' "#{expected}"').expect(actualValue).toContain(expectedValue);
    },

    /**
     * @Function expectNotToContain
     * @Description Function to check the 'expect().not.toContain()' method along with jasmine2 custom messages
     * @param actualValue - actual value of the webElement
     * @param expectedValue - expected value which is not supposed to be Contained in the actual value
     */
    expectNotToContain : function(actualValue,expectedValue){
        since('"#{actual}"'+' does not supposed to contain'+' "#{expected}" but it contains "#{expected}"').expect(actualValue).not.toContain(expectedValue);
    },

    /**
     * @Function expectNotToEqual
     * @Description Function to check the 'expect().not.toEqual()' method along with jasmine2 custom messages
     * @param actualValue - actual value of the webElement
     * @param expectedValue - expected value which is not supposed to be equal
     */
    expectNotToEqual : function(actualValue,expectedValue){
        since('"#{actual}"'+' is supposed to be not equal to'+' "#{expected}" but it equals to "#{expected}"').expect(actualValue).not.toEqual(expectedValue);
    },

    // Return only base file name without dir
    getMostRecentFileName:function(dir) {
        var files = fs.readdirSync(dir);

        // use underscore for max()
        return _.max(files, function (f) {
            var fullpath = path.join(dir, f);

            // ctime = creation time is used
            // replace with mtime for modification time
            return fs.statSync(fullpath).ctime;
        });
    },

    verifyTitle: function(appTitle) {
        this.waitForTitle(appTitle);
        var title = browser.getTitle();
        since(function() {
            return (this.actual + ' =/= ' + this.expected);
        }).expect(title).toBe(appTitle);
    }
};

module.exports = SafeActions;