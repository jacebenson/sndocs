/*! RESOURCE: /scripts/functions_fontsizer.js */
function setPreferredFontSize(increment) {
    var ruleStart = "BODY, TABLE, INPUT, SELECT, BUTTON, INPUT.TEXT, TEXTAREA, INPUT.button {font-size: "
    var ruleEnd = "}";
    var t = g_fontSize;
    if (g_fontSizePreference)
        t = g_fontSizePreference;
    var t = t.split('p')[0];
    t = parseInt(t) + increment;
    if (6 > t || t > 18)
        return;
    t += "pt";
    if (g_fontSizePreference != t) {
        g_fontSizePreference = t;
        setPreference('font-size', g_fontSizePreference);
        var al = getFontWindowList();
        for (var i = 0; i != al.length; i++) {
            var w = al[i];
            if (typeof w.deleteStyleSheet == 'function') {
                w.deleteStyleSheet("font_size");
                w.createStyleSheet(ruleStart + t + ruleEnd, "font_size");
            }
        }
    }
    deleteStyleSheet("font_size");
    createStyleSheet(ruleStart + t + ruleEnd, "font_size");
    if (increment) {
        var e = $("font_pref_text");
        if (e)
            e.innerHTML = "(" + g_fontSizePreference + ")";
    }
    CustomEvent.fireAll("fontsize.change");
}

function getFontWindowList() {
    var answer = new Array();
    var m = getMainWindow();
    if (m)
        answer.push(m);
    var m = getMainFormWindow();
    if (m)
        answer.push(m);
    var m = getNavWindow();
    if (m)
        answer.push(m);
    return answer;
}

function deleteStyleSheet(id) {
    var sheet = document.getElementById(id);
    if (sheet) {
        var head = document.getElementsByTagName("head")[0];
        head.removeChild(sheet);
    }
}

function createStyleSheet(cssText, id) {
    var head = document.getElementsByTagName("head")[0];
    var rules = document.createElement("style");
    rules.setAttribute("type", "text/css");
    if (id)
        rules.setAttribute("id", id);
    if (navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
        head.appendChild(rules);
        var ss = rules.styleSheet;
        ss.cssText = cssText;
    } else {
        try {
            rules.appendChild(document.createTextNode(cssText));
        } catch (e) {
            rules.cssText = cssText;
        }
        head.appendChild(rules);
    }
}

function setPreferredFont() {
    var t = getPreference('font-size');
    if (!t)
        return;
    g_fontSizePreference = t;
    setPreferredFontSize(0);
};