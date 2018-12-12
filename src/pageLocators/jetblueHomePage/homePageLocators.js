let jetblueHomePageLocators={

    SIGN_IN_LINK: by.linkText('Sign in'),
    USER_PROFILE_ICON_ANDROID : By.xpath("//div[@class='flex ng-star-inserted']//span[contains(text(),'SZ')]"),
    USER_PROFILE_ICON_DESKTOP : By.xpath("//jb-tb-logged-in[@class='dn db-ns din-regular']//span[contains(text(),'SZ')]")
};

module.exports=jetblueHomePageLocators;
