/*! RESOURCE: /scripts/ac.js */
var g_isInternetExplorer = isMSIE;
var KEY_RETURN = 3;
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_ENTER = 13;
var KEY_PAGEUP = 33;
var KEY_PAGEDOWN = 34;
var KEY_END = 35;
var KEY_HOME = 36;
var KEY_ARROWLEFT = 37;
var KEY_ARROWUP = 38;
var KEY_ARROWRIGHT = 39;
var KEY_ARROWDOWN = 40;
var KEY_INSERT = 45;
var KEY_DELETE = 46;
var KEY_ESC = 27;
var NO_INVISIBLE = 0;
var itemHeight = 16;
var ctimeVal = {};
var TAG_DIV = "div";
var TAG_SPAN = "span";
var ONE_TO_MANY = "OTM";
var g_ac_objects = new Array();

function acKeyDown(evt, elementName, type, dependent) {
  var typedChar = getKeyCode(evt);
  if (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP)
    fieldChange(evt, elementName, type, dependent);
}

function acKeyUp(evt, elementName, type, dependent) {
  var typedChar = getKeyCode(evt);
  if (typedChar != KEY_ARROWDOWN && typedChar != KEY_ARROWUP)
    fieldChange(evt, elementName, type, dependent);
}

function fieldChange(event, elementName, type, dependent) {
  if (document.readyState && document.readyState != "complete") {
    jslog("fieldChange delayed due to document not being ready");
    return;
  }
  var table = elementName.split('.')[0];
  var additional = null;
  if (dependent != null) {
    var dparts = dependent.split(",");
    var el = document.getElementsByName(table + "." + dparts[0])[0];
    if (el != null) {
      var selectValue = "";
      if (el.tagName == "INPUT") {
        var selectValue = el.value;
      } else {
        selectValue = el.options[el.selectedIndex].value;
      }
      additional = "sysparm_value=" + selectValue;
    }
  }
  fieldProcess(event, elementName, type, false, true, null, additional);
}

function fieldProcess(evt, elementName, type, noMax, useInvisible, uFieldName, additional, refField) {
  var typedChar = getKeyCode(evt);
  if (ctimeVal[elementName] > 0 && typedChar != 0)
    clearTimeout(ctimeVal[elementName]);
  var displayField;
  var invisibleField;
  if (type == "Reference") {
    displayField = gel("sys_display." + elementName);
    if (useInvisible)
      invisibleField = gel(elementName);
  } else {
    displayField = gel(elementName);
    if (useInvisible)
      invisibleField = gel("sys_display." + elementName);
  }
  var updateField;
  if (uFieldName != null)
    updateField = gel(uFieldName);
  var ac = displayField.ac;
  if (ac == null) {
    ac = getAC(displayField.name);
    if (ac == null) {
      ac = newAC(displayField, invisibleField, updateField, elementName, type);
      if (ac.isOTM())
        ac.refField = refField;
    }
  }
  if (typedChar != KEY_TAB) {
    ac.fieldChanged = true;
    ac.matched = false;
    ac.ignoreAJAX = false;
    if (ac.type == 'Reference')
      ac.dirty = true;
  }
  var waitTime = 50;
  if (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP || typedChar == NO_INVISIBLE)
    waitTime = 0;
  ctimeVal[elementName] = setTimeout(function() {
    fieldProcessNow(typedChar, elementName, type, noMax, useInvisible, uFieldName, additional, refField);
  }, g_acWaitTime || waitTime);
}

function initAutoCompleteField(ac) {
  if (ac.getUpdateField())
    return;
  Event.observe(ac.getField(), 'blur', fieldBlurred.bind(ac.getField()), false);
  setDropDownSizes();
  setStyle(ac.getMenu(), "dropDownTableStyle");
  window.onresize = setDropDownSizes;
  setSavedText(ac, new Array((ac.getInvisibleField() ? ac.getInvisibleField().value : null), ac.getField().value));
  var request = new Object();
  request.responseXML = new Object();
  request.responseXML.ac = ac;
  storeResults(ac, "", request);
}

function setDropDownSizes() {
  for (var i = 0; i < g_ac_objects.length; i++) {
    var ac = g_ac_objects[i];
    if (!ac)
      continue;
    setDropDownSize(ac);
  }
}

function setDropDownSize(ac) {
  var field = ac.getField();
  var mLeft = grabOffsetLeft(field) + "px";
  var mTop = grabOffsetTop(field) + (field.offsetHeight - 1) + "px";
  var mWidth = estimateWidth(ac) + "px";
  var menu = ac.getMenu();
  if (menu.offsetWidth > parseInt(mWidth))
    mWidth = menu.offsetWidth + "px";
  acSetTopLeftWidth(menu.style, mTop, mLeft, mWidth);
  var iframe = ac.getIFrame();
  if (iframe)
    acSetTopLeftWidth(iframe.style, mTop, mLeft, mWidth);
}

function acSetTopLeftWidth(style, top, left, width) {
  style.left = left;
  style.top = top;
  style.width = width;
}

function estimateWidth(ac) {
  var field = ac.getField();
  if (g_isInternetExplorer)
    return field.offsetWidth - (ac.menuBorderSize * 2);
  else
    return field.offsetWidth;
}

function fieldBlurred() {
  var theField = this;
  var ac = theField.ac;
  ac.ignoreAJAX = true;
  var cc = ac.getField().value;
  if (cc.indexOf("javascript:") != 0) {
    if (ac.type == 'Reference' && ac.matched == false && ac.fieldChanged == true) {
      setReferenceField(ac, cc);
    }
  }
  ac.matched = false;
  ac.fieldChanged = false;
  ac.previousTextValue = '';
  checkForDirty(ac);
  ac.hideDropDown();
}

function setReferenceField(ac, cc) {
  var encodedText = encodeText(cc);
  var url = "xmlhttp.do?sysparm_processor=" + ac.type +
    "&sysparm_name=" + ac.elementName +
    "&sysparm_exact_match=yes" +
    "&sysparm_chars=" + encodedText +
    "&sysparm_type=" + ac.type;
  var response = serverRequestWait(url);
  var items = response.responseXML.getElementsByTagName("item");
  if (items.length == 1) {
    var item = items[0];
    var name = trim(item.getAttribute("name"));
    var label = trim(item.getAttribute("label"));
    ac.getField().value = label;
    ac.getInvisibleField().value = name;
  } else {
    var e = ac.getField();
    var f = e.filter;
    if (!f || f == '') {
      ac.getInvisibleField().value = "x";
      ac.getField().value = "";
      ac.getInvisibleField().value = "";
    }
  }
  fieldSet(ac);
  refFlipImage(ac.getField(), ac.elementName);
  ac.dirty = true;
}

function stripNewlines(data) {
  var retData = "";
  var Ib = "\n\r";
  for (var c = 0; c < data.length; c++) {
    if (Ib.indexOf(data.charAt(c)) == -1)
      retData += data.charAt(c);
    else
      retData += " ";
  }
  return retData;
}

function grabMenuInfo(j) {
  var spanTag = j.getElementsByTagName(TAG_SPAN);
  var spanInfo = new Array();
  if (!spanTag)
    return spanInfo;
  for (var i = 0; i < spanTag.length; i++) {
    var e = spanTag[i];
    if (e.className != "selected_item")
      continue;
    var spanData = e.innerHTML;
    if (spanData != "&nbsp;") {
      spanInfo = new Array(e.gname, stripNewlines(e.glabel));
    }
    break;
  }
  return spanInfo;
}

function storeResults(ac, searchString, req) {
  ac.resultsStorage[searchString] = req;
}

function retrieveStorage(ac, textStr) {
  return ac.resultsStorage[textStr];
}

function storeZeroString(ac, searchString, req) {
  ac.emptyResults[searchString] = req;
}

function findRelatedZeroString(ac, searchString) {
  for (var str in ac.emptyResults) {
    if (searchString.substring(0, str.length) == str) {
      return ac.emptyResults[str];
    }
  }
}
var handleClickedDropDown = function() {
  setAllText(this.ac, grabMenuInfo(this));
  this.ac.dirty = false;
}
var handleMouseOverDropDown = function() {
  setStyle(this, "selectedItemStyle");
}
var handleMouseOutDropDown = function() {
  setStyle(this, "nonSelectedItemStyle");
}

function dropDownHilight(ac, direction) {
  setTextField(ac, new Array((ac.getInvisibleField() ? ac.savedInvisibleTextValue : null), ac.savedTextValue));
  ac.matched = true;
  if (!ac.currentMenuItems || ac.currentMenuCount <= 0)
    return;
  ac.showDropDown();
  var toSelect = ac.selectedItemNum + direction;
  if (toSelect >= ac.currentMenuCount)
    toSelect = ac.currentMenuCount - 1;
  if (ac.selectedItemNum != -1 && toSelect != ac.selectedItemNum) {
    setStyle(ac.selectedItemObj, "nonSelectedItemStyle");
    ac.selectedItemNum = -1;
  }
  if (toSelect < 0) {
    ac.selectedItemNum = -1;
    ac.getField().focus();
    return;
  }
  ac.selectItem(toSelect);
  setStyle(ac.selectedItemObj, "selectedItemStyle");
  setTextField(ac, grabMenuInfo(ac.selectedItemObj));
  ac.dirty = true;
}

function setPreviousText(ac, textArray) {
  if (textArray[1] != null)
    ac.previousTextValue = textArray[1];
}

function setSavedText(ac, textArray) {
  ac.setSavedText(textArray);
}

function setTextValue(ac, textArray) {
  ac.textValue = textArray[1].replace(/\r\n/g, "\n");
  if (textArray[0] != null && ac.getInvisibleField()) {
    ac.invisibleTextValue = textArray[0];
  }
}

function setTextField(ac, textArray) {
  var f;
  if (textArray[0] != null && ac.getInvisibleField()) {
    f = ac.getInvisibleField();
    f.value = textArray[0];
  }
  f = ac.getField();
  f.value = textArray[1];
  fireOnFormat(ac);
}

function setAllText(ac, textArray) {
  setSavedText(ac, textArray);
  setTextValue(ac, textArray);
  setTextField(ac, textArray);
  setPreviousText(ac, textArray);
  fieldSet(ac);
}

function fieldSet(ac) {
  ac.dirty = false;
  ac.matched = true;
  updateRelated(ac);
  fireChange(ac);
  fireOnFormat(ac);
}

function fireChange(ac) {
  callOnChange(ac.getInvisibleField());
  callOnChange(ac.getField());
}

function callOnChange(f) {
  if (!f)
    return;
  if (f["onchange"])
    f.onchange();
}

function fireOnFormat(ac) {
  var f = ac.getField();
  if (f.getAttribute("onformat"))
    eval(f.getAttribute("onformat"));
}

function updateRelated(ac) {
  var elementName = ac.elementName;
  var elementValue = ac.invisibleTextValue;
  if (elementValue != '')
    updateRelatedGivenNameAndValue(elementName, elementValue);
  if (ac["fCall"]) {
    var onset = ac["fCall"];
    eval(onset);
  }
}

function clearRelated(ac) {
  var elementName = ac.elementName;
  var nodes = document.getElementsByTagName('input');
  var sName = elementName + ".";
  for (var i = 0; i < nodes.length; i++) {
    var current = nodes[i];
    var id = current.id;
    var index = id.indexOf(sName);
    if (index == -1)
      continue;
    index = id.lastIndexOf(".");
    var fName = id.substring(index + 1, id.length);
    var select = gel(elementName + "." + fName);
    if (select != null) {
      var x = select.tagName;
      if (x == 'select' || x == 'SELECT') {
        var selindex = select.selectedIndex;
        if (selindex != -1) {
          var option = select.options[selindex];
          option.selected = false;
        }
        var options = select.options;
        for (oi = 0; oi < options.length; oi++) {
          var option = options[oi];
          var optval = option.value;
          if (optval == '') {
            option.selected = true;
            break;
          }
        }
      }
    }
    current.value = '';
  }
}

function setStyle(child, styleName) {
  child.className = styleName;
  var style = child.style;
  var ac = child.ac;
  if (styleName == "dropDownTableStyle") {
    style.fontSize = "13px";
    style.fontFamily = "arial,sans-serif";
    style.wordWrap = "break-word";
  } else if (styleName == "nonSelectedItemStyle") {
    ac.setNonSelectedStyle(child);
  } else if (styleName == "selectedItemStyle") {
    ac.setSelectedSty