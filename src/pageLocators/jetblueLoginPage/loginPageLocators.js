let jetblueLoginPageLocators={
    USER_EMAIL_FIELD:By.css("[id*='login-email_']"),
    PASSWORD_FIELD:By.css("[id*='password-email_']"),
    SIN_IN_BTN: By.xpath(".//span[contains(text(),'Sign in')]")

};

module.exports=jetblueLoginPageLocators;