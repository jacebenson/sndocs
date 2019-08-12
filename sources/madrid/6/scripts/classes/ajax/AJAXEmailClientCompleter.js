/*! RESOURCE: /scripts/classes/ajax/AJAXEmailClientCompleter.js */
var g_key_delay = 250;
var AJAXEmailClientCompleter = Class.create(AJAXTableCompleter, {
      PROCESSOR: "com.glide.email_client.EmailClient",
      initialize: function(element, reference, dependentReference, refQualElements, targetTable, inputSpan, options) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        options = options || {};
        this.className = "AJAXEmailClientCompleter";
        this.inputSpan = inputSpan;
        this.element = $(element);
        this.keyElement = gel(reference);
        this.setTargetTable(targetTable);
        this.additionalValues = {};
        this.renderItemTemplate = null;
        if (options.renderItemTemplate) {
          this.renderItemTemplate = options.renderItemTemplate;
        }
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
          else {
            this.onBlur();
            if (typedChar != KEY_TAB)
              this.hasFocus = true;
          }
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
            var selectionObj = {};
            selectionObj.sysId = values[0]['name'];
            selectionObj.label = values[0]['label'] || this.getEmailAddressFromACResultXML(values[0].XML);
            var addressFilterIds = this.getAddressFilterIds();
            if (addressFilterIds)
              this.proccessXmlResultAndValidateAgainstFilters(selectionObj, xml, addressFilterIds);
            else
              this.renderSelection(selectionObj.sysId, selectionObj.label);
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
        var acItem = this.getSelectedObject().acItem;
        var selectionObj = {};
        selectionObj.sysId = acItem['name'];
        selectionObj.label = acItem['label'] || this.getEmailAddressFromACResultXML(acItem.XML);
        var addressFilterIds = this.getAddressFilterIds();
        if (addressFilterIds)
          this.proccessXmlResultAndValidateAgainstFilters(selectionObj, acItem.XML, addressFilterIds);
        else
          this.renderSelection(selectionObj.sysId, selectionObj.label);
        return true;
      },
      renderSelection: function(sysId, label) {
        if (!sysId)
          return;
        var name = htmlEscape(sysId);
        var label = htmlEscape(label);
        this.referenceSelect(sysId, label);
        var s = gel(this.inputSpan);
        if (this.renderItemTemplate) {
          s.innerHTML = s.innerHTML + this.renderItemTemplate(sysId, label);
        } else {
          s.innerHTML = s.innerHTML + '<span class="address" tabindex="-1" onclick="addressOnClick(event, this)" style="white-space:nowrap;" value="' + sysId + '" aria-label="' + label + '">' + label + ';</span> ';
        }
        this.resetInputField();
      },
      validateAgainstFilters: function(selectionObj, email, addressFilters) {
        var ga = new GlideAjax('EmailAddressValidator');
        ga.addParam("sysparm_name", "applyFilters");
        ga.addParam("sysparm_email_address", email);
        ga.addParam("sysparm_address_filters", addressFilters);
        ga.getXML(this.validateAgainstFiltersCallback.bind(this), null, selectionObj);
      },
      validateAgainstFiltersCallback: function(answer, requestParams) {
          var resultXml = answer.responseXML.documentElement.getElementsByTagName("result");
          if (resultXml && resultXml.length != 0) {
            var r