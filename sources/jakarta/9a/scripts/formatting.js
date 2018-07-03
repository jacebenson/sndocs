/*! RESOURCE: /scripts/formatting.js */
function formatPhone(field) {
  field.value = trim(field.value);
  var ov = field.value;
  var v = "";
  var x = -1;
  if (0 < ov.length && '+' != ov.charAt(0)) {
    var n = 0;
    if ('1' == ov.charAt(0)) {
      ov = ov.substring(1, ov.length);
    }
    for (i = 0; i < ov.length; i++) {
      var ch = ov.charAt(i);
      if (ch >= '0' && ch <= '9') {
        if (n == 0) v += "(";
        else if (n == 3) v += ") ";
        else if (n == 6) v += "-";
        v += ch;
        n++;
      }
      if (!(ch >= '0' && ch <= '9') && ch != ' ' && ch != '-' && ch != '.' && ch != '(' && ch != ')') {
        x = i;
        break;
      }
    }
    if (x >= 0) v += " " + ov.substring(x, ov.length);
    if (n == 10 && v.length <= 40) field.value = v;
  }
  return true;
}

function formatClean(num) {
  var sVal = '';
  var nVal = num.length;
  var sChar = '';
  try {
    for (i = 0; i < nVal; i++) {
      sChar = num.charAt(i);
      nChar = sChar.charCodeAt(0);
      if (sChar == '-' || sChar == getDecimalSeparator() || ((nChar >= 48) && (nChar <= 57))) {
        sVal += num.charAt(i);
      }
    }
  } catch (exception) {
    alertError("formatClean", exception);
  }
  return sVal;
}

function formatCurrency(num) {
  var sVal = '';
  var minus = '';
  if (num.lastIndexOf("-") == 0) {
    minus = '-';
  }
  if (num.lastIndexOf(".") < 0) {
    num = n