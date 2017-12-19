var g_key_delay = 250;
var AJAXEmailClientCompleter = Class.create(AJAXTableCompleter, {
  PROCESSOR: "EmailClient",
  initialize: function(element, reference, dependentReference, refQualElements, targetTable, inputSpan) {
    AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
    this.className = "AJAXEmailClientCompleter";
    this.inputSpan = inputSpan;
    this.element = $(element);
    this.keyElement = gel(reference);
    this.setTargetTable(targetTable);
    this.additionalValues = {};
    this._commonSetup();
    this.oneMatchSelects = true;
    this.clearDerivedFields = true;
    this.allowInvalid = this.element.readAttribute('allow_invalid') == 'true';
  },
  _processDoc: function(doc) {
    AJAXTableCompleter._processDoc(doc);
  },
  keyDown: function(evt) {
    var typedChar = getKeyCode(evt);
    if (typedChar == KEY_ARROWUP) {
      if (!this.selectPrevious())
        this.hideDropDown();
    } else if (typedChar == KEY_ARROWDOWN) {
      if (!this.isVisible()) {
        if (!this.isPopulated())
          return;
        this.showDropDown();
      }
      this.selectNext();
    }
  },
  keyUp: function(evt) {
    var typedChar = getKeyCode(evt);
    if (!this.isDeleteKey(typedChar))
      return;
    this.clearTimeout();
    this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
  },
  clearTimeout: function() {
    if (this.timer != null)
      clearTimeout(this.timer);
    this.timer = null;
  },
  keyPress: function(evtArg) {
    var evt = getEvent(evtArg);
    var typedChar = getKeyCode(evt);
    if (typedChar != KEY_ENTER && typedChar != KEY_RETURN)
      this.clearTimeout();
    if (this.isNavigation(typedChar))
      return true;
    if (!evt.shiftKey && (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP))
      return false;
    if (this.isDeleteKey(typedChar))
      return true;
    if (typedChar == KEY_ENTER || typedChar == KEY_RETURN || typedChar == KEY_TAB) {
      if (this.hasDropDown() && this.select())
        this.clearTimeout();
      else
        this.onBlur();
      return false;
    }
    if (typedChar == this.KEY_ESC) {
      this.clearDropDown();
      return false;
    }
    this.timer = setTimeout(this.ajaxRequest.bind(this), g_key_delay);
    return true;
  },
  isNavigation: function(typedChar) {
    if (typedChar == this.KEY_LEFT)
      return true;
    if (typedChar == this.KEY_RIGHT)
      return true;
    if (typedChar == KEY_TAB && this.currentDisplayValue == "")
      return true;
  },
  ajaxRequest: function() {
    var s = this.getDisplayValue();
    if (s.length == 0) {
      this.log("ajaxRequest returned no results");
      this.clearDropDown();
      this.searchChars = null;
      return;
    }
    if (s == "*")
      return;
    if (s == this.searchChars) {
      this.log("navigator key pressed");
      return;
    }
    this.searchChars = s;
    this.clearKeyValue();
    this.log("searching for characters '" + this.searchChars + "'");
    var xml = this.cacheGet(s);
    if (xml) {
      this.log("cached results found");
      this.processXML(xml);
      return;
    }
    if (this.cacheEmpty()) {
      this.log("cache is empty");
      this.clearDropDown();
      this.hideDropDown();
      return;
    }
    var url = "";
    url += this.addSysParms();
    url += this.addTargetTable();
    url += this.addAdditionalValues();
    url += this.addAttributes("ac_");
    this.callAjax(url);
  },
  processXML: function(xml) {
    this.log("processing XML results");
    var e = xml.documentElement;
    this.rowCount = e.getAttribute('row_count');
    this.max = e.getAttribute('sysparm_max');
    var items = xml.getElementsByTagName("item");
    values = new Array();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var array = this.copyAttributes(item);
      array['XML'] = item;
      values[values.length] = array;
    }
    if (!this.hasFocus) {
      this.log("checking value without focus");
      this.ignoreFocusEvent = false;
      if ((values.length == 1) ||
        ((values.length > 1) &&
          (values[0]['label'] == this.getDisplayValue()) &&
          (values[1]['label'] != this.getDisplayValue()))) {
        this.log("setting value without focus to " + values[0]['label'] + "->" + values[0]['name']);
        this.referenceSelect(values[0]['name'], values[0]['label']);
        var s = gel(this.inputSpan);
        s.innerHTML = s.innerHTML + '<span class="address" onclick="addressOnClick(event, this)" style="white-space:nowrap;" value="' + values[0]['name'] + '">' + values[0]['label'] + ';</span> ';
        this._clearDisplayValue();
        this.currentDisplayValue = "";
      } else {
        if (e.getAttribute('allow_invalid') != 'true')
          this.setInvalid();
      }
      return;
    }
    this.createDropDown(values);
  },
  addTargetTable: function() {
    var answer = "";
    if (this.getTargetTable()) {
      answer = "&sysparm_reference_target=" + this.getTargetTable();
    }
    return answer;
  },
  select: function() {
    if (this.selectedItemNum < 0)
      return false;
    var o = this.getSelectedObject().acItem;
    this.referenceSelect(o['name'], o['label']);
    var s = gel(this.inputSpan);
    s.innerHTML = s.innerHTML + '<span class="address" onclick="addressOnClick(event, this)" style="white-space:nowrap;" value="' + o['name'] + '">' + o['label'] + ';</span> ';
    this.clearDropDown();
    this._clearDisplayValue();
    this.currentDisplayValue = "";
    return true;
  },
  _clearDisplayValue: function(v) {
    var e = this.getDisplayElement();
    e.value = "";
  },
  referenceSelect: function(sys_id, displayValue) {
    this.log("referenceSelect called with a display value of " + displayValue);
    this._setDisplayValue(displayValue);
    var e = this.getKeyElement();
    if (e.value != sys_id) {
      e.value = sys_id;
      callOnChange(e);
    }
    this.searchChars = displayValue;
    this.currentDisplayValue = displayValue;
    this.clearInvalid();
    if (this.selectionCallBack && sys_id) {
      eval(this.selectionCallBack);
    }
  },
  onBlur: function() {
    this.log("blur event");
    this.hasFocus = false;
    if (this.getDisplayValue().length == 0) {
      if (this.currentDisplayValue != "")
        this.referenceSelect("", "");
    } else if (this.selectedItemNum > -1) {
      this.select();
    } else if ((this.getKeyValue() == "") || (this.currentDisplayValue != this.getDisplayValue())) {
      var refInvalid = true;
      if (this.isExactMatch()) {
        var o = this.getObject(0).acItem;
        this.referenceSelect(o['name'], o['label']);
        refInvalid = false;
      }
      if (refInvalid)
        this.setInvalid();
      if (refInvalid || !this.isPopulated()) {
        this.log("onBlur with no menu items requesting the reference for " + this.getDisplayValue());
        this.clearTimeout();
        this.searchChars = null;
        this.ignoreFocusEvent = true;
        this.timer = setTimeout(this.ajaxRequest.bind(this), 0);
      }
    }
    this.clearDropDown();
  },
  isExactMatch: function() {
    if (this.isPopulated()) {
      if (this.getMenuCount() == 1) {
        var o0 = this.getObject(0).acItem;
        if ((o0['label'] == this.getDisplayValue()))
          return true;
        return false;
      }
      var o0 = this.getObject(0).acItem;
      var o1 = this.getObject(1).acItem;
      if ((o0['label'] == this.getDisplayValue()) && (o1['label'] != this.getDisplayValue()))
        return true;
    }
  },
  cachePut: function(name, value) {
    this.cache[name] = value;
  },
  cacheGet: function(name) {
    return this.cache[name];
  }
});