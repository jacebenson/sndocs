/*! RESOURCE: /scripts/app.$sp/service.spAriaFocusManager.js */
angular.module('sn.$sp').service("spAriaFocusManager", function() {
    var danglingNavigation;
    var onPageLoadHandlerCallback;

    function linkHandler(newLinkRoute) {
        danglingNavigation = newLinkRoute;
    }

    function pageLoadComplete(newPageRoute) {
        if (newPageRoute == danglingNavigation && onPageLoadHandlerCallback) {
            onPageLoadHandlerCallback();
        }
        danglingNavigation = null;
    }

    function registerPageTitleCallback(pageLoadHandlerFn) {
        onPageLoadHandlerCallback = pageLoadHandlerFn;
    }

    function focusOnPageTitle() {
        if (onPageLoadHandlerCallback) {
            onPageLoadHandlerCallback();
        }
    }
    return {
        navigateToLink: linkHandler,
        pageLoadComplete: pageLoadComplete,
        registerPageTitleFocus: registerPageTitleCallback,
        focusOnPageTitle: focusOnPageTitle
    }
});;