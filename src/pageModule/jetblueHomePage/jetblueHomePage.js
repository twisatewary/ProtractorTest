/**
 * Created by Admin on 18-01-2016.
 */
let safeAction = require("../../util/safeAction");
let homePageLoc = require("../../pageLocators/jetblueHomePage/homePageLocators");
let platformName, profileIcon;
require("jasmine2-custom-message");

let homePageComponent = {

    getCapabilities : (function() {
        global.browser.getProcessedConfig().then(function () {
            browser.getCapabilities().then(function (capabilities) {
                platformName = capabilities.get('platform').split(" ")[0].toLowerCase();
            });
        });
    }()),

    clickOnSignIn : function() {
        safeAction.safeClick(homePageLoc.SIGN_IN_LINK, " Home page 'Sign In' button");
    },

    verifyLogin: function() {
        browser.waitForAngularEnabled = false;
        if(platformName==="android") {
            profileIcon = element(homePageLoc.USER_PROFILE_ICON_ANDROID);
            safeAction.safeVerifyVisibilityOfElement(profileIcon, "Home Page user icon");
            since("User icon not visible. Login Failed...!").expect(profileIcon.isPresent()).toBeTruthy();
        }
        else {
            profileIcon = element(homePageLoc.USER_PROFILE_ICON_DESKTOP);
            safeAction.safeVerifyVisibilityOfElement(profileIcon, "Home Page user icon");
            since("User icon not visible. Login Failed...!").expect(profileIcon.isPresent()).toBeTruthy();
        }

    },

};

module.exports = homePageComponent;
