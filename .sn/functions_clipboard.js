/*! RESOURCE: /scripts/functions_clipboard.js */
window.NOW = window.NOW || {};
window.NOW.g_clipboard = {};
(function(exports) {
    var browserReturnsErroneousStatus = navigator.userAgent.indexOf('MSIE 9') != -1 ||
        navigator.userAgent.indexOf('MSIE 10') != -1 ||
        navigator.userAgent.indexOf('rv:11') != -1;
    exports.copyToClipboard = function(str, messageMethod) {
        if (document.execCommand && isCapableMessageMethod(messageMethod)) {
            var v = document.createElement('textarea');
            v.innerHTML = str;
            v.className = "sr-only";
            document.body.appendChild(v);
            v.select();
            var result = true;
            try {
                result = document.execCommand('copy');
                if (result && browserReturnsErroneousStatus) {
                    var checkDiv = document.createElement('textarea');
                    checkDiv.className = "sr-only";
                    document.body.appendChild(checkDiv);
                    checkDiv.select();
                    try {
                        document.execCommand('paste');
                        result = checkDiv.value == str;
                    } finally {
                        document.body.removeChild(checkDiv);
                    }
                }
            } catch (e) {
                result = false;
                if (window.jslog)
                    jslog("Couldn't access clipboard " + e);
            } finally {
                document.body.removeChild(v);
            }
            if (result) {
                fireCopiedMessage(messageMethod);
                return true;
            }
        }
        legacyClipboardCopy(str);
        return false;
    }

    function isCapableMessageMethod(messageMethod) {
        if (messageMethod == 'custom')
            return true;
        return 'GlideUI' in window;
    }

    function fireCopiedMessage(messageMethod) {
        if (!messageMethod || messageMethod == 'GlideUI') {
            var span = document.createElement('span');
            span.setAttribute('data-type', 'info');
            span.setAttribute('data-text', 'Copied to clipboard');
            span.setAttribute('data-duration', '2500');
            GlideUI.get().fire(new GlideUINotification({
                xml: span
            }));
        }
    }

    function legacyClipboardCopy(meintext) {
        prompt("Because of a browser limitation the URL can not be placed directly in the clipboard. " +
            "Please use Ctrl-C to copy the data and escape to dismiss this dialog", meintext);
    }
})(window.NOW.g_clipboard);;