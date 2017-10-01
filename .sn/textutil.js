/*! RESOURCE: /scripts/functions/textutil.js */
function htmlEscape(s) {
    return s.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
}

function htmlEscapeQuote(s) {
    return s.replace(/'/g, "&#39;");
}

function htmlEscapeDoubleQuote(s) {
    return s.replace(/"/g, "&quot;");
}

function loadXML(r) {
    var xml = r.responseXML;
    if (typeof xml != 'undefined')
        return xml;
    var dom = null;
    if (window.DOMParser) {
        try {
            dom = (new DOMParser()).parseFromString(r, 'text/xml');
        } catch (e) {
            dom = null;
        }
    } else if (window.ActiveXObject) {
        try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(r))
                jslog('ERROR: ' + dom.parseError.reason + dom.parseError.srcText);
        } catch (e) {
            dom = null;
        }
    } else
        jslog('ERROR: Cannot parse xml string - "' + r + '".');
    return dom;
};