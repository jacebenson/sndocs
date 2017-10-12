/*! RESOURCE: /scripts/doctype/GlideForm14.js */
function default_on_submit() {
  if (!g_form)
    return true;
  return g_form.onSubmit();
}
var GlideForm = Class.create({
      INFO_CLASS: "fieldmsg notification notification-info",
      ERROR_CLASS: "fieldmsg notification notification-error",
      WARNING_CLASS: "fieldmsg notification notification-warning",
      MSG_ROW: "_message_row",
      initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger, isSearch) {
        this.tableName = tableName;
        this.modified = false;
        this.modifiedFields = {};
        this.mandatoryOnlyIfModified = false;
        this.elements = [];
        this.mandatory = mandatory;
        this.checkMandatory = checkMandatory;
        this.checkNumeric = checkNumeric;
        this.checkInteger = checkInteger;
        this.nameMap = [];
        this.attributes = [];
        this.validators = [];
        this.disabledFields = [];
        this.securityReadOnlyFields = [];
        this.elementHandlers = {};
        this.prefixHandlers = {};
        this.derivedWaiting = [];
        this.newRecord = gel('sys_row') && gel('sys_row').value == "-1";
        this.personalizeHiddenFields = null;
        this.personalizePrefKey = "personalize_" + this.tableName + "_" + this.getViewName();
        this._isLiveUpdating = false;
        if (!isSearch && this.classname !== 'ServiceCatalogForm')
          CachedEvent.emit('glideform.initialized', this);
        else {
          var gf = this;
          setTimeout(function() {
            CachedEvent.emit('glideform.initialized', gf)
          }, 0);
        }
      },
      fieldChanged: function(elementName, changeFlag) {
        if (!this._internalChange) {
          if (changeFlag) {
            this.modified = true;
            this.modifiedFields[elementName] = true;
          } else if (this.modifiedFields[elementName]) {
            this.modifiedFields[elementName] = false;
            this._checkModified();
          }
        }
        var uniqueValue = this.getUniqueValue();
        CustomEvent.fireAll('form.isModified', {
          uniqueValue: uniqueValue,
          isModified: this.modified
        });
      },
      _checkModified: function() {
        for (var n in this.modifiedFields) {
          if (this.modifiedFields[n]) {
            this.modified = true;
            return;
          }
        }
        this.modified = false;
      },
      setMandatoryOnlyIfModified: function() {
        this.mandatoryOnlyIfModified = true;
      },
      addNameMapEntry: function(entry) {
        this.nameMap.push(entry);
      },
      addGlideUIElement: function(ed) {
        this.elements.push(ed);
      },
      registerHandler: function(id, handler) {
        this.elementHandlers[id] = handler;
      },
      registerPrefixHandler: function(prefix, handlerObject) {
        var handler = new GlideFormPrefixHandler(handlerObject);
        this.prefixHandlers[prefix] = handler;
      },
      getPrefixHandler: function(id) {
        if (!id)
          return;
        if (id.indexOf('.') < 0)
          id = 'variables.' + id;
        var idSplit = id.split(".");
        var handler = this.prefixHandlers[idSplit[0]];
        if (typeof handler == "undefined")
          return;
        handler.setFieldName(id);
        return handler;
      },
      getElement: function(id) {
        if (this.elementHandlers[id] && (typeof this.elementHandlers[id].getElement == "function"))
          return this.elementHandlers[id].getElement();
        else
          return this.getControl(id);
      },
      getParameter: function(parm) {
        if (!(parm.substr(0, 8) == 'sysparm_'))
          parm = 'sysparm_' + parm;
        var pcel = gel(parm);
        if (pcel)
          return pcel.value;
        else
          return '';
      },
      hasAttribute: function(s) {
        if (this.attributes[s])
          return true;
        return false;
      },
      addAttribute: function(s) {
        this.attributes[s] = s;
      },
      addValidator: function(fieldType, validator) {
        this.validators[fieldType] = validator;
      },
      _getPersonalizeHiddenFields: function() {
        if (this.personalizeHiddenFields == null) {
          var prefVal = NOW[this.personalizePrefKey] || getPreference(this.personalizePrefKey);
          if ('false' == prefVal)
            this.personalizeHiddenFields = [];
          else if (prefVal.length)
            this.personalizeHiddenFields = prefVal.split(",");
          else
            this.personalizeHiddenFields = [];
        }
        return this.personalizeHiddenFields;
      },
      resetPersonalizeHiddenFields: function() {
        this.personalizeHiddenFields = [];
        this._savePersonalizeHiddenFields(function() {
          window.reloadWindow(window);
        });
      },
      _savePersonalizeHiddenFields: function(callback) {
        setPreference(this.personalizePrefKey, this.personalizeHiddenFields.join(","), callback);
      },
      isUserPersonalizedField: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        return this.personalizeHiddenFields === null ? false : this.personalizeHiddenFields.indexOf(fieldName) != -1;
      },
      setUserDisplay: function(fieldName, display) {
        fieldName = this.removeCurrentPrefix(fieldName);
        this._getPersonalizeHiddenFields();
        for (var i = this.personalizeHiddenFields.length - 1; i >= 0; i--) {
          if (this.personalizeHiddenFields[i] === fieldName) {
            this.personalizeHiddenFields.splice(i, 1);
          }
        }
        this.setDisplay(fieldName, display);
        if ((display === false || display === 'false') && !this.isMandatory(fieldName))
          this.personalizeHiddenFields.push(fieldName);
        this._savePersonalizeHiddenFields();
      },
      setDisplay: function(fieldName, display) {
        fieldName = this.removeCurrentPrefix(fieldName);
        this._setDisplay(fieldName, display, this.isMandatory(fieldName), this.getValue(fieldName));
      },
      _setDisplay: function(fieldName, display, isMandatory, fieldValue) {
        var s = this.tableName + '.' + fieldName;
        var control = this.getControl(fieldName);
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject().setDisplay(handler.getFieldName(), display);
          return;
        }
        var displayValue = 'none';
        if (display == 'true' || display == true) {
          display = true;
          displayValue = '';
        }
        if ((display != true) && isMandatory && fieldValue == '')
          return;
        var theElement = control;
        if (this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].getElement == "function"))
          theElement = this.elementHandlers[control.id].getElement();
        if (this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].setDisplay == "function")) {
          this.elementHandlers[control.id].setDisplay(display ? '' : 'none');
        } else {
          this.changeElementStyle(fieldName, 'display', displayValue);
        }
        this.setSensitiveDisplayValue(s + ".ui_policy_sensitive", displayValue);
        var glideElement = this.getGlideUIElement(fieldName);
        if (glideElement)
          if (glideElement.type == 'script' || glideElement.type == 'script_plain' || glideElement.type == 'xml')
            CustomEvent.fire('element_script_display_' + display, {
              'element': glideElement
            });
        _frameChanged();
      },
      setSensitiveDisplayValue: function(name, displayValue) {
        var elements = document.getElementsByName(name);
        for (i = 0; i < elements.length; i++) {
          elements[i].style.display = displayValue;
        }
      },
      setValidation: function(fieldName, validate) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control)
          return;
        if (validate == 'false')
          validate = false;
        if (validate != false) {
          control.removeAttribute('validate');
          return;
        }
        control.setAttribute('validate', 'false');
      },
      getViewName: function() {
        var sysparmView = gel('sysparm_view');
        var view = "default";
        if (sysparmView && sysparmView.value)
          view = sysparmView.value;
        return view;
      },
      setVisible: function(fieldName, visibility) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject().setVisible(handler.getFieldName(),
              visibility);
        }
        var v = 'hidden';
        if (visibility == 'true')
          visibility = true;
        if (visibility)
          v = 'visible';
        if ((visibility != true) && this.isMandatory(fieldName) && (this.getValue(fieldName) == ''))
          return;
        this.changeElementStyle(fieldName, 'visibility', v);
      },
      changeElementStyle: function(fieldName, name, value) {
        var ge = this.getGlideUIElement(fieldName);
        if (!ge)
          return;
        if (this.changeElementParent(ge, name, value))
          return;
        var labelElement = ge.getLabelElement();
        if (labelElement)
          labelElement.parentNode.parentNode.style[name] = value;
        var parentTR = findParentByTag(ge.getElement(), "tr");
        if (parentTR && parentTR != labelElement)
          parentTR.style[name] = value;
      },
      changeElementParent: function(ge, name, value) {
        var element = ge.getElementParentNode();
        if (element) {
          element.style[name] = value;
          var decoration = $(element).select(".reference_decoration, .btn-ref");
          var isEmptyRef = ge.type == 'reference' && this.getValue(ge.fieldName) == '';
          if (decoration && decoration.length > 0) {
            for (var i = 0; i < decoration.length; i++) {
              if (isEmptyRef && (decoration[i].getAttribute('data-type') == 'reference_popup'))
                decoration[i].style[name] = 'none';
              else
                decoration[i].style[name] = value;
            }
          }
          return true;
        }
        return false;
      },
      getLabel: function(id) {
        id = this.removeCurrentPrefix(id);
        var label;
        var labels = document.getElementsByTagName('label');
        for (var i = 0;
          (label = labels[i]); i++) {
          if (label.htmlFor.endsWith(id)) {
            return label;
          }
        }
        return false;
      },
      isNewRecord: function() {
        return this.newRecord;
      },
      isMandatory: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var thisElement = this.getGlideUIElement(fieldName);
        if (!thisElement) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            return handler.getObject().isMandatory(handler.getFieldName());
          else
            return false;
        }
        return thisElement.isMandatory();
      },
      addSecurityReadOnlyFields: function(fields) {
        this.securityReadOnlyFields = fields.split(',');
      },
      setRequiredChecked: function(fieldName, required) {
        if (!fieldName || !fieldName.startsWith('ni.VE')) {
          jslog("Invalid variable id");
          return;
        }
        var handler = this.getPrefixHandler(this.resolvePrettyNameMap(fieldName));
        if (!handler) {
          jslog("Invalid variable id");
          return;
        }
        handler.getObject().setRequiredChecked(fieldName, required);
      },
      setMandatory: function(fieldName, mandatory) {
        var thisElement = this.getGlideUIElement(fieldName);
        if (!thisElement) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject().setMandatory(handler.getFieldName(), mandatory);
          return;
        }
        if (this.securityReadOnlyFields.indexOf(this.tableName + "." + fieldName) >= 0)
          return;
        thisElement.setMandatory(mandatory);
        var e = thisElement.getElement();
        if (e) {
          e.setAttribute("mandatory", mandatory);
          onChangeLabelProcessByEl(e, thisElement.getStatusElement());
        }
        var control = this.getControl(fieldName);
        if (control && control.id && this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].setMandatory == "function"))
          this.elementHandlers[control.id].setMandatory(mandatory);
        if (mandatory) {
          setMandatoryExplained(true);
          var value = this.getValue(fieldName);
          if (value == '') {
            this._setDisplay(fieldName, true, true, '');
            this._setReadonly(fieldName, false, true, '');
          }
        }
        opticsLog(this.getTableName(), fieldName, "Mandatory set to " + mandatory);
      },
      setDisabled: function(fieldName, disabled) {
        this.setReadonly(fieldName, disabled);
        opticsLog(this.getTableName(), fieldName, "Disabled set to " + disabled);
      },
      setReadOnly: function(fieldName, disabled) {
        this.setReadonly(fieldName, disabled);
      },
      setReadonly: function(fieldName, disabled) {
        fieldName = this.removeCurrentPrefix(fieldName);
        this._setReadonly(fieldName, disabled, this.isMandatory(fieldName), this.getValue(fieldName));
        opticsLog(this.getTableName(), fieldName, "ReadOnly set to " + disabled);
      },
      _setReadonly: function(fieldName, disabled, isMandatory, fieldValue) {
        var s = this.tableName + '.' + fieldName;
        var control = this.getControl(fieldName);
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject()._setReadonly(
              handler.getFieldName(), disabled, isMandatory,
              fieldValue);
          return;
        }
        var ge = this.getGlideUIElement(fieldName);
        if (!ge)
          return;
        this._setReadonly0(ge, control, s, fieldName, disabled, isMandatory, fieldValue);
      },
      _setReadonly0: function(ge, control, s, fieldName, disabled, isMandatory, fieldValue) {
        if (disabled && isMandatory && fieldValue == '')
          return;
        if (control.getAttribute('gsftlocked') == 'true')
          return;
        if (this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].setReadOnly == "function")) {
          if (this.elementHandlers[control.id].setReadOnly(disabled) == true)
            return;
        } else
          this.setDisabledControl(control, disabled);
        this._setDisabledField(control, disabled);
        onChangeLabelProcessByEl(control, ge.getStatusElement());
        this._setFieldReadOnly(ge, "sys_display." + s, disabled);
        this._setFieldReadOnly(ge, "sys_select." + s, disabled);
        var $inputGroup = $j(ge.getElementParentNode()).find(".input-group");
        if ($inputGroup.length) {
          if (disabled)
            $inputGroup.addClass('input-group-disabled');
          else
            $inputGroup.removeClass('input-group-disabled');
        }
        this.setSensitiveDisplayValue(s + ".ui_policy_sensitive", disabled ? 'none' : '');
        this._setFieldReadOnly(ge, "ni." + this.tableName + "." + fieldName, disabled);
        if (this.tableName == "ni")
          this._setFieldReadOnly(ge, "ni." + ge.fieldName, disabled);
        var suggestionExists = gel('ni.dependent_reverse.' + this.tableName + '.' + fieldName);
        if (suggestionExists) {
          this._setFieldReadOnly(ge, "lookup." + this.tableName + "." + fieldName, disabled, true);
        }
      },
      _setFieldReadOnly: function(ge, s, disabled, skipProcessLabelChange) {
        var control = ge.getChildElementById(s);
        if (control) {
          this.setDisabledControl(control, disabled);
          this._setDisabledField(control, disabled);
          if (!skipProcessLabelChange)
            onChangeLabelProcessByEl(control, ge.getStatusElement());
        }
      },
      setDisabledControl: function(control, disabled) {
        if (disabled) {
          control.setAttribute("readonly", "readonly");
          addClassName(control, 'disabled');
        } else {
          control.removeAttribute("readonly");
          removeClassName(control, 'disabled');
        }
        var name = control.tagName.toLowerCase();
        var type = control.getAttribute('type');
        if ((isFirefox && (name == 'input' && (type == 'text' || type == null))) || name == 'textarea')
          control.disabled = false;
        else
          control.disabled = disabled;
      },
      _setDisabledField: function(control, disabled) {
        if (disabled) {
          addClassName(control, 'disabled');
          addClassName(control, 'readonly');
          this._addDisabledField(control);
        } else {
          removeClassName(control, 'disabled');
          removeClassName(control, 'readonly');
          this._removeDisabledField(control);
        }
      },
      _addDisabledField: function(control) {
        var n = this.disabledFields.length;
        this.disabledFields[n] = control;
      },
      _removeDisabledField: function(control) {
        var n = this.disabledFields.length;
        for (i = 0; i < n; i++) {
          if (this.disabledFields[i] == control) {
            this.disabledFields.splice(i, 1);
            break;
          }
        }
      },
      onSubmit: function() {
        this.getFormElement().addClassName('form-submitted');
        var action = this.getActionName();
        if (action && !action.startsWith("sysverb_no_update"))
          this.submitted = true;
        if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete' || action == 'sysverb_query')
          return true;
        var rc = this.mandatoryCheck();
        if (rc && typeof g_sc_form != "undefined")
          rc = g_sc_form.mandatoryCheck() && g_sc_form.catalogOnSubmit();
        rc = rc && this.validate();
        return rc;
      },
      enableUIPolicyFields: function() {
        for (i = 0; i < this.disabledFields.length; i++) {
          var disabledID = this.disabledFields[i].id;
          if (!this._isDerivedWaiting(disabledID))
            this.disabledFields[i].disabled = false;
          else
            jslog("Did not re-enable " + disabledID + " as it is derived waiting for AJAX lookup");
        }
      },
      mandatoryCheck: function() {
        if (!this.checkMandatory || (!this.modified && this.mandatoryOnlyIfModified))
          return true;
        var rc = true;
        var invalidFields = new Array();
        var labels = new Array();
        var missing = this.getMissingFields();
        for (var i = 0; i < missing.length; i++) {
          rc = false;
          var field = missing[i];
          var widget = this.getControl(field);
          if (i == 0) {
            var tryLabel = !$j(widget).is(':visible');
            if (!tryLabel) {
              try {
                widget.focus();
              } catch (e) {
                tryLabel = true;
              }
            }
            if (tryLabel) {
              var displayWidget = this.getDisplayBox(field);
              if (displayWidget) {
                try {
                  displayWidget.focus();
                } catch (exception) {}
              }
            }
          }
          labels.push(this.tableName + '.' + field);
          var widgetLabel = this.getLabelOf(field);
          var shortLabel = trim(widgetLabel + '');
          invalidFields.push(shortLabel);
        }
        if (!rc) {
          var theText = invalidFields.join(', ');
          theText = getMessage('The following mandatory fields are not filled in') + ': ' + theText;
          try {
            alert(theText);
            this.submitted = false;
          } catch (e) {}
        }
        for (var i = 0; i < labels.length; i++) {
          this.flash(labels[i], "#FFFACD", 0);
        }
        return rc;
      },
      setVariablesReadOnly: function(readOnly) {
        for (var x = 0; x < g_form.elements.length; x++) {
          for (var i = 0; i < this.nameMap.length; i++) {
            var entry = this.nameMap[i];
            var element = g_form.elements[x];
            if (entry.realName == element.fieldName && element.tableName == "variable") {
              if (typeof g_sc_form == "undefined" || !g_sc_form)
                this.setReadOnly(entry.prettyName, readOnly);
              else
                g_sc_form.setReadOnly(entry.prettyName, readOnly);
            }
          }
        }
      },
      getHelpTextControl: function(variableName) {
        var handler = this.getPrefixHandler(variableName);
        var ele;
        if (handler) {
          var handlerObject = handler.getObject();
          ele = handlerObject.getHelpTextControl(handlerObject.removeCurrentPrefix(variableName));
        }
        if (!ele) {
          jslog("getHelpTextControl is supported for only Service Catalog Variables");
          return;
        }
        return ele;
      },
      getEditableFields: function() {
        var fa = this.elements;
        var answer = [];
        for (var i = 0; i < fa.length; i++) {
          var ed = fa[i];
          var widget = this.getControl(ed.fieldName);
          if (!widget)
            continue;
          if (this.isEditableField(ed, widget))
            answer.push(ed.fieldName);
        }
        return answer;
      },
      isEditableField: function(ge, control) {
        if (!this.isTemplateCompatible(ge, control)) {
          return false;
        }
        if (!this.isVisible(ge, control))
          return false;
        if (this.isReadOnly(ge, control))
          return false;
        if (this.isDisplayNone(ge, control))
          return false;
        return true;
      },
      isTemplateCompatible: function(ge, control) {
        if (this.elementHandlers[control.id]) {
          if (typeof this.elementHandlers[control.id].isTemplatable == "function") {
            return this.elementHandlers[control.id].isTemplatable();
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      isVisible: function(ge, control) {
        if (this.isDisplayNone(ge, control))
          return false;
        if (this.elementHandlers[control.id])
          if (typeof this.elementHandlers[control.id].isVisible == "function")
            return this.elementHandlers[control.id].isVisible();
        if (ge.getType() != "glide_duration" && ge.getType != "glide_time") {
          var xx = control.style['visibility'];
          if (xx == 'hidden')
            return false;
        }
        xx = this._getElementStyle(ge, 'visibility');
        if (xx == 'hidden')
          return false;
        return true;
      },
      _isVisibleATF: function(ge, control) {
        if (this.isDisplayNone(ge, control))
          return false;
        if (control && this.elementHandlers[control.id])
          if (typeof this.elementHandlers[control.id].isVisible == "function")
            return this.elementHandlers[control.id].isVisible();
        if (control && ge.getType() != "glide_duration" && ge.getType != "glide_time") {
          var xx = control.style['visibility'];
          if (xx == 'hidden') {
            var readOnlyField = gel("sys_readonly." + control.id);
            if ((readOnlyField && readOnlyField.style['visibility'] == 'hidden') || !readOnlyField)
              return false;
          }
        }
        xx = this._getElementStyle(ge, 'visibility');
        if (xx == 'hidden')
          return false;
        return true;
      },
      isDisabled: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control)
          return true;
        if (this.elementHandlers[control.id])
          if (typeof this.elementHandlers[control.id].isDisabled == "function")
            return this.elementHandlers[control.id].isDisabled();
        return this.isReadOnly("", control);
      },
      isReadOnly: function(ge, control) {
        if (!control)
          return true;
        if (this.elementHandlers[control.id])
          if (typeof this.elementHandlers[control.id].isReadOnly == "function")
            return this.elementHandlers[control.id].isReadOnly();
        return control.disabled || control.readOnly || control.hasClassName("readonly");
      },
      _isReadOnlyATF: function(ge, control) {
        if (!control)
          return true;
        if (this.elementHandlers[control.id]) {
          if (typeof this.elementHandlers[control.id]._isReadOnlyATF == "function")
            return this.elementHandlers[control.id]._isReadOnlyATF();
          else if (typeof this.elementHandlers[control.id].isReadOnly == "function")
            return this.elementHandlers[control.id].isReadOnly();
        }
        return control.disabled || control.readOnly || control.hasClassName("readonly") || control.getAttribute("writeaccess") == "false";
      },
      isDisplayNone: function(ge, control) {
        var parentNode = ge.getElementParentNode();
        if (parentNode && parentNode.style.display == 'none')
          return true;
        if (ge.getType() == 'html' || ge.getType() == 'translated_html' || ge.getType() == 'composite_name' || ge.getType() == 'url')
          return false;
        if (!control)
          return;
        else {
          var xx = control.style['display'];
          if (xx == 'none') {
            var readOnlyField = gel("sys_readonly." + control.id);
            if ((readOnlyField && readOnlyField.style['display'] == 'none') || !readOnlyField)
              return true;
          }
        }
        var xx = this._getElementStyle(ge, 'display');
        if (xx == 'none')
          return true;
        return false;
      },
      _getElementStyle: function(ge, style) {
        var element = ge.getElementParentNode();
        if (element)
          return element.style[style];
        var labelElement = ge.getLabelElement();
        if (labelElement)
          return labelElement.parentNode.parentNode.style[style];
        var parentTR = findParentByTag(ge.getElement(), "tr");
        if (parentTR && parentTR != labelElement)
          return parentTR.style[name];
        return "";
      },
      getMissingFields: function() {
        var fa = this.elements;
        var answer = [];
        for (var i = 0; i < fa.length; i++) {
          var ed = fa[i];
          if (!ed.mandatory)
            continue;
          var widget = this.getControl(ed.fieldName);
          if (!widget)
            continue;
          if (this._isMandatoryFieldEmpty(ed))
            answer.push(ed.fieldName);
        }
        if (typeof g_sc_form != "undefined" && g_sc_form)
          g_sc_form.getMissingFields(answer);
        return answer;
      },
      _isMandatoryFieldEmpty: function(ed) {
        var widgetValue = this.getValue(ed.fieldName);
        if (widgetValue != null && widgetValue != '')
          return false;
        if (ed.supportsMapping) {
          var id = "sys_mapping." + ed.tableName + "." + ed.fieldName;
          var mappingValue = this.getValue(id);
          if (mappingValue.trim())
            return false;
          var nonMappedFieldValue = this.getValue(ed.tableName + "." + ed.fieldName);
          if (nonMappedFieldValue.trim())
            return false;
          return true;
        }
        var displayBox = this.getDisplayBox(ed.fieldName);
        if (displayBox != null) {
          var displayValue = displayBox.value;
          if (displayValue != null && displayValue != '' && displayBox.getAttribute('data-ref-dynamic') == 'true') {
            return false;
          }
        }
        if ((this.isNewRecord() || this.mandatory) && !ed.isDerived())
          return true;
        widgetName = "sys_original." + this.tableName + '.' + ed.fieldName;
        widget = gel(widgetName);
        if (widget) {
          widgetValue = widget.value;
          if ((widgetValue == null || widgetValue == '') && ed.type != "journal_input")
            return false;
        }
        return true;
      },
      resolveNameMap: function(prettyName) {
        var rc = prettyName;
        for (var i = 0; i < this.nameMap.length; i++) {
          var entry = this.nameMap[i];
          if (entry.prettyName == prettyName) {
            rc = entry.realName;
          }
        }
        return rc;
      },
      resolvePrettyNameMap: function(realName) {
        var pname = realName;
        for (var i = 0; i < this.nameMap.length; i++)
          if ('ni.VE' + this.nameMap[i].realName == realName) {
            pname = this.nameMap[i].prettyName;
            break;
          }
        return pname;
      },
      getFormElement: function() {
        return gel(this.tableName + '.do');
      },
      getControl: function(fieldName) {
        var ge = this.getGlideUIElement(fieldName);
        if (ge) {
          var widget = ge.getElement();
          if (widget) {
            return widget;
          }
        }
        return this.getControlByForm(fieldName);
      },
      getControlByForm: function(fieldName) {
        var form = this.getFormElement();
        if (!form)
          return;
        widget = form[this.tableName + '.' + fieldName];
        if (!widget)
          widget = form[fieldName];
        if (widget && typeof widget != 'string' && widget.length && widget.tagName != "SELECT") {
          for (var i = 0; i < widget.length; i++) {
            if (widget[i].checked)
              return widget[i];
          }
          var wt = widget[0].type;
          if (typeof wt != 'undefined' && wt == 'radio')
            return widget[0];
        }
        return widget;
      },
      _tryLabelRow: function(fieldName) {
        var element = this._tryLabelRowElement(fieldName);
        if (element)
          return element.innerText || element.textContent;
        return null;
      },
      _tryLabelRowElement: function(fieldName) {
        var id = "label_" + fieldName;
        var row = gel(id);
        if (row) {
          var child = row.firstChild;
          if (child) {
            return child;
          }
        }
        return null;
      },
      getLabelOf: function(fieldName) {
        var fieldid = this.tableName + '.' + fieldName;
        var widgetLabel = this.getLabel(fieldid);
        var labelContent = "";
        if (widgetLabel) {
          labelContent = $j(widgetLabel).find('.label-text').text() ||
            widgetLabel.innerText ||
            widgetLabel.textContent;
          if (labelContent.indexOf('*') == 0 &&
            document.documentElement.getAttribute('data-doctype') == 'true')
            labelContent = labelContent.toString().substring(1);
          if ((labelContent.lastIndexOf(":") + 1) == labelContent.length)
            labelContent = labelContent.toString().substring(0, (labelContent.length - 1));
        }
        if (labelContent == null || labelContent == '')
          labelContent = this._tryLabelRow(fieldName);
        if (labelContent == null || labelContent == '') {
          var handler = this.getPrefixHandler(this.resolvePrettyNameMap(fieldName));
          if (handler)
            labelContent = handler.getObject().getLabelOf(fieldName);
          else
            labelContent = fieldName;
        }
        return labelContent.trim();
      },
      setLabelOf: function(fieldName, value) {
        var control = g_form.getControl(fieldName);
        var setLabelOfSomething = false;
        if (this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].setLabelOf == "function"))
          setLabelOfSomething = this.elementHandlers[control.id].setLabelOf(value);
        var labelEl = this._getLabelEl(fieldName);
        if (labelEl) {
          $j(labelEl).find('.label-text').text(value);
          setLabelOfSomething = true;
        }
        return setLabelOfSomething;
      },
      _getLabelEl: function(fieldName) {
        var fieldID = this.tableName + '.' + fieldName;
        var labelEl = this.getLabel(fieldID);
        if (labelEl)
          return labelEl;
        labelEl = this._tryLabelRowElement(fieldName);
        if (labelEl)
          return labelEl;
        return false;
      },
      _getDecorationsEl: function(field) {
        var label = (field instanceof jQuery) ? field : $j(this._getLabelEl(field));
        if (!label.length)
          return null;
        var decorations = label.find('.field_decorations');
        if (!decorations.length) {
          $j('<span class="field_decorations" data-label-decorations="[]" />').prependTo(label);
          decorations = label.find('.field_decorations');
        }
        return decorations;
      },
      _getDecorations: function(fieldName) {
        var attrName = 'data-label-decorations';
        var decorations = this._getDecorationsEl(fieldName);
        if (decorations && decorations.length) {
          var raw = decorations.attr(attrName);
          var json = JSON.parse(raw);
          if (json)
            return json;
        }
        return [];
      },
      _setDecorations: function(fieldName, decorations) {
        var isArr = Array.isArray || function(obj) {
          return $j.type(obj) === "array";
        };
        if (!isArr(decorations))
          return false;
        var attrName = 'data-label-decorations';
        var labelEl = this._getLabelEl(fieldName);
        if (labelEl) {
          var raw = JSON.stringify(decorations);
          var decorEl = this._getDecorationsEl($j(labelEl));
          decorEl.empty();
          decorEl.attr(attrName, raw);
          for (var i = 0; i < decorations.length; i++) {
            var dec = decorations[i];
            var $dec = $j('<span class="field_decoration ' + dec.icon + ' ' + dec.color + '" ' +
              'title="' + dec.text + '" ' +
              'data-placement="right" data-container=".touch_scroll"></span>')
            decorEl.append($dec);
            $dec.tooltip().hideFix();
          }
          return true;
        }
        return false;
      },
      addDecoration: function(field, icon, text, color) {
        text = text || '';
        color = color || '';
        var decorations = this._getDecorations(field);
        var deco = {
          icon: icon,
          text: text,
          color: color
        };
        var isDuplicate = false;
        var maxi = decorations.length;
        for (var i = 0; i < maxi; i++) {
          var dec = decorations[i];
          if (dec.icon == icon &&
            dec.text == text &&
            dec.color == color) {
            isDuplicate = true;
          }
        }
        if (!isDuplicate)
          decorations.push(deco);
        this._setDecorations(field, decorations);
      },
      removeDecoration: function(field, icon, text, color) {
        text = text || '';
        color = color || '';
        var decorations = this._getDecorations(field);
        var out = [];
        var maxi = decorations.length;
        for (var i = 0; i < maxi; i++) {
          var dec = decorations[i];
          if (!(dec.icon == icon &&
              dec.text == text &&
              dec.color == color)) {
            out.push(dec);
          }
        }
        this._setDecorations(field, out);
      },
      removeAllDecorations: function() {
        $j('.field_decorations').remove();
      },
      getSectionNames: function() {
        return g_tabs2Sections.tabNames;
      },
      setSectionDisplay: function(name, display) {
        var index = g_tabs2Sections.findTabIndexByName(name);
        if (index === -1)
          return false;
        if (display)
          g_tabs2Sections.showTab(index);
        else
          g_tabs2Sections.hideTab(index);
        return true;
      },
      isSectionVisible: function(name) {
        var index = g_tabs2Sections.findTabIndexByName(name);
        if (index !== -1)
          return g_tabs2Sections.isVisible(index);
        return false;
      },
      activateTab: function(name) {
        var index = g_tabs2Sections.findTabIndexByName(name);
        if (index !== -1)
          return g_tabs2Sections.setActive(index);
        return false;
      },
      getTabNameForField: function(fieldName) {
        if (!g_form.hasField(fieldName))
          return null;
        var control = g_form.getControl(fieldName);
        return this._getTabNameForElement(control);
      },
      _getTabNameForElement: function(element) {
        var sectionId = $j(element).closest('[data-section-id]').attr('id');
        if (sectionId) {
          var tabIndex = g_tabs2Sections.findTabIndexByID(sectionId);
          return g_tabs2Sections.tabNames[tabIndex];
        }
        return null;
      },
      validate: function() {
        var fa = this.elements;
        var rc = true;
        var labels = [];
        for (var i = 0; i < fa.length; i++) {
          var ed = fa[i];
          var widgetName = this.tableName + '.' + ed.fieldName;
          var widget = this.getControl(ed.fieldName);
          if (!widget)
            continue;
          if (!this.isEditableField(ed, widget))
            continue;
          if (widget.getAttribute("validate") == "false")
            continue;
          var widgetValue = widget.value;
          var widgetType = ed.type;
          var specialType = widget.getAttribute("specialtype");
          if (specialType)
            widgetType = specialType;
          var validator = this.validators[widgetType];
          if (!validator)
            continue;
          this.hideFieldMsg(widget);
          var isValid = validator.call(this, widgetValue);
          if (isValid != null && isValid != true) {
            var widgetLabel = this.getLabelOf(ed.fieldName);
            labels.push(widgetName);
            rc = false;
            if (isValid == false || isValid == "false")
              isValid = getMessage("Invalid text");
            this.showFieldMsg(widget, isValid, 'error');
          }
        }
        for (var i = 0; i < labels.length; i++)
          this.flash(labels[i], "#FFFACD", 0);
        return rc;
      },
      removeCurrentPrefix: function(id) {
        if (id) {
          if (id.indexOf('current.') == 0) {
            id = id.substring(8);
          }
          return id;
        }
      },
      isNumeric: function(internaltype) {
        if (internaltype == 'decimal')
          return true;
        if (internaltype == 'float')
          return true;
        if (internaltype == 'integer')
          return true;
        if (internaltype == 'numeric')
          return true;
        return false;
      },
      isInteger: function(internaltype) {
        if (internaltype == 'integer')
          return true;
        return false;
      },
      setTemplateValue: function(fieldName, value, displayValue) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (control)
          control.templateValue = 'true';
        var text = "Field modified by template";
        this.setValue(fieldName, value, displayValue);
        this.addDecoration(fieldName, 'icon-success', text);
      },
      setValue: function(fieldName, value, displayValue) {
        var oldValue = this.getValue(fieldName);
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject().setValue(handler.getFieldName(),
              value, displayValue);
          return;
        } else {
          if (control.options && control.options.length) {
            for (var i = 0; i < control.options.length; i++) {
              control.options[i].removeAttribute('selected');
            }
          }
        }
        this._internalChange = true;
        this._setValue(fieldName, value, displayValue, true);
        this._internalChange = false;
        this._opticsInspectorLog(fieldName, oldValue);
      },
      getNiBox: function(fieldName) {
        var niName = 'ni.' + this.tableName + '.' + fieldName;
        return gel(niName);
      },
      getDisplayBox: function(fieldName) {
        var dName = 'sys_display.' + this.tableName + '.' + fieldName;
        var field = gel(dName);
        if (field)
          return field;
        dName = 'sys_display.' + fieldName;
        field = gel(dName);
        if (field)
          return field;
        var handler = this.getPrefixHandler(fieldName);
        if (handler) {
          var handlerObject = handler.getObject();
          return handlerObject.getDisplayBox(handlerObject.removeCurrentPrefix(fieldName));
        }
        return;
      },
      clearValue: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control)
          return;
        if (!control.options) {
          this._setValue(fieldName, '');
          return;
        }
        var selindex = control.selectedIndex;
        if (selindex != -1) {
          var option = control.options[selindex];
          option.selected = false;
        }
        var options = control.options;
        for (i = 0; i < options.length; i++) {
          var option = options[i];
          var optval = option.value;
          if (optval == '') {
            option.selected = true;
            break;
          }
        }
      },
      _sanitizeFieldName: function(fieldName) {
        if (fieldName) {
          fieldName = this.removeCurrentPrefix(fieldName);
          fieldName = this._removeTableName(fieldName);
        }
        return fieldName;
      },
      _removeTableName: function(fieldName) {
        if (fieldName.indexOf(this.tableName + ".") === 0) {
          var length = this.tableName.length + 1;
          fieldName = fieldName.substring(length);
        }
        return fieldName;
      },
      _setValue: function(fieldName, value, displayValue, updateRelated) {
        fieldName = this._sanitizeFieldName(fieldName);
        var control = this.getControl(fieldName);
        if (typeof control === 'undefined')
          return;
        var readOnlyField = gel('sys_readonly.' + control.id);
        if (readOnlyField) {
          if (readOnlyField.tagName == "SPAN") {
            var fieldType = readOnlyField.getAttribute('gsft_fieldtype');
            if (fieldType && fieldType.indexOf("html") > -1)
              readOnlyField.innerHTML = value;
            else
              readOnlyField.innerHTML = htmlEscape(value);
          } else
          if (displayValue && readOnlyField.tagName != "SELECT")
            readOnlyField.value = displayValue;
          else {
            readOnlyField.value = value;
            control.value = value;
            onChange(this.tableName + "." + fieldName);
            if (readOnlyField.tagName == "SELECT")
              $j(readOnlyField).trigger('change');
          }
        } else {
          readOnlyField = gel(control.id + "_label");
          if (readOnlyField) {
            displayValue = this._ensureDisplayValue(fieldName, value, displayValue);
            if (readOnlyField.tagName == 'SPAN')
              readOnlyField.innerHTML = displayValue;
            else
              readOnlyField.value = displayValue;
          }
        }
        if (control && control.id && this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].setValue == "function")) {
          this.elementHandlers[control.id].setValue(value, displayValue);
        } else if ('select2' in $j(control).data()) {
          $j(control).select2('val', value);
          onChange(this.tableName + "." + fieldName);
        } else if (control.options) {
          var i = this._getSelectedIndex(control, value, displayValue);
          control.selectedIndex = i;
          onChange(this.tableName + "." + fieldName);
        } else if (control.type == 'hidden') {
          var nibox = this.getNiBox(fieldName);
          if (nibox && nibox.type == 'checkbox') {
            if (value && value == '0')
              value = 'false';
            if (value && value == '1')
              value = 'true';
            control.value = value;
            onChange(this.tableName + "." + fieldName);
            if (value && value == 'false')
              nibox.checked = null;
            else if (value || value == 'true')
              nibox.checked = 'true';
            else
              nibox.checked = null;
            setCheckBox(nibox);
            return;
          }
          var displaybox = this.getDisplayBox(fieldName);
          if (displaybox) {
            var sel = gel("sys_select." + this.tableName + "." + fieldName);
            if (typeof(displayValue) == 'undefined' && value)
              displayValue = this._ensureDisplayValue(fieldName, value, displayValue);
            if (typeof(displayValue) != 'undefined') {
              control.value = value;
              displaybox.value = displayValue;
              onChange(this.tableName + "." + fieldName);
              removeClassName(displaybox, 'ref_invalid');
              removeClassName(displaybox, 'ref_dynamic');
              displaybox.title = "";
              this._setReferenceSelect(control, sel, value, displayValue);
              refFlipImage(displaybox, control.id);
              if (updateRelated) {
                updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
              }
              return;
            }
            control.value = value;
            onChange(this.tableName + "." + fieldName);
            if (value == null || value == '') {
              displaybox.value = '';
              this._setReferenceSelect(control, sel, value, '');
              refFlipImage(displaybox, control.id);
              return;
            }
            displaybox.value = displayValue;
            this._setReferenceSelect(control, sel, value, displayValue);
            refFlipImage(displaybox, control.id);
            updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
          } else if ($(control).hasClassName('glide_destroy_filter') || $(control).hasClassName('glideform-set-value')) {
            $j(control).val(value);
            onChange(this.tableName + "." + fieldName);
          }
        } else {
          control.value = value;
          onChange(this.tableName + "." + fieldName);
        }
      },
      _setReferenceSelect: function(control, sel, value, displayValue) {
        if (control && !control.options && sel) {
          var i = this._getSelectedIndex(sel, value, displayValue);
          sel.selectedIndex = i;
        }
      },
      _getSelectedIndex: function(control, value, displayValue) {
        var options = control.options;
        for (var i = 0; i < options.length; i++) {
          var option = options[i];
          if (option.value == value) {
            return i;
          }
        }
        var dv = value;
        if (typeof(displayValue) != 'undefined')
          dv = displayValue;
        var newOption = new Option(dv, value);
        control.options[control.options.length] = newOption;
        return control.options.length - 1;
      },
      _ensureDisplayValue: function(fieldName, value, displayValue) {
        if (displayValue)
          return displayValue;
        var ed = this.getGlideUIElement(fieldName);
        if (!ed)
          return displayValue;
        if (ed.type != 'reference' && ed.type != 'domain_id')
          return displayValue;
        var ga = new GlideAjax('AjaxClientHelper');
        ga.addParam('sysparm_name', 'getDisplay');
        ga.addParam('sysparm_table', ed.reference);
        ga.addParam('sysparm_value', value);
        ga.getXMLWait();
        return ga.getAnswer();
      },
      getUniqueValue: function() {
        return this.getValue('sys_uniqueValue');
      },
      getTitle: function() {
        return this.getValue('sys_titleValue');
      },
      getValue: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            return handler.getObject().getValue(
              handler.getFieldName());
          return '';
        }
        return this._getValueFromControl(control);
      },
      getDisplayValue: function() {
        return this.getValue('sys_displayValue');
      },
      _getValueFromControl: function(control) {
        var value;
        if (this.elementHandlers[control.id] && (typeof this.elementHandlers[control.id].getValue == "function")) {
          value = this.elementHandlers[control.id].getValue();
        } else {
          value = control.value;
        }
        return (typeof value !== 'undefined') ? value.toString() : '';
      },
      getIntValue: function(fieldName) {
        var val = this.getValue(fieldName);
        if (!val || val.length == 0)
          return 0;
        return parseInt(formatClean(val));
      },
      getDecimalValue: function(fieldName) {
        var val = this.getValue(fieldName);
        if (!val || val.length == 0)
          return 0;
        var fc = formatClean(val);
        fc = fc.replace(/,/g, '.');
        return parseFloat(fc);
      },
      getBooleanValue: function(fieldName) {
        var val = this.getValue(fieldName);
        val = val ? val + '' : val;
        if (!val || val.length == 0 || val == "false")
          return false;
        return true;
      },
      addOption: function(fieldName, choiceValue, choiceLabel, choiceIndex) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject().addOption(handler.getFieldName(), choiceValue, choiceLabel, choiceIndex);
          return;
        }
        if (!control.options)
          return;
        var len = control.options.length;
        for (i = 0; i < len; i++) {
          if (control.options[i].text == choiceLabel) {
            return;
          }
        }
        if (choiceIndex == undefined)
          choiceIndex = len;
        if (choiceIndex < 0 || choiceIndex > len)
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
        this.setValue(fieldName, value);
      },
      enableOption: function(control, choiceValue, choiceLabel) {
        var len = control.options.length;
        for (var i = len - 1; i >= 0; i--) {
          if (control.options[i].text == choiceLabel && control.options[i].value == choiceValue) {
            control.options[i].disabled = false;
            return true;
          }
        }
        return false;
      },
      clearOptions: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(fieldName);
        if (control && !control.options) {
          var name = "sys_select." + this.tableName + "." + fieldName;
          control = gel(name);
        }
        if (!control) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            handler.getObject().clearOptions(handler.getFieldName());
          return;
        }
        if (!control.options)
          return;
        control.innerHTML = '';
      },
      getOptionControl: function(fieldName, choiceValue) {
        var noPrefix = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(noPrefix);
        if (control && !control.options) {
          var name = "sys_select." + this.tableName + "." + noPrefix;
          control = gel(name);
        }
        return control;
      },
      removeOption: function(fieldName, choiceValue) {
        var control = this.getOptionControl(fieldName, choiceValue);
        if (!control)
          return;
        if (!control.options)
          return;
        var options = control.options;
        for (var i = 0; i < options.length; i++) {
          var option = options[i];
          if (option.value == choiceValue) {
            control.options[i] = null;
            break;
          }
        }
      },
      getOption: function(fieldName, choiceValue) {
        var control = this.getOptionControl(fieldName, choiceValue);
        if (!control)
          return null;
        if (!control.options)
          return null;
        var options = control.options;
        for (var i = 0; i < options.length; i++) {
          var option = options[i];
          if (option.value == choiceValue)
            return option;
        }
        return null;
      },
      removeContextItem: function(itemID) {
        for (av in contextMenus) {
          if (contextMenus[av]) {
            var menu = contextMenus[av];
            var c = menu.context;
            if (c)
              this.removeItem(menu, itemID);
          }
        }
      },
      removeItem: function(menu, itemID) {
        var items = menu.childNodes;
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.innerHTML == itemID) {
            menu.removeChild(item);
            clearNodes(item);
            break;
          }
        }
        return;
      },
      getGlideUIElement: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        for (var i = 0; i < this.elements.length; i++) {
          var thisElement = this.elements[i];
          if (thisElement.fieldName == fieldName)
            return thisElement;
        }
      },
      getDerivedFields: function(fieldName) {
        var parts = fieldName.split(".");
        parts.shift();
        fieldName = parts.join(".") + ".";
        var list = new Array();
        for (var i = 0; i < this.elements.length; i++) {
          var thisElement = this.elements[i];
          if (thisElement.fieldName.indexOf(fieldName) == 0) {
            var target = thisElement.fieldName.substring(fieldName.length);
            list.push(target);
          }
        }
        if (list.length == 0)
          return null;
        return list;
      },
      _addDerivedWaiting: function(fieldName) {
        this.derivedWaiting.push(fieldName);
      },
      _isDerivedWaiting: function(fieldName) {
        var tablePrefix = this.tableName + ".";
        if (fieldName.startsWith(tablePrefix))
          fieldName = fieldName.substring(tablePrefix.length);
        var index = this.derivedWaiting.indexOf(fieldName);
        return (index != -1);
      },
      _removeDerivedWaiting: function(fieldName) {
        var index = this.derivedWaiting.indexOf(fieldName);
        if (index > -1)
          this.derivedWaiting.splice(index, 1);
      },
      getReference: function(fieldName, callback) {
        var opticsContext = null;
        if (window['g_optics_inspect_handler'] && g_optics_inspect_handler.opticsContextStack.length > 0)
          opticsContext = g_optics_inspect_handler.opticsContextStack[g_optics_inspect_handler.opticsContextStack.length - 1];
        fieldName = this.removeCurrentPrefix(fieldName);
        var ed = this.getGlideUIElement(fieldName);
        if (!ed) {
          var handler = this.getPrefixHandler(fieldName);
          if (handler)
            return handler.getObject().getReference(handler.getFieldName(), callback);
          return;
        }
        if (ed.type != 'reference' && ed.type != 'domain_id')
          return;
        var value = this.getValue(fieldName);
        var gr = new GlideRecord(ed.reference);
        if (value == "") {
          if (callback)
            callback(gr);
          return gr;
        }
        gr.addQuery('sys_id', value);
        if (callback) {
          var fn = function(gr) {
            gr.next();
            if (opticsContext)
              CustomEvent.fire('glide_optics_inspect_put_context', opticsContext["category"], opticsContext["name"], opticsContext["sys_id"]);
            callback(gr);
            if (opticsContext)
              CustomEvent.fire('glide_optics_inspect_pop_context');
          };
          gr.query(fn);
          return;
        } else {
          var sw = new StopWatch();
          sw.jslog("*** WARNING *** GlideForm: synchronous getReference call on " + this.getTableName());
        }
        gr.query();
        gr.next();
        return gr;
      },
      submit: function(actionName) {
        actionName = actionName || 'sysverb_update';
        var action = gel(actionName);
        if (!action)
          action = this._getLinkActionByAttribute(actionName);
        if (action)
          return gsftSubmit(action);
      },
      _getLinkActionByAttribute: function(actionName, attribute) {
        var attr = attribute || 'gsft_action_name';
        var selector = 'a[' + attr + '="' + actionName + '"]';
        var el = $j(selector);
        if (el.length === 0)
          return;
        return el[0];
      },
      save: function() {
        return this.submit('sysverb_update_and_stay');
      },
      getActionName: function() {
        var form = this.getFormElement();
        if (form) {
          var theButton = form.sys_action;
          if (theButton)
            return theButton.value;
        }
        return this.action;
      },
      getTableName: function() {
        return this.tableName;
      },
      getSections: function() {
        return $$('form span.tabs2_section span[data-header-only="false"]');
      },
      serialize: function(filterFunc) {
        var formName = this.tableName + '.do';
        if (!filterFunc)
          return Form.serialize(gel(formName)) + this._serializeDisabled();
        var elements = Form.getElements(gel(formName));
        var queryComponents = new Array();
        for (var i = 0; i < elements.length; i++) {
          if (filterFunc(elements[i])) {
            var queryComponent;
            if (elements[i].disabled)
              queryComponent = elements[i].id + '=' + encodeURIComponent(elements[i].value);
            else
              queryComponent = Form.Element.serialize(elements[i]);
            if (queryComponent)
              queryComponents.push(queryComponent);
          }
        }
        return queryComponents.join('&');
      },
      _serializeDisabled: function() {
        var n = this.disabledFields.length;
        var dfa = [];
        for (var i = 0; i < n; i++) {
          var e = this.disabledFields[i];
          if (!e.value || !e.id)
            continue;
          dfa.push(e.id + '=' + encodeURIComponent(e.value));
        }
        if (dfa.length)
          return '&' + dfa.join('&');
        return '';
      },
      serializeChanged: function() {
        var s = this.serializeTargetFields();
        var f = this.serialize(this.changedFieldsFilter.bind(this));
        if (f)
          f = "&" + f;
        return s + f;
      },
      serializeChangedAll: function() {
        var s = this.serializeTargetFields();
        var f = this.serialize(this.allChangedFieldsFilter.bind(this));
        if (f)
          f = "&" + f;
        return s + f;
      },
      serializeTargetFields: function() {
        var s = this._serializeElement("sys_target");
        s += this._serializeElement("sys_uniqueValue");
        s += this._serializeElement("sys_row");
        s += this._serializeElement("sysparm_encoded_record");
        return s;
      },
      _serializeElement: function(id) {
        var e = gel(id);
        if (e) {
          var queryComponent = Form.Element.serialize(e);
          if (queryComponent)
            return "&" + queryComponent;
        }
        return "";
      },
      changedFieldsFilter: function(element) {
        if (element.changed &&
          element.id.startsWith(this.getTableName() + ".") &&
          (element.tagName.toUpperCase() != "TEXTAREA"))
          return true;
        if (element.id.startsWith("ni.VE"))
          return true;
        if (element.name.startsWith("ni.WATERMARK"))
          return true;
        return false;
      },
      allChangedFieldsFilter: function(element) {
        if (element.changed && element.id.startsWith(this.getTableName() + "."))
          return true;
        return false;
      },
      flash: function(widgetName, color, count) {
        var row = null;
        var labels = new Array();
        var realLabel = this.getLabel(widgetName);
        if (realLabel)
          row = $(realLabel.parentNode.parentNode);
        else {
          jslog("flash() called for '" + widgetName + "' but there is no label for it")
          return;
        }
        var temp = row.select('.label_left');
        for (var i = 0; i < temp.length; i++)
          labels.push(temp[i]);
        temp = row.select('.label_right');
        for (var i = 0; i < temp.length; i++)
          labels.push(temp[i]);
        temp = row.select('.label');
        for (var i = 0; i < temp.length; i++)
          labels.push(temp[i]);
        temp = row.select('.control-label');
        for (var i = 0; i < temp.length; i++)
          labels.push(temp[i]);
        count = count + 1;
        for (var i = 0; i < labels.length; i++) {
          var widget = labels[i];
          if (widget) {
            var originalColor = widget.style.backgroundColor;
            widget.style.backgroundColor = color;
          }
        }
        if (count < 4)
          setTimeout('g_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
      },
      enable: function() {
        var form = this.getFormElement();
        if (form)
          for (var i = 0; i < form.elements.length; i++)
            form.elements[i].disabled = false;
      },
      disable: function() {
        var form = this.getFormElement();
        if (form)
          for (var i = 0; i < form.elements.length; i++)
            form.elements[i].disabled = true;
      },
      showRelatedList: function(listTableName) {
        CustomEvent.fire('related_lists.show', listTableName);
      },
      hideRelatedList: function(listTableName) {
        CustomEvent.fire('related_lists.hide', listTableName);
      },
      getRelatedListNames: function() {
        if (window.NOW.g_relatedLists)
          return window.NOW.g_relatedLists.lists;
        if (window.g_tabs2List) {
          var relatedListNames = [];
          var trimmedNames = g_tabs2List.tabIDs;
          for (var i = 0; i < trimmedNames.length; i++)
            relatedListNames.push(trimmedNames[i].split('.').slice(1).join('.'));
          return relatedListNames;
        }
        var listWrapper = gel("related_lists_wrapper");
        if (!listWrapper)
          return [];
        var forthcomingTabs = listWrapper.getAttribute('data-lists');
        if (!forthcomingTabs)
          return [];
        return forthcomingTabs.split(',');
      },
      _getRelatedListID: function(listTableName) {
        var relatedList = this.findV2RelatedListName(listTableName);
        var relatedListId;
        if (relatedList)
          relatedListId = relatedList.getAttribute("id");
        if (!relatedListId)
          relatedListId = this.getTableName() + "." + listTableName;
        return relatedListId;
      },
      findV2RelatedListName: function(listTableName) {
        var tableName = this.getTableName();
        var compareId = tableName + "." + listTableName;
        var rlw = gel("related_lists_wrapper");
        if (!rlw)
          return "";
        for (var i = 0; i < rlw.childNodes.length; i++) {
          var node = rlw.childNodes[i];
          if (node.nodeName != "DIV")
            continue;
          var idName = node.getAttribute("id");
          if (idName.length == 0)
            continue;
          if (idName.indexOf(compareId) > -1)
            return node;
        }
        if (typeof GlideLists2 == "undefined")
          return;
        for (var id in GlideLists2) {
          var list = GlideLists2[id];
          if (list.getTableName() == listTableName && list.getParentTable() == tableName)
            return list.getContainer();
        }
        return "";
      },
      showRelatedLists: function() {
        var listNames = g_form.getRelatedListNames();
        for (var i = 0; i < listNames.length; i++) {
          this.showRelatedList(listNames[i]);
        }
      },
      hideRelatedLists: function() {
        var listNames = g_form.getRelatedListNames();
        for (var i = 0; i < listNames.length; i++) {
          this.hideRelatedList(listNames[i]);
        }
      },
      addInfoMessage: function(msg, id) {
        this._addFormMessage(msg, "info", id);
      },
      addWarningMessage: function(msg, id) {
        this._addFormMessage(msg, "warning", id);
      },
      addErrorMessage: function(msg, id) {
        this._addFormMessage(msg, "error", id);
      },
      _addFormMessage: function(msg, type, id) {
        GlideUI.get().addOutputMessage({
          msg: msg,
          type: type,
          id: id
        });
        var scrollDiv = getFormContentParent();
        scrollDiv.scrollTop = 0;
      },
      clearMessages: function() {
        GlideUI.get().clearOutputMessages();
      },
      showFieldMsg: function(input, message, type, scrollForm) {
          var msgClass;
          var msgImage;
          var msgImageAlt;
          var msgRowType;
          switch (type) {
            case "info":
              msgClass = this.INFO_CLASS;
              msgRowType = 'info' + this.MSG_ROW;
              break;
            case "error":
              msgClass = this.ERROR_CLASS;
              msgRowType = 'error' + this.MSG_ROW;
              break;
            case "warning":
              msgClass = this.WARNING_CLASS;
              msgRowType = 'warning' + this.MSG_ROW;
              break;
            default:
              type = 'info';
              msgClass = this.INFO_CLASS;
              msgRowType = 'info' + this.MSG_ROW;
              break;
          }
          var inputElement = input;
          if (typeof(inputElement) == "string")
            inputElement = this.getControl(inputElement);
          if (!inputElement) {
            var handler = this.getPrefixHandler(input);
            if (handler) {
              var handlerObject = handler.getObject();
              var fieldName = handler.getFieldName();
              var actualName = handlerObject.getActualName(fieldName);
              inputElement = handlerObject.getControl(actualName);
            }
          }
          if (!inputElement || !message) {
            jslog("ERROR: invalid field or missing message passed to g_form.showFieldMsg('" + input + "','" + message + "')");
            return;
          }
          if (inputElement.id && this.elementHandlers[inputElement.id] && (typeof this.elementHandlers[inputElement.id].showFieldMsg == "function"))
            this.elementHandlers[inputElement.id].showFieldMsg(input, message, type);
          var positionedCursor = this._positionCursorAtError(inputElement, message);
          var fieldRowId = "element." + inputElement.id;
          var fieldRow = document.getElementById(fieldRowId);
          var doc;
          var isVariable = false;
          var variableMsgRow = null;
          if (!fieldRow) {
            var parent = inputElement.parentNode;
            while (parent != null) {
              if (parent.nodeName.toUpperCase() == 'TR') {
                fieldRow = parent;
                isVariable = true;
                break;
              }
              parent = parent.parentNode;
            }
          }
          if (!fieldRow) {
            jslog("Error adding field message. Couldn't find the row to add the field message to.");
            return;
          }
          doc = fieldRow.ownerDocument;
          var inputContainer = inputElement.up('.form-field');
          if (!inputContainer)
            inputContainer = inputElement.up();
          var fieldMsgContainer = inputContainer.down('.fieldmsg-container');
          if (!fieldMsgContainer) {
            fieldMsgContainer = doc.createElement('div');
            fieldMsgContainer.className = 'fieldmsg-container';
            if (isVariable)
              fieldMsgContainer.className = 'variable-field-msg';
            fieldMsgContainer.id = inputElement.id + '_fieldmsg';
            inputContainer.insert(fieldMsgContainer);
            inputElement.setAttribute('aria-describedby', fieldMsgContainer.id);
          }
          var fieldMsgRow = doc.createElement('DIV');
          fieldMsgRow.className = msgClass;
          fieldMsgRow.hasFieldmsg = true;
          var fieldmsgMsg = doc.createTextNode(message);
          fieldMsgRow.appendChild(fieldmsgMsg);
          fieldMsgContainer.insert(fieldMsgRow);
          if (!positionedCursor)
            this._scrollToElementTR(fieldRow, fieldMsgRow, scroll