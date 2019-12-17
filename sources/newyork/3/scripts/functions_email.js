/*! RESOURCE: /scripts/functions_email.js */
function sendEmail() {
  var form = document.forms['emailclient'];
  addInput(form, 'HIDDEN', 'EMAIL-CLIENT', 'send');
  if (typeof form.onsubmit == "function") {
    form.onsubmit();
  }
  form.submit();
}

function mailTo(field) {
  var nameField = $(field);
  if (nameField && nameField.value) {
    window.top.location = "mailto:" + nameField.value;
  }
}

function setCannedText(selectBox) {
  var theOption = selectBox.options[selectBox.selectedIndex];
  var messageText = theOption.value;
  var body = $('message.text');
  if (tiny_html_editor && typeof tinymce != "undefined") {
    tinymce.EditorManager.activeEditor.setContent(messageText);
  } else {
    body.value = messageText;
    if (body.htmlArea)
      body.htmlArea._doc.body.innerHTML = messageText;
  }
}

function appendCannedText(selectBox) {
  var theOption = selectBox.options[selectBox.selectedIndex];
  var messageText = theOption.value;
  if (!tiny_html_editor || typeof tinymce == "undefined") {
    return;
  }
  tinymce.EditorManager.activeEditor.execCommand('mceInsertContent', false, messageText);
  jQuery(selectBox).select2("val", '');
}

function isEmailValid(value) {
  var problemMsg = isEmailValidWithReason(value);
  if (problemMsg != "") {
    jslog("isEmailValid: " + problemMsg);
    return false;
  }
  return true;
}

function isEmailValidWithReason(value) {
  var localPartChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%*/?|^{}`~&'+-=_.";
  var domainChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.";
  if (value.indexOf("@") == -1)
    return "missing @ sign";
  var s = value.split("@");
  if (s.length != 2)
    return "too many at signs";
  if (!containsOnlyChars(localPartChars, s[0]))
    return "invalid character before the at sign";
  if (s[0].length < 1)
    return "at least one character must be before the at sign";
  if (s[0].substr(0, 1) == ".")
    return "period cannot be the first character";
  if (s[0].substr(s[0].length - 1, 1) == ".")
    return "period cannot be the last character before the at sign";
  if (!containsOnlyChars(domainChars, s[1]))
    return "invalid character after the at sign";
  var periodIndex = s[1].indexOf(".");
  if (periodIndex == -1)
    return "missing period after the at sign";
  if (periodIndex == 0)
    return "period cannot be the first character after the at sign";
  var periods = s[1].split(".");
  var lastPeriod = periods[periods.length - 1];
  if (lastPeriod.length < 1)
    return "must be at least 1 character after the last period";
  if (!isAlphaNum(s[1].substr(0, 1)))
    return "the first character after the at sign must be alphanumeric";
  if (!isAlphaNum(s[1].substr(s[1].length - 1, 1)))
    return "the last character must be alphanumeric";
  return "";
};