/*! RESOURCE: /scripts/app.ng_chat/util/service.titleFlasher.js */
angular.module('sn.connect.util').service('titleFlasher', function($document, $window, i18n, snTabActivity) {
    "use strict";
    var singleMessage = "1 New Message",
        manyMessages = "{0} New Messages";
    i18n.getMessages(["1 New Message", "{0} New Messages"], function(results) {
        singleMessage = results[singleMessage];
        manyMessages = results[manyMessages];
    });
    var initialTitle,
        FLASH_DELAY = 500,
        numMessages = 0,
        changedTitle = false,
        flashTimer;

    function flash(doNotIncrement) {
        if (snTabActivity.isVisible || !snTabActivity.isPrimary)
            return reset();
        if (!doNotIncrement)
            numMessages++;
        if (doNotIncrement && changedTitle)
            setTitle(initialTitle);
        else if (numMessages - 1)
            setTitle(manyMessages);
        else
            setTitle(singleMessage);
        if (flashTimer)
            $window.clearTimeout(flashTimer);
        flashTimer = $window.setTimeout(function() {
            flash(true);
        }, FLASH_DELAY);
    }

    function reset() {
        if (!flashTimer) {
            return;
        }
        numMessages = 0;
        setTitle(initialTitle);
        $window.clearTimeout(flashTimer);
        flashTimer = void(0);
    }

    function setTitle(newTitle) {
        if (newTitle.indexOf("{0}") >= 0)
            newTitle = newTitle.replace("{0}", numMessages);
        changedTitle = newTitle !== initialTitle;
        $document[0].title = newTitle;
    }
    snTabActivity.on("tab.primary", reset);
    snTabActivity.on("tab.secondary", reset);
    return {
        flash: function() {
            if (!flashTimer) {
                initialTitle = $document[0].title;
            }
            flash(false);
        }
    }
});;