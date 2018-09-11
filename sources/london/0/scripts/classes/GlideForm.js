/*! RESOURCE: /scripts/classes/GlideForm.js */
function default_on_submit() {
  if (!g_form)
    return true;
  return g_form.onSubmit();
}
var GlideForm = Class.create({
      INFO_CLASS: "outputmsg_info",
      ERROR_CLASS: "outputmsg_error",
      WARNING_CLASS: "outputmsg_warning",
      INFO_ICON: "images/outputmsg_success.gifx",
      ERROR_ICON: "images/outputmsg_error.gifx",
      WARNING_ICON: "images/outputmsg_warning.gifx",
      MSG_ROW: "_message_row",
      initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger) {
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
        CachedEvent.emit('glideform.initialized', this);
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
            handler.getObject().setVisible(handler.getFieldName(), visibility);
          return;
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
        if (this.changeElementParent(ge, name, value)) {
          if (isMSIE6 && name == "display" && typeof tiny_html_editor === 'undefined') {
            var el = ge.getElement();
            el.style[name] = value;
          }
          return;
        }
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
          var decoration = $(element).select(".reference_decoration");
          if (decoration && decoration.length > 0)
            for (var i = 0; i < decoration.length; i++)
              decoration[i].style[name] = value;
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
        if (!thisElement)
          return false;
        return thisElement.isMandatory();
      },
      addSecurityReadOnlyFields: function(fields) {
        this.securityReadOnlyFields = fields.split(',');
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
      },
      setReadOnly: function(fieldName, disabled) {
        this.setReadonly(fieldName, disabled);
      },
      setReadonly: function(fieldName, disabled) {
          fieldName = this.removeCurrentPrefix(fieldNam