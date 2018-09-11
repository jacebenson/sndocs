/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceCompleter.js */
function acReferenceKeyDown(element, evt) {
  if (!element.ac || element.getAttribute('readonly'))
    return true;
  return element.ac.keyDown(evt);
}

function acReferenceKeyPress(element, evt) {
  if (!element.ac || element.getAttribute('readonly'))
    return true;
  var rv = element.ac.keyPress(evt);
  if (rv == false)
    evt.cancelBubble = true;
  return rv;
}

function acReferenceKeyUp(element, evt) {
  if (!element.ac || element.getAttribute('readonly'))
    return true;
  return element.ac.keyUp(evt);
}
addRenderEvent(function() {
  var statusEl = document.getElementById('ac.status');
  if (!statusEl) {
    statusEl = document.createElement('span');
    statusEl.id = 'ac.status';
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.classList.add('sr-only');
    document.body.appendChild(statusEl);
  }
})
var AJAXReferenceCompleter = Class.create(AJAXCompleter, {
      PROCESSOR: "Reference",
      initialize: function(element, reference, dependentReference, refQualElements, targetTable, referenceValid) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        this.className = "AJAXReferenceCompleter";
        this.element = $(element);
        this.keyElement = gel(reference);
        this.setDependent(dependentReference);
        this.setRefQualElements(refQualElements);
        this.setTargetTable(targetTable);
        this.additionalValues = {};
        CustomEvent.observe('domain_scope_changed', this.cacheClear.bind(this));
        this._commonSetup();
        this.oneMatchSelects = true;
        this.clearDerivedFields = true;
        this.allowInvalid = this.element.readAttribute('allow_invalid') == 'true';
        this.dynamicCreate = this.element.readAttribute('data-ref-dynamic') == 'true';
        this.isList = this.element.readAttribute('islist') == 'true';
        if (!this.simpleQualifier)
          this.refQual = "";
        this.isFilterUsingContains = this.element.readAttribute('is_filter_using_contains') == 'true';
        this.referenceValid = referenceValid;
      },
      _commonSetup: function() {
        this.element.ac = this;
        Event.observe(this.element, 'blur', this.onBlurEvent.bind(this));
        Event.observe(this.element, 'focus', this.onFocus.bind(this));
        this.saveKeyValue = this.getKeyValue();
        this.currentDisplayValue = this.getDisplayValue();
        this.searchChars = "";
        this.rowCount = 0;
        this.ignoreFocusEvent = false;
        this.max = 0;
        this.cacheClear();
        this.hasFocus = true;
        this.isResolvingFlag = false;
        var f = this.element.readAttribute("function");
        if (f)
          this.selectionCallBack = f;
        addUnloadEvent(this.destroy.bind(this));
        this._setupAccessibility();
        this._setUpDocMouseDown();
      },
      isResolving: function() {
        return this.isResolvingFlag;
      },
      destroy: function() {
        this.element = null;
        this.keyElement = null;
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
        } else if (typedChar == KEY_TAB && !window.g_accessibility) {
          if (this.hasDropDown() && this.select())
            this.clearTimeout();
          else
            this.onBlur();
        } else if (typedChar == KEY_TAB && window.g_accessibility) {
          if (this.searchChars && this.searchChars != this.currentDisplayValue)
            this.element.value = '';
          this.clearDropDown();
        } else if (typedChar == KEY_ESC) {
          this.element.value = '';
          this.clearDropDown();
        }
      },
      keyUp: function(evt) {
        var typedChar = getKeyCode(evt);
        if (!this.isDeleteKey(typedChar))
          return;
        this.clearTimeout();
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
      },
      setSelection: function(itemNumber) {
        AJAXCompleter.prototype.setSelection.call(this, itemNumber);
        this.element.setAttribute('aria-activedescendant', this.selectedItemObj.id);
        this.setStatus(this.selectedItemObj.innerText);
        this.selectedItemObj.setAttribute('aria-selected', 'true');
      },
      _handleDeleteKey: function() {},
      clearTimeout: function() {
        if (this.timer != null)
          clearTimeout(this.timer);
        this.timer = null;
      },
      keyPress: function(eventArg) {
        var evt = getEvent(eventArg);
        var typedChar = getKeyCode(evt);
        if (typedChar != KEY_ENTER && typedChar != KEY_RETURN)
          this.clearTimeout();
        if (this.isNavigation(typedChar))
          return true;
        if (!evt.shiftKey && (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP))
          return false;
        if (this.isDeleteKey(typedChar))
          return true;
        if (typedChar == KEY_ENTER || typedChar == KEY_RETURN) {
          if (this.hasDropDown() && this.select())
            this.clearTimeout();
          else
            this.onBlur();
          if (this.enterSubmits) {
            this.element.setValue(trim(this.element.getValue()));
            return true;
          }
          return false;
        }
        if (typedChar == this.KEY_ESC) {
          this.clearDropDown();
          return false;
        }
        this.timer = setTimeout(this.ajaxRequest.bind(this), g_acWaitTime || 50);
        return true;
      },
      isNavigation: function(typedChar) {
        if (typedChar == this.KEY_TAB)
          return true;
        if (typedChar == this.KEY_LEFT)
          return true;
        if (typedChar == this.KEY_RIGHT)
          return true;
      },
      isDeleteKey: function(typedChar) {
        if (typedChar == this.KEY_BACKSPACE || typedChar == this.KEY_DELETE)
          return true;
      },
      _getSearchChars: function() {
        if (this._checkDoubleByteEncodedCharacter(this.getDisplayValue()))
          return this._translateDoubleByteIntoSingleByte(this.getDisplayValue());
        else
          return this.getDisplayValue();
      },
      _checkDoubleByteEncodedCharacter: function(s) {
        if (typeof s === 'undefined' || s.length === 0)
          return false;
        var char = s.charCodeAt(0);
        return char === 12288 || (65280 < char && char < 65375);
      },
      _translateDoubleByteIntoSingleByte: function(s) {
        var str = '';
        for (var i = 0, l = s.length, char; i < l; i++) {
          char = s.charCodeAt(i);
          if (char == 12288)
            str += String.fromCharCode(32);
          else if (65280 < char && char < 65375)
            str += String.fromCharCode(char - 65248);
          else
            str += s[i];
        }
        return str;
      },
      ajaxRequest: function() {
        var s = this._getSearchChars();
        if (s.length == 0 && !this.isDoctype()) {
          this.clearDropDown();
          this.searchChars = null;
          return;
        }
        if (s == "*")
          return;
        this.searchChars = s;
        var xml = this.cacheGet(s);
        if (xml) {
          this.processXML(xml);
          return;
        }
        if (this.cacheEmpty()) {
          this.clearDropDown();
          this.hideDropDown();
          return;
        }
        var url = "";
        url += this.addSysParms();
        url += this.addDependentValue();
        url += this.addRefQualValues();
        url += this.addTargetTable();
        url += this.addAdditionalValues();
        url += this.addAttributes("ac_");
        this.callAjax(url);
      },
      callAjax: function(url) {
        this.isResolvingFlag = true;
        var ga = new GlideAjax(this.PROCESSOR);
        ga.setQueryString(url);
        ga.setErrorCallback(this.errorResponse.bind(this));
        ga.getXML(this.ajaxResponse.bind(this), null, null);
      },
      ajaxResponse: function(response) {
        if (!response.responseXML || !response.responseXML.documentElement) {
          this.isResolvingFlag = false;
          return;
        }
        var xml = response.responseXML;
        var e = xml.documentElement;
        var timer = e.getAttribute("sysparm_timer");
        if (timer != this.timer)
          return;
        this.timer = null;
        this.clearDropDown();
        this.cachePut(this.searchChars, xml);
        this.processXML(xml);
        this.isResolvingFlag = false;
        if (this.onResolveCallback)
          this.onResolveCallback();
      },
      errorResponse: function() {
        this.isResolvingFlag = false;
      },
      processXML: function(xml) {
        var e = xml.documentElement;
        this._processDoc(e);
        var values = this._processItems(xml);
        var recents = this._processRecents(xml);
        if (!this.hasFocus) {
          this._processBlurValue(values, recents);
          return;
        }
        this.createDropDown(values, recents);
      },
      _processItems: function(xml) {
        var items = xml.getElementsByTagName("item");
        var values = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var array = this.copyAttributes(item);
          array['XML'] = item;
          values[values.length] = array;
        }
        return values;
      },
      _processRecents: function(xml) {
        var recents = [];
        var items = xml.getElementsByTagName("recent");
        for (var i = 0; i < items.length; i++) {
          var rec = this.copyAttributes(items[i]);
          rec.XML = items[i];
          recents.push(rec);
        }
        return recents;
      },
      _processBlurValue: function(values, recents) {
        this.ignoreFocusEvent = false;
        values = values || [];
        recents = recents || [];
        if (values.length + recents.length === 0 && this.searchChars.length > 0) {
          this.setInvalid();
          return;
        }
        if (!this.oneMatchSelects || this.getDisplayValue() === '')
          return;
        var targetLabel, targetValue;
        if (values.length + recents.length == 1) {
          var target = recents.length == 1 ? recents[0] : values[0];
          targetLabel = target.label;
          targetValue = target.name;
        }
        if (recents[0] && recents[0].label == this.getDisplayValue()) {
          var matchesRecent = recents[1] && recents[0].label == recents[1].label;
          var matchesValue = values[0] && recents[0].label == values[0].label;
          if (!matchesRecent && !matchesValue) {
            targetLabel = recents[0].label;
            targetValue = recents[0].name;
          }
        } else if (values[0] && values[0].label == this.getDisplayValue()) {
          var matchesSecondValue = values[1] && values[0].label == values[1].label;
          if (!matchesSecondValue) {
            targetLabel = values[0].label;
            targetValue = values[0].name;
          }
        }
        if (targetLabel)
          this.referenceSelect(targetValue, targetLabel);
      },
      _processDoc: function(doc) {
        this.rowCount = doc.getAttribute('row_count');
        this.max = doc.getAttribute('sysparm_max');
      },
      addSysParms: function() {
        var name = this.elementName;
        if (this.elementName.indexOf('IO:') > -1)
          name = this.elementName.substring(this.elementName.indexOf("IO:"), this.elementName.length);
        var sp = "sysparm_name=" + name +
          "&sysparm_timer=" + this.timer +
          "&sysparm_max=" + this.max +
          "&sysparm_chars=" + encodeText(this.searchChars);
        if (this.guid)
          sp += "&sysparm_completer_id=" + this.guid;
        if (this.ignoreRefQual)
          sp += "&sysparm_ignore_ref_qual=true";
        else if (this.refQual != "" && typeof this.refQual != "undefined")
          sp += "&sysparm_ref_qual=" + this.refQual;
        var domain = gel("sysparm_domain");
        if (domain)
          sp += "&sysparm_domain=" + domain.value;
        return sp;
      },
      addTargetTable: function() {
        var answer = "";
        if (this.getTargetTable()) {
          answer = "&sysparm_reference_target=" + this.getTargetTable();
        }
        return answer;
      },
      addAdditionalValues: function() {
        var answer = "";
        for (var n in this.additionalValues)
          answer += "&" + n + "=" + encodeText(this.additionalValues[n]);
        return answer;
      },
      addAttributes: function(prefix) {
        var answer = "";
        var attributes = this.element.attributes;
        for (var n = 0; n < attributes.length; n++) {
          var attr = attributes[n];
          var name = attr.nodeName;
          if (name.indexOf(prefix) != 0)
            continue;
          var v = attr.nodeValue;
          answer += "&" + name + "=" + v;
        }
        return answer;
      },
      copyAttributes: function(node) {
        var attributes = new Array();
        for (var n = 0; n < node.attributes.length; n++) {
          var attr = node.attributes[n];
          var name = attr.nodeName;
          var v = attr.nodeValue;
          attributes[name] = v;
        }
        return attributes;
      },
      createDropDown: function(foundStrings, foundRecents) {
        this.clearDropDown();
        this.createInnerDropDown();
        if (foundRecents && foundRecents.length > 0) {
          this._showRecents();
          for (var i = 0; i < foundRecents.length; i++) {
            var rec = foundRecents[i];
            var recchild = this.createChild(rec);
            recchild.acItem = rec;
            this.appendItem(recchild);
            this.addMouseListeners(recchild);
          }
        }
        if (foundStrings && foundStrings.length > 0) {
          this._showMax(foundStrings, foundRecents);
          for (var c = 0; c < foundStrings.length; c++) {
            if (this.max > 0 && c >= this.max)
              break;
            var x = foundStrings[c];
            var child = this.createChild(x);
            child.acItem = x;
            this.appendItem(child);
            this.addMouseListeners(child);
          }
        }
        if (this.currentMenuCount) {
          this.setDropDownSize();
          this.showDropDown();
          if (isTextDirectionRTL()) {
            var diff = parseInt(this.dropDown.style.width) - this.getWidth();
            if (diff < 0)
              diff = 0;
            var w = 0;
            if (isMSIE8 || isMSIE7 || isMSIE6 || (isMSIE9 && (getPreference('glide.ui11.use') == "false"))) {
              if (typeof g_form != "undefined")
                w = this.element.offsetParent ? this.element.offsetParent.clientWidth : 0;
            }
            this.dropDown.style.left = (parseInt(this.dropDown.style.left) - diff) + w + "px";
            this.iFrame.style.left = (parseInt(this.iFrame.style.left) - diff) + w + "px";
            if (parseInt(this.dropDown.style.left) < 0) {
              this.dropDown.style.left = 0 + "px";
              this.iFrame.style.left = 0 + "px";
            }
          }
          var height = this.dropDown.clientHeight;
          this.setHeight(height);
          this.firefoxBump();
          var msg = '{0} suggestions. Please use the up and down arrow keys to select a value';
          if (this.currentMenuCount == 1)
            msg = '1 suggestion. Please use the up and down arrow keys to select a value';
          var messageAPI = new GwtMessage();
          messageAPI.fetch([msg], function(msgs) {
            var msgWithValues = messageAPI.format(msgs[msg], this.currentMenuCount);
            this.setStatus(msgWithValues);
          }.bind(this))
        }
        this._setActive();
        _frameChanged();
      },
      createInnerDropDown: function() {},
      _showRecents: function() {
        this._addHeaderRow("Recent selections");
      },
      _showMax: function(foundStrings, foundRecents) {
        if (foundRecents && foundRecents.length > 0)
          this._addHeaderRow("Search");
      },
      _addHeaderRow: function(message) {
        var row = cel("div");
        row.className = "ac_header";
        row.setAttribute("width", "100%");
        row.innerHTML = new GwtMessage().getMessage(message);
        this.appendElement(row);
      },
      select: function() {
        if (this.selectedItemNum < 0)
          return false;
        var o = this.getSelectedObject().acItem;
        this.referenceSelect(o['name'], o['label']);
        this.clearDropDown();
        return true;
      },
      _setDisplayValue: function(v) {
        var e = this.getDisplayElement();
        if (e.value == v)
          return;
        e.value = v;
      },
      referenceSelectTimeout: function(sys_id, displayValue) {
        this.selectedID = sys_id;
        this.selectedDisplayValue = displayValue;
        if (typeof reflistModalPick == "function")
          this._referenceSelectTimeout();
        else
          setTimeout(this._referenceSelectTimeout.bind(this), 0);
      },
      _referenceSelectTimeout: function() {
        this.referenceSelect(this.selectedID, this.selectedDisplayValue);
      },
      referenceSelect: function(sys_id, displayValue, referenceInvalid) {
        this._setDisplayValue(displayValue);
        var e = this.getKeyElement();
        if (e.value != sys_id) {
          e.value = sys_id;
          callOnChange(e);
        }
        this.searchChars = displayValue;
        this.currentDisplayValue = displayValue;
        this.showViewImage();
        if (!referenceInvalid)
          this.clearInvalid();
        this._clearDerivedFields();
        if (this.selectionCallBack && sys_id) {
          eval(this.selectionCallBack);
        }
        if (e["filterCallBack"]) {
          e.filterCallBack();
        }
      },
      setFilterCallBack: function(f) {
        var e = this.getKeyElement();
        e["filterCallBack"] = f
      },
      _clearDerivedFields: function() {
        if (this.clearDerivedFields && window['DerivedFields']) {
          var df = new DerivedFields(this.keyElement.id);
          df.clearRelated();
          df.updateRelated(this.getKeyValue());
        }
      },
      showViewImage: function() {
        var element = gel("view." + this.keyElement.id);
        var elementR = gel("viewr." + this.keyElement.id);
        var noElement = gel("view." + this.keyElement.id + ".no");
        var sys_id = this.getKeyValue();
        if (sys_id == "") {
          hideObject(element);
          hideObject(elementR);
          showObjectInlineBlock(noElement);
        } else {
          showObjectInlineBlock(element);
          showObjectInlineBlock(elementR);
          hideObject(noElement);
        }
      },
      createChild: function(item) {
        return this._createChild(item, item['label']);
      },
      _createChild: function(item, text) {
        var div = cel(TAG_DIV);
        div.ac = this;
        div.acItem = item;
        div.id = 'ac_option_' + item.name;
        div.setAttribute('role', 'option');
        var itemInRow = cel(TAG_SPAN, div);
        itemInRow.innerHTML = (text + '').escapeHTML();
        return div;
      },
      addMouseListeners: function(element) {
        element.onmousedown = this.onMouseDown.bind(this, element);
        element.onmouseup = this.onMouseUp.bind(this, element);
        element.onmouseover = this.onMouseOver.bind(this, element);
        element.onmouseout = this.onMouseOut.bind(this, element);
      },
      onMouseUp: fun