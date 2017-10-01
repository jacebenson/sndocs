/*! RESOURCE: /scripts/concourse/deprecated.js */
"use strict";

function alertDeprecated(oldFnName, newName) {
    if (console && console.warn) {
        console.warn("WARNING! Deprecated function called. The global function '" + oldFnName + "' has been deprecated, please use '" + newName + "' from your application's context instead.");
    }
}
var g_application_picker = {
    fillApplications: function() {
        CustomEvent.fireTop('sn:refresh_application_picker');
    }
};

function popupOpenFocus(url, name, pWidth, pHeight, features, snapToLastMousePosition, closeOnLoseFocus) {
    alertDeprecated("popupOpenFocus()", "window.g_navigation.openPopup()");
    if (url.indexOf("?") != -1)
        url += "&";
    else
        url += "?";
    url += "sysparm_domain_restore=false";
    if (url.indexOf("sysparm_nameofstack") == -1)
        url += "&sysparm_stack=no";
    if (snapToLastMousePosition) {
        if (lastMouseX - pWidth < 0) {
            lastMouseX = pWidth;
        }
        if (lastMouseY + pHeight > screen.height) {
            lastMouseY -= (lastMouseY + pHeight + 50) - screen.height;
        }
        lastMouseX -= pWidth;
        lastMouseY += 10;
        features += ",screenX=" + lastMouseX + ",left=" + lastMouseX + ",screenY=" + lastMouseY + ",top=" + lastMouseY;
    }
    if (closeOnLoseFocus) {
        var popupCurrent = window.open(url, name, features, false);
        if (!popupCurrent) {
            alert('Please disable your popup blocker to use this feature');
            return null;
        } else {
            popupCurrent.focus();
            popupCurrent.opener = window.self;
            return popupCurrent;
        }
    } else {
        var win = window.open(url, name, features, false);
        if (win) {
            win.focus();
            win.opener = window.self;
        }
        return win;
    }
};