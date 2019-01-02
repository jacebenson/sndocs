function getSCFormElement(tableName, fieldName, type, mandatory, reference, attributes) {
  if (typeof g_sc_form != 'undefined') {
    var elem = g_sc_form.getGlideUIElement(fieldName);
    if (typeof elem != 'undefined')
      return elem;
  }
  return new GlideUIElement(tableName, fieldName, type, mandatory, reference, attributes);
}
var ServiceCatalogForm = Class.create(GlideForm, {
  initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger) {
    GlideForm.prototype.initialize.call(this, tableName, mandatory, checkMandatory, checkNumeric, checkInteger);
    this.onCatalogSubmit = new Array();
  },
  addOption: function(fieldName, choiceValue, choiceLabel, choiceIndex) {
    var realName = this.resolveNameMap(fieldName);
    var control = this.getControl(this.removeCurrentPrefix(realName));
    if (!control)
      return;
    if (!control.options)
      return;
    var opts = control.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == choiceValue) {
        control.remove(i);
        break;
      }
    var len = control.options.length;
    if (choiceIndex == undefined || choiceIndex < 0 || choiceIndex > len)
      choiceIndex = len;
    var newOption = new Option(choiceLabel, choiceValue);
    var value = choiceValue;
    if (len > 0) {
      value = this.getValue(fieldName);
      control.options[len] = new Option('', '');
      for (var i = len; i > choiceIndex; i--) {
        control.options[i].text = control.options[i - 1].text;
        control.options[i].value = control.options[i - 1].value;
      }
    }
    control.options[choiceIndex] = newOption;
    var original = gel('sys_original.' + control.id);
    if (original) {
      if (original.value == choiceValue)
        this.setValue(fieldName, original.value);
    } else
      this.setValue(fieldName, value);
  },
  fieldChanged: function() {
    this.modified = true;
  },
  getMissingFields: function(answer) {
    var fa = this.elements;
    if (!answer)
      answer = new Array();
    for (var i = 0; i < fa.length; i++) {
      var ed = fa[i];
      if (ed.mandatory && this.getControl(ed.fieldName) && this._isMandatoryFieldEmpty(ed)) {
        var found = false;
        for (var j = 0; j < answer.length; j++)
          if (answer[j] == ed.fieldName)
            found = true;
        if (!found)
          answer.push(ed.fieldName);
      }
    }
    return answer;
  },
  _setCatalogCheckBoxDisplay: function(id, d) {
    var id = this.resolveNameMap(id);
    var nidot = gel('ni.' + id);
    if (!nidot)
      return false;
    var iotable = nidot.parentNode;
    while (!hasClassName(iotable, "io_table"))
      iotable = iotable.parentNode;
    if (hasClassName(iotable, "io_table")) {
      if (d != "none") {
        iotable.style.display = d;
        nidot.parentNode.style.display = d;
        this._setCatalogSpacerDisplay(iotable, d);
      } else {
        var hideParent = true;
        var inputs = iotable.getElementsByTagName('input');
        for (var h = 0; h < inputs.length; h++) {
          if (inputs[h].id.indexOf('ni.') == 0 &&
            inputs[h].type != 'hidden' &&
            inputs[h].parentNode.style.display != "none" &&
            inputs[h].id != nidot.id) {
            hideParent = false;
          }
        }
        if (hideParent) {
          iotable.style.display = d;
          this._setCatalogSpacerDisplay(iotable, d);
        }
        nidot.parentNode.style.display = d;
      }
    }
    return true;
  },
  _setCatalogSpacerDisplay: function(table, d) {
    var spacer = table.parentNode.parentNode.previousSibling;
    if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
      spacer.style.display = d;
  },
  setCatalogDisplay: function(id, d) {
    var id = this.resolveNameMap(id);
    if (this._setCatalogCheckBoxDisplay(id, d))
      return;
    var label = gel('label_' + id);
    if (label) {
      if (hasClassName(label, 'io_label_container'))
        label.style.display = d;
      else
        label.parentNode.parentNode.style.display = d;
      this._setCatalogSpacerDisplay(label.parentNode.parentNode, d);
    }
    var readonlyRow = gel(id + '_read_only');
    if (readonlyRow)
      readonlyRow.style.display = d;
  },
  setCatalogVisibility: function(id, d) {
    var id = this.resolveNameMap(id);
    var label = gel('label_' + id);
    if (label)
      label.parentNode.parentNode.style.visibility = d;
    var help = gel('help_' + id + '_wrapper');
    if (help)
      help.style.visibility = d;
    var spacer = gel('spacer_' + id);
    if (spacer) {
      spacer.style.visibility = d;
    }
  },
  removeCurrentPrefix: function(id) {
    return this.removeVariablesPrefix(GlideForm.prototype.removeCurrentPrefix.call(this, id));
  },
  removeVariablesPrefix: function(id) {
    var VARIABLES_PREFIX = "variables.";
    if (id.startsWith(VARIABLES_PREFIX))
      id = id.substring(VARIABLES_PREFIX.length);
    return id;
  },
  _cleanupName: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    fieldName = fieldName.split(':');
    if (fieldName.length != 2)
      return fieldName[0];
    fieldName = fieldName[1];
    return fieldName;
  },
  setContainerDisplay: function(fieldName, display) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var container = gel('container_' + fieldName) || gel('element.container_' + fieldName);
    if (!container) {
      var containerVariable = gel(fieldName);
      if (!containerVariable)
        return false;
      fieldName = containerVariable.getAttribute('container_id');
      if (!fieldName)
        return false;
      container = gel('container_' + fieldName) || gel('element.container_' + fieldName);
      if (!container)
        return false;
    }
    var d = 'none';
    if (display == 'true' || display == true)
      d = '';
    container.style.display = d;
    container.style.display = d;
    _frameChanged();
    return true;
  },
  hideSection: function(fieldName) {
    this.hideReveal(fieldName, false);
  },
  revealSection: function(fieldName) {
    this.hideReveal(fieldName, true);
  },
  hideReveal: function(fieldName, expand) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var row = gel('row_' + fieldName);
    if (!row)
      return false;
    if (expand && row.style.display == 'none')
      toggle = true;
    else if (!expand && row.style.display != 'none')
      toggle = true;
    if (toggle)
      toggleVariableSet(fieldName);
  },
  setDisplay: function(id, display) {
    if (this.setContainerDisplay(id, display))
      return;
    id = this.removeCurrentPrefix(id);
    var s = this.tableName + '.' + id;
    var fieldName = id;
    var control = this.getControl(fieldName);
    if (!control)
      return;
    if (display == 'true')
      display = true;
    var fieldValue = this.getValue(fieldName);
    if ((display != true) && this.isMandatory(fieldName) && (fieldValue == null || fieldValue.blank()))
      return;
    var d = 'none';
    var parentClass = '';
    if (display) {
      d = '';
      parentClass = 'label';
    }
    this.setCatalogDisplay(id, d);
    _frameChanged();
    return;
  },
  setVisible: function(id, visibility) {
    id = this.removeCurrentPrefix(id);
    var s = this.tableName + '.' + id;
    var fieldName = id;
    var control = this.getControl(fieldName);
    if (!control)
      return;
    var v = 'hidden';
    var parentClass = '';
    if (visibility == 'true')
      visibility = true;
    if (visibility) {
      v = 'visible';
      parentClass = 'label';
    }
    this.setCatalogVisibility(id, v);
    return;
  },
  setMandatory: function(fieldName, mandatory) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    var foundIt = this._setMandatory(this.elements, fieldName, mandatory);
    if (foundIt == false && g_form != null && window.g_sc_form && g_form != g_sc_form) {
      this._setMandatory(g_form.elements, fieldName, mandatory);
    }
  },
  debounceMandatoryChanged: function() {
    var that = this;
    if (this.debounceMandatoryChangedTimeout) {
      clearTimeout(this.debounceMandatoryChangedTimeout);
    }
    this.debounceMandatoryChangedTimeout = setTimeout(function() {
      that.debounceMandatoryChangedTimeout = null;
      CustomEvent.fire("mandatory.changed");
    }, 300);
  },
  _setMandatory: function(elements, fieldName, mandatory) {
    var foundIt = false;
    for (var x = 0; x < elements.length; x++) {
      var thisElement = elements[x];
      var thisField = thisElement.fieldName;
      if (thisField == fieldName) {
        foundIt = true;
        thisElement.mandatory = mandatory;
        var className = '';
        var classTitle = '';
        if (mandatory && !this.getValue(fieldName, mandatory).blank()) {
          className = "mandatory_populated";
          classTitle = 'Mandatory - preloaded with saved data';
        } else if (mandatory) {
          className = 'mandatory';
          classTitle = 'Mandatory - must be populated before Submit';
        }
        var niElem = $("ni." + fieldName);
        if (niElem && niElem.type == "checkbox")
          this.changeCatLabel($(fieldName).getAttribute("gsftContainer"), className, classTitle);
        else
          this.changeCatLabel(fieldName, className, classTitle);
        this.debounceMandatoryChanged();
        setMandatoryExplained();
      }
    }
    return foundIt;
  },
  changeCatLabel: function(fieldName, className, classTitle) {
    var d = $('status.' + fieldName);
    if (d) {
      if (d.className == 'changed') {
        d.setAttribute("oclass", className);
      } else {
        d.setAttribute("oclass", '');
        d.className = className;
      }
      if (typeof classTitle != 'undefined')
        d.setAttribute('title', classTitle);
      var s = $('section508.' + fieldName);
      if (s && typeof classTitle != 'undefined') {
        s.setAttribute('title', classTitle);
        s.setAttribute('alt', classTitle);
      }
    }
  },
  getCatLabel: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var label = $('status.' + realName);
    if (label)
      return label;
    return label;
  },
  notifyCatLabelChange: function(fieldName) {
    var mandatory = false;
    var nValue = this.getValue(fieldName);
    var fType = this.getControl(fieldName).className;
    var realName = this.resolveNameMap(fieldName);
    var original = gel('sys_original.' + realName);
    var oValue = 'unknown';
    if (original)
      oValue = original.value;
    var newClass = 'changed';
    var oldClass = '';
    var sl = this.getCatLabel(fieldName);
    if (!sl) {
      var control = this.getControl(fieldName);
      if (!control)
        return;
      var container = control.getAttribute("gsftContainer");
      if (container)
        sl = $('status.' + container);
    }
    if (!sl)
      return;
    if (sl.className == 'mandatory' || sl.getAttribute('oclass') == 'mandatory' || sl.className == 'mandatory_populated' || sl.getAttribute('oclass') == 'mandatory_populated')
      mandatory = true;
    if (container)
      var hasContainerChanged = this._containerValuesChanged(container);
    oldClass = sl.className;
    if (mandatory && nValue.blank())
      newClass = 'mandatory';
    else if (mandatory && fType == "cat_item_option" && nValue == "")
      newClass = 'mandatory';
    else if (mandatory && fType == "cat_item_option" && nValue != "") {
      if (nValue != oValue)
        newClass = 'changed';
      else
        newClass = 'mandatory_populated';
    } else if (container)
      newClass = hasContainerChanged ? 'changed' : '';
    else if (oValue == nValue)
      newClass = sl.getAttribute("oclass");
    sl.className = newClass;
    if (oldClass != newClass)
      sl.setAttribute("oclass", oldClass);
    this.debounceMandatoryChanged();
  },
  onSubmit: function() {
    var action = this.getActionName();
    if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete')
      return true;
    var rc = this.mandatoryCheck();
    rc = rc && this.validate();
    return rc;
  },
  flashTab: function(pNode, flash) {
    if (flash) {
      var touchScroll = $$("div.touch_scroll");
      if (touchScroll.size() > 0) {} else
        scrollTo(0, 0);
      var interval;
      var count = 0;
      var flip = false;
      interval = setInterval(function() {
        if (count > 4) {
          clearInterval(interval);
        } else {
          if (flip)
            pNode.style.background = "#FFFACD";
          else
            pNode.style.background = "";
          count++;
          flip = !flip;
        }
      }, 500);
    }
  },
  firstRunComplete: false,
  completeTabs: "",
  incompleteTabs: "",
  removeTab: function(tabs, id) {
    var newTabs = '';
    var parts = tabs.split(",");
    for (var i = 0; i < parts.length; i++)
      if (parts[i] != id) {
        if (newTabs.length > 0)
          newTabs += ',';
        newTabs += parts[i];
      }
    return newTabs;
  },
  addCompleteTab: function(id) {
    if (this.completeTabs.indexOf(id) < 0) {
      if (this.completeTabs.length > 0)
        this.completeTabs += ",";
      this.completeTabs += id;
    }
    this.incompleteTabs = this.removeTab(this.incompleteTabs, id);
  },
  addIncompleteTab: function(id) {
    if (this.incompleteTabs.indexOf(id) < 0) {
      if (this.incompleteTabs.length > 0)
        this.incompleteTabs += ',';
      this.incompleteTabs += id;
    }
    this.completeTabs = this.removeTab(this.completeTabs, id);
  },
  getCompleteTabs: function() {
    return this.completeTabs || '';
  },
  getIncompleteTabs: function() {
    return this.incompleteTabs || '';
  },
  setCompleteTabs: function(val) {
    this.completeTabs = val || '';
  },
  setIncompleteTabs: function(val) {
    this.incompleteTabs = val || '';
  },
  checkTabForms: function(flash) {
    var rc = true;
    if (typeof tab_frames != "undefined") {
      for (var i = 0; i < tab_frames.length; i++) {
        var fr = tab_frames[i];
        var tabElem = $("tab_ref_" + fr);
        var pNode = tabElem.parentNode;
        var result = false;
        if (this.completeTabs.indexOf(fr) > -1)
          result = true;
        else if (this.incompleteTabs.indexOf(fr) > -1)
          result = false;
        else {
          var frame = $("item_frame_" + fr);
          if (frame) {
            var form = frame.contentWindow.g_form;
            result = form.mandatoryCheck(true, false);
          }
        }
        if (result) {
          this.addCompleteTab(fr);
          tabElem.removeClassName("mandatory");
          tabElem.addClassName("not_mandatory");
        } else {
          this.addIncompleteTab(fr);
          tabElem.addClassName("mandatory");
          tabElem.removeClassName("not_mandatory");
          rc = false;
          this.flashTab(pNode, flash);
        }
      }
      if (rc == false && this.firstRunComplete) {
        var touchScroll = $$("div.touch_scroll");
        if (touchScroll.size() > 0)
          alert(getMessage('There are tabs containing mandatory fields that are not filled in'));
      }
      this.firstRunComplete = true;
    }
    return rc;
  },
  mandatoryCheck: function(isHiddenForm, checkFrames) {
    if (!this.checkMandatory)
      return true;
    var fa = this.elements;
    var rc = true;
    var fc = true;
    if (checkFrames)
      fc = this.checkTabForms(true);
    var invalidFields = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      if (!ed.mandatory)
        continue;
      var widget = this.getControl(ed.fieldName);
      if (!widget)
        continue;
      var widgetValue = this.getValue(ed.fieldName);
      if (widgetValue == null || widgetValue.blank()) {
        var rowWidget = gel('sys_row');
        var row = 0;
        if (rowWidget)
          row = parseInt(rowWidget.value);
        if (row != -1) {
          if (this.mandatory == false) {
            widgetName = "sys_original." + this.tableName + '.' + ed.fieldName;
            widget = gel(widgetName);
            if (widget) {
              widgetValue = widget.value;
              if (widgetValue == null || widgetValue.blank())
                continue;
            }
          }
        }
        rc = false;
        var tryLabel = false;
        try {
          if (!isHiddenForm)
            widget.focus();
        } catch (e) {
          tryLabel = true;
        }
        if (tryLabel) {
          var displayWidget = this.getDisplayBox(ed.fieldName);
          if (displayWidget) {
            try {
              if (!isHiddenForm)
                displayWidget.focus();
            } catch (exception) {}
          }
        }
        var realName = this.resolveNameMap(ed.fieldName);
        var widgetLabel = this.getLabelOf(ed.fieldName);
        var shortLabel = trim(widgetLabel + '');
        invalidFields.push(shortLabel);
        labels.push('label_' + realName);
      }
    }
    if (!rc && !isHiddenForm) {
      var theText = invalidFields.join(', ');
      theText = getMessage('The following mandatory fields are not filled in') + ': ' + theText;
      try {
        alert(theText);
      } catch (e) {}
    }
    if (!isHiddenForm) {
      for (var x = 0; x < labels.length; x++) {
        this.flash(labels[x], "#FFFACD", 0);
      }
    }
    return rc && fc;
  },
  getControls: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    return document.getElementsByName(widgetName);
  },
  getControl: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    var possibles = document.getElementsByName(widgetName);
    if (possibles.length == 1)
      return possibles[0];
    else {
      var widget;
      for (var x = 0; x < possibles.length; x++) {
        if (possibles[x].checked) {
          widget = possibles[x];
          break;
        }
      }
      if (!widget)
        widget = gel('sys_original.' + widgetName);
    }
    return widget;
  },
  getLabelOf: function(fieldName) {
    var fieldid = this.tableName + '.' + fieldName;
    fieldid = this.resolveNameMap(fieldName);
    var label = gel('label_' + fieldid);
    if (label) {
      var text = label.firstChild.innerText;
      if (!text)
        text = label.firstChild.textContent;
      return text;
    }
    return null;
  },
  validate: function() {
    var fa = this.elements;
    var rc = true;
    var invalid = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      var widgetName = this.tableName + '.' + ed.fieldName;
      var widget = this.getControl(ed.fieldName);
      if (widget) {
        var widgetValue = widget.value;
        var validator = this.validators[ed.type];
        if (validator) {
          var isValid = validator.call(this, widgetValue);
          if (!isValid) {
            var widgetLabel = this.getLabelOf(ed.fieldName);
            invalid.push(widgetLabel);
            labels.push(widgetName);
            rc = false;
          }
        }
      }
    }
    var theText = invalid.join(', ');
    theText = getMessage('The following fields contain invalid text') + ': ' + theText;
    if (!rc)
      alert(theText);
    for (var x = 0; x < labels.length; x++) {
      this.flash(labels[x], "#FFFACD", 0);
    }
    return rc;
  },
  setValue: function(fieldName, value, displayValue) {
    fieldName = this.removeCurrentPrefix(fieldName);
    var control = this.getControl(fieldName);
    this.secretSetValue(fieldName, value, displayValue);
    if (control != null) {
      triggerEvent(control, 'change');
      var id = control.getAttribute("id");
      if (id != null) {
        var niBox = this.getNiBox(id);
        if (niBox != null && niBox.getAttribute("type") == "checkbox") {
          variableOnChange(id);
          return;
        }
        if (niBox.className != null && niBox.className.indexOf('htmlField') != -1) {
          this._setValue(fieldName, value, displayValue);
          return;
        }
      }
      if (control.getAttribute("type") == "radio")
        if (control.onclick)
          control.onclick.call();
    }
  },
  getNiBox: function(fieldName) {
    var niName = 'ni.' + this.tableName + '.' + fieldName;
    var id = this.resolveNameMap(fieldName);
    if (id)
      niName = 'ni.' + id;
    var niBox = gel(niName);
    if (niBox == null)
      niBox = gel(id);
    return niBox;
  },
  getDisplayBox: function(fieldName) {
    var dName = 'sys_display.' + this.tableName + '.' + fieldName;
    var id = this.resolveNameMap(fieldName);
    if (id)
      dName = 'sys_display.' + id;
    var field = gel(dName);
    if (field)
      return field;
    dName = 'sys_display.' + fieldName;
    return gel(dName);
  },
  secretSetValue: function(fieldName, value, displayValue) {
    if (this.catalogSetValue(fieldName, value, displayValue))
      return;
    fieldName = this.removeCurrentPrefix(fieldName);
    var control = this.getControl(fieldName);
    var readOnlyField = gel('sys_readonly.' + control.id);
    if (readOnlyField) {
      readOnlyField.innerHTML = displayValue;
    } else {
      readOnlyField = gel(control.id + "_label");
      if (readOnlyField) {
        readOnlyField.value = displayValue;
      }
    }
    if (control.options) {
      var options = control.options;
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value == value) {
          control.selectedIndex = i;
          break;
        }
      }
    } else if (control.type == 'hidden') {
      var nibox = this.getNiBox(fieldName);
      if (nibox && nibox.type == 'checkbox') {
        control.value = value;
        if (value == 'true')
          nibox.checked = 'true';
        else
          nibox.checked = null;
        return;
      }
      var displaybox = this.getDisplayBox(fieldName);
      if (displaybox) {
        if (typeof(displayValue) != 'undefined') {
          if (displayValue != '')
            control.value = value;
          displaybox.value = displayValue;
          refFlipImage(displaybox, control.id);
          updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
          return;
        }
        control.value = value;
        if (value == null || value == '') {
          displaybox.value = '';
          refFlipImage(displaybox, control.id);
          return;
        }
        var ed = this.getGlideUIElement(fieldName);
        if (!ed)
          return;
        if (ed.type != 'reference')
          return;
        var refTable = ed.reference;
        if (!refTable)
          return;
        var ga = new GlideAjax('AjaxClientHelper');
        ga.addParam('sysparm_name', 'getDisplay');
        ga.addParam('sysparm_table', refTable);
        ga.addParam('sysparm_value', value);
        ga.getXMLWait();
        var displayValue = ga.getAnswer();
        displaybox.value = displayValue;
        refFlipImage(displaybox, control.id);
        updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
      }
    } else {
      control.value = value;
    }
  },
  catalogSetValue: function(fieldName, value, displayValue) {
    var widgetName = this.resolveNameMap(fieldName);
    var possibles = document.getElementsByName(widgetName);
    if (possibles.length == 1)
      return false;
    for (var x = 0; x < possibles.length; x++) {
      if (possibles[x].value == value) {
        possibles[x].checked = true;
      } else
        possibles[x].checked = false;
    }
    return true;
  },
  getGlideUIElement: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    for (var x = 0; x < this.elements.length; x++) {
      var thisElement = this.elements[x];
      if (thisElement.fieldName == fieldName)
        return thisElement;
    }
  },
  getReference: function(fieldName, callback) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    var ed = this.getGlideUIElement(fieldName);
    if (!ed)
      return;
    if (ed.type != 'reference')
      return;
    var value = this.getValue(fieldName);
    if (!value)
      return;
    var gr = new GlideRecord(ed.reference);
    gr.addQuery('sys_id', value);
    if (callback) {
      var fn = function(gr) {
        gr.next();
        callback(gr)
      };
      gr.query(fn);
      return;
    }
    gr.query();
    gr.next();
    return gr;
  },
  hasPricingImplications: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var ed = this.getGlideUIElement(realName);
    if (ed && ed.attributes == 'priceCheck') {
      return true;
    }
    return false;
  },
  submit: function() {
    var theText = getMessage('The g_form.submit function has no meaning on a catlog item. Perhaps you mean g_form.addToCart() or g_form.orderNow() instead');
    alert(theText);
    return;
  },
  flash: function(widgetName, color, count) {
    var row = null;
    var labels = new Array();
    var widget = gel(widgetName);
    widget = widget.firstChild;
    labels.push(widget);
    count = count + 1;
    for (var x = 0; x < labels.length; x++) {
      var widget = labels[x];
      if (widget) {
        var originalColor = widget.style.backgroundColor;
        widget.style.backgroundColor = color;
      }
    }
    if (count < 4)
      setTimeout('g_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
  },
  serialize: function(filterFunc) {
    if (typeof(g_cart) == 'undefined')
      g_cart = new SCCart();
    var cart = g_cart;
    var item = gel('sysparm_id');
    if (!item)
      item = gel('current_item');
    if (item)
      item = item.value;
    else
      item = 'none';
    var url = cart.generatePostString() + "&sysparm_id=" + encodeURIComponent(item);
    return url;
  },
  serializeChanged: function() {
    return this.serialize();
  },
  addToCart: function() {
    if (typeof(addToCart) == 'function')
      addToCart();
    else {
      var theText = getMessage('The add to cart function is usable only on catalog item forms');
      alert(theText);
    }
  },
  orderNow: function() {
    if (typeof(orderNow) == 'function')
      orderNow();
    else {
      var theText = getMessage('The order now function is usable only on catalog item forms');
      alert(theText);
    }
  },
  addCatalogSubmit: function(handler) {
    this.onCatalogSubmit.push(handler);
  },
  callCatalogSubmitHandlers: function() {
    for (var x = 0; x < this.onCatalogSubmit.length; x++) {
      var handler = this.onCatalogSubmit[x];
      var rc = handler.call(this);
      if (rc == false)
        return false;
    }
    return true;
  },
  catalogOnSubmit: function(ignoreFrames) {
    var rc = this.mandatoryCheck(false, !ignoreFrames);
    rc = rc && this.callCatalogSubmitHandlers();
    return rc;
  },
  isRadioControl: function(fieldName) {
    var radios = document.getElementsByName(fieldName);
    if (radios && radios[0]) {
      var radio = $(radios[0]);
      if (radio && radio.readAttribute('type') && radio.readAttribute('type') === 'radio')
        return true;
    }
    return false;
  },
  getRadioControlCheckedValue: function(fieldName) {
    var radios = document.getElementsByName(fieldName)
    var val = '';
    if (radios.length > 0)
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked)
          val = radios[i].value;
      }
    return val;
  },
  getValue: function(fieldName) {
    if (this.isRadioControl(fieldName)) {
      return this.getRadioControlCheckedValue(fieldName);
    } else {
      fieldName = this.removeCurrentPrefix(fieldName);
      var control = this.getControl(fieldName);
      if (!control)
        return '';
      return GlideForm.prototype._getValueFromControl.call(this, control);
    }
  },
  _setReadonly: function(fieldName, disabled, isMandatory, fieldValue) {
    fieldName = this.removeCurrentPrefix(fieldName);
    var control = this.getControl(fieldName);
    if (!control)
      return;
    var s = this.tableName + '.' + fieldName;
    var ge = this.getGlideUIElement(fieldName);
    if (typeof ge == "undefined" && this._formExists()) {
      var mapName = this.resolveNameMap(fieldName);
      for (var x = 0; x < g_form.elements.length; x++) {
        var thisElement = g_form.elements[x];
        var thisField = thisElement.fieldName;
        if (thisField == mapName) {
          ge = thisElement;
          s = mapName;
        }
      }
    }
    var lookup = gel('lookup.' + control.id);
    if (lookup)
      s = control.id;
    if (ge) {
      var possibles = this.getControls(fieldName);
      if (possibles && possibles.length > 1 && possibles[0].type == "radio") {
        for (var i = 0; i < possibles.length; i++)
          GlideForm.prototype._setReadonly0.call(this, ge, possibles[i], s, fieldName, disabled, isMandatory, fieldValue);
      } else
        GlideForm.prototype._setReadonly0.call(this, ge, control, s, fieldName, disabled, isMandatory, fieldValue);
      if (ge.type == "glide_date")
        this._displayDateSelector(control, !disabled);
      if (ge.type == "glide_date_time")
        this._displayDateSelector(control, !disabled);
    }
    if (this._formExists()) {
      var df = g_form.disabledFields.length;
      g_form.disabledFields[df] = control;
    }
    this._processReadOnlySlush(control, fieldName, disabled);
  },
  _displayDateSelector: function(control, display) {
    var selectId = "ni." + control.id + ".ui_policy_sensitive";
    if ($(selectId)) {
      if (display)
        $(selectId).show();
      else
        $(selectId).hide();
    }
  },
  _getAppliedFieldName: function(fieldName) {
    for (var i = 0; i < this.nameMap.length; i++) {
      if (this.nameMap[i].prettyName == fieldName)
        return this.nameMap[i].realName;
      else if (this.nameMap[i].realName == fieldName)
        return this.nameMap[i].prettyName;
    }
    return fieldName;
  },
  _processReadOnlySlush: function(control, fieldName, disabled) {
    if (control.getAttribute("slush") == "true") {
      if (!$(fieldName + "_select_1"))
        fieldName = this._getAppliedFieldName(fieldName);
      var leftOptionList = fieldName + "_select_0";
      var rightOptionList = fieldName + "_select_1";
      var recordPreviewTable = fieldName + 'recordpreview';
      if (disabled) {
        this._unselectOptions(leftOptionList);
        var selectedRightOption = this._selectedOption(rightOptionList);
        if (selectedRightOption && typeof(selectedRightOption.value) != 'undefined' &&
          selectedRightOption.value != null &&
          selectedRightOption.value != '' &&
          selectedRightOption.value != '--None--') {
          showSelected(
            gel(rightOptionList),
            recordPreviewTable,
            this._retrieveTableName(fieldName));
        } else {
          this._hideIfPresent(recordPreviewTable);
        }
        $(rightOptionList).ondblclickOLD = $(rightOptionList).ondblclick;
        $(rightOptionList).ondblclick = "";
        this._hideIfPresent(leftOptionList);
        this._hideIfPresent(leftOptionList + "_title_row");
        this._hideIfPresent(leftOptionList + "_filter_row");
        this._hideIfPresent(leftOptionList + "_filters_row");
        this._hideIfPresent(leftOptionList + "_search_row");
        this._hideIfPresent(rightOptionList + "_search_row");
        this._hideIfPresent(leftOptionList + "_add_remove_container");
        this._hideIfPresent(leftOptionList + "_add_remove_message_table");
      } else {
        if ($(fieldName + "_select_1").ondblclickOLD)
          $(fieldName + "_select_1").ondblclick = $(fieldName + "_select_1").ondblclickOLD;
        this._showIfPresent(recordPreviewTable, "table");
        this._showIfPresent(leftOptionList, "inline-block");
        this._showIfPresent(leftOptionList + "_title_row", "table-row");
        this._showIfPresent(leftOptionList + "_filter_row", "table-row");
        this._showIfPresent(leftOptionList + "_filters_row", "table-row");
        this._showIfPresent(leftOptionList + "_search_row", "table-row");
        this._showIfPresent(rightOptionList + "_search_row", "table-row");
        this._showIfPresent(leftOptionList + "_add_remove_container", "table-cell");
        this._showIfPresent(leftOptionList + "_add_remove_message_table", "table");
      }
    }
  },
  _retrieveTableName: function(fieldName) {
    var relatedTableNameFunction = fieldName +
      '_getMTOMRelatedTable();';
    var relatedTableNameDotFieldName = eval(relatedTableNameFunction);
    var tableName = relatedTableNameDotFieldName.split('.')[0];
    return tableName;
  },
  _selectedOption: function(optionsArray) {
    var selectedOption;
    var selectedOptionIndex = gel(optionsArray).selectedIndex;
    var cssOptionsSelector = '#' + optionsArray + ' option';
    if (selectedOptionIndex == -1 && $$(cssOptionsSelector)[0]) {
      selectedOption = $$(cssOptionsSelector)[0];
      selectedOption.selected = true;
      gel(optionsArray).selectedIndex = 0;
    } else {
      selectedOption = $$(cssOptionsSelector)[selectedOptionIndex];
    }
    return selectedOption;
  },
  _unselectOptions: function(optionsArray) {
    var cssOptionsSelector = '#' + optionsArray + ' option';
    var optionsArray = $$(cssOptionsSelector).each(function(ele, i) {
      return $(ele).selected = false;
    });
    gel(optionsArray).selectedIndex = -1;
  },
  _hideIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.hide(elem);
  },
  _showIfPresent: function(elemID, type) {
    var elem = $(elemID);
    if (elem)
      Element.show(elem);
  },
  _formExists: function() {
    if (typeof g_form == 'undefined')
      return false;
    if (typeof g_sc_form == 'undefined')
      return false;
    return g_form != g_sc_form;
  },
  _containerValuesChanged: function(container) {
    var currentValues = this._getContainerValues(container);
    for (var id in currentValues) {
      var originalValue = $("sys_original." + id).value;
      if (originalValue != currentValues[id])
        return true;
    }
    return false;
  },
  _getContainerValues: function(container) {
    var elems = $$('[gsftcontainer="' + container + '"]');
    var values = {};
    for (var i = 0; i < elems.length; i++)
      values[elems[i].id] = elems[i].value;
    return values;
  }
});