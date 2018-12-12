/**
 * Created by Sri Harsha on 18-01-2016.
 */

let safeAction = require("../util/safeAction");
let loginPageComponent = require("../pageModule/jetblueLoginPage/loginPageComponent");
let homePageComponent = require("../pageModule/jetblueHomePage/jetblueHomePage");
let appData = browser.params.appData;

/**
 * This block is used for checking the Jet blue login page functionality
 */
describe(" Should test Jet blue login page functionality ",function() {

    it("Should navigate to JetBlue page and verify", function () {
        safeAction.goToUrl(appData.appUrl,{ waitForAngular: true, ignoreSynchronization: false});
        safeAction.verifyTitle(appData.appTitle);
    });

    it("Should login into JetBlue", function () {
        homePageComponent.clickOnSignIn();
        safeAction.verifyTitle(appData.signInTitle);
        loginPageComponent.loginToJetblue(appData.userEmail, appData.userPassword);
    });

    it("Should verify login",function() {
        homePageComponent.verifyLogin();
    });

});
