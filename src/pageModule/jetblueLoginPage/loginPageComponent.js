/**
 * Created by Admin on 18-01-2016.
 */
require("jasmine2-custom-message");

let safeAction = require("../../util/safeAction");
let loginPageLoc = require("../../pageLocators/jetblueLoginPage/loginPageLocators");


let loginPageComponent = {

    enterUserEmail: function(userEmail){
        safeAction.safeClearAndType(loginPageLoc.USER_EMAIL_FIELD," User email input field ",userEmail);
    },

    enterUserPassword: function(userPassword){
        safeAction.safeClearAndType(loginPageLoc.PASSWORD_FIELD," Password input field ",userPassword);
    },

    clickOnSignBtn : function() {
        safeAction.safeClick(loginPageLoc.SIN_IN_BTN," Sign In ");
    },

    loginToJetblue: function (userEmail, userPassword) {
        this.enterUserEmail(userEmail);
        this.enterUserPassword(userPassword);
        this.clickOnSignBtn();
    },

};

module.exports = loginPageComponent;
