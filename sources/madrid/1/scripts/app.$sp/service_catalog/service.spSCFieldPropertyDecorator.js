/*! RESOURCE: /scripts/app.$sp/service_catalog/service.spSCFieldPropertyDecorator.js */
angular.module('sn.$sp').factory('spSCFieldPropertyDecorator', function(spScUtil, spSCConf, glideFormFieldFactory) {
  function isContainerType(field) {
    return field.type == spSCConf.CONTAINER_START || field.type == spSCConf.CHECKBOX_CONTAINER;
  }

  function isCheckboxEmpty(value) {
    return value == "false" || value == "";
  }
  return {
    decorate: decorateCatalogFields
  }

  function decorateCatalogFields(fields, g_form) {
    var _fields = fields;
    _addValidationScript(fields, g_form);
    _fields.forEach(function(field) {
      if (!spScUtil.isCatalogVariable(field))
        return;
      field._visible = field.visible;
      field._readonly = field.readonly;
      field._mandatory = field.mandatory;
      switch (field.type) {
        case spSCConf.CONTAINER_START:
          _overLoadContainerMandatoryProperty(field, g_form);
          _overLoadContainerVisibleProperty(field, g_form);
          _overLoadContainerValueProperty(field, g_form);
          _overLoadContainerReadonlyProperty(field, g_form);
          _overLoadContainerInvalidProperty(field, g_form);
          return;
        case spSCConf.CHECKBOX_CONTAINER:
          _overLoadCheckboxContainerMandatoryProperty(field, g_form);
          _overLoadCheckboxContainerVisibleProperty(field, g_form);
          _overLoadCheckboxContainerReadonlyProperty(field, g_form);
          _overLoadCheckboxContainerValueProperty(field, g_form);
          _overLoadCheckboxContainerLabelProperty(field, g_form);
          return;
        case spSCConf.CHECKBOX:
          _overLoadCheckboxMandatoryProperty(field, g_form);
          _overLoadCheckboxVisibleProperty(field, g_form);
          _overLoadCheckboxReadonlyProperty(field, g_form);
          return;
        case spSCConf.LABEL:
          _overLoadLabelMandatoryProperty(field, g_form);
          return;
        case spSCConf.MASKED:
          _overLoadMaskedValueProperty(field, g_form);
          _overLoadDefaultMandatoryProperty(field, g_form);
          _overLoadDefaultVisibleProperty(field, g_form);
          return;
        default:
          _overLoadDefaultMandatoryProperty(field, g_form);
          _overLoadDefaultVisibleProperty(field, g_form);
          return;
      }
    });

    function _getField(fieldName) {
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.variable_name === fieldName || field.name === fieldName) {
          return field;
        }
      }
      return null;
    }

    function _isCheckboxGroupMandatorySatisfied(field) {
      if (field.type !== spSCConf.CHECKBOX_CONTAINER)
        return false;
      for (var i = 0; i < field._children.length; i++) {
        var child = _getField(field._children[i]);
        if (!isCheckboxEmpty(child.value))
          return true;
      }
      return false;
    }

    function canHideOrDisableCheckbox(field) {
      var parent = _getField(field._parent);
      if (!parent._mandatory || _isCheckboxGroupMandatorySatisfied(parent))
        return true;
      var visibleEditableCheckboxes = parent._children
        .map(_getField)
        .filter(function(child) {
          return child._visible && !child._readonly;
        });
      if (visibleEditableCheckboxes.length == 1)
        return field !== visibleEditableCheckboxes[0];
      return visibleEditableCheckboxes.length > 1;
    }

    function canHideOrDisable(field) {
      if (isContainerType(field))
        return canHideOrDisableContainer(field);
      if (field.type == spSCConf.CHECKBOX) {
        return canHideOrDisableCheckbox(field);
      } else if (glideFormFieldFactory.isMandatory(field) && !glideFormFieldFactory.hasValue(field))
        return false;
      return true;
    }

    function canHideOrDisableCheckboxContainer(field) {
      if (!field._mandatory || _isCheckboxGroupMandatorySatisfied(field))
        return true;
      return false;
    }

    function canHideOrDisableContainer(field) {
      if (field.type == spSCConf.CHECKBOX_CONTAINER)
        return canHideOrDisableCheckboxContainer(field);
      for (var i = 0; i < field._children.length; i++) {
        if (!canHideOrDisable(_getField(field._children[i])))
          return false;
      }
      return true;
    }

    function onChangeVariableValidation(fieldName, oldValue, newValue) {
      var field = g_form.getField(fieldName);
      if (!field)
        return;
      var regex = field.validate_regex;
      var regexFlag = field.regex_flag;
      var errorMessage = field.validation_message;
      if (!regex)
        return;
      if (newValue) {
        spScUtil.validateRegex(field.sys_id, newValue).then(function() {
          field.isInvalid = false;
          field.isRegexInvalid = false;
        }, function() {
          if (g_form.hideFieldMsg)
            g_form.hideFieldMsg(fieldName);
          if (g_form.showFieldMsg)
            g_form.showFieldMsg(fieldName, errorMessage, 'error');
          field.isInvalid = true;
          field.isRegexInvalid = true;
          if (field.value != oldValue) {
            field.value = oldValue;
          }
        });
      }
    }

    function _addValidationScript(fields, g_form) {
      g_form.$private.events.on('change', onChangeVariableValidation);
    }

    function _overLoadDefaultMandatoryProperty(field, g_form) {
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          if (field.sys_readonly)
            return;
          this._mandatory = isMandatory;
          if (typeof this._parent != "undefined" && this._parent) {
            walkToRootAndSetVisibility(g_form, _getField(this._parent), true);
          }
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadDefaultVisibleProperty(field, g_form) {
      Object.defineProperty(field, 'visible', {
        set: function(isVisible) {
          this._visible = isVisible;
          if (typeof this._parent != 'undefined' && this._parent) {
            walkToRootAndSetVisibility(g_form, _getField(this._parent), isVisible);
          }
          return;
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function walkToRootAndSetVisibility(g_form, field, isVisible) {
      if (!isContainerType(field))
        return;
      if (!isVisible) {
        for (var i = 0; i < field._children.length; i++) {
          if (g_form.isVisible(field._children[i]))
            return false;
        }
        field.visible = isVisible;
        if (typeof field._parent == "string" && _getField(field._parent))
          walkToRootAndSetVisibility(g_form, _getField(field._parent), isVisible)
        field._cascade_hidden = true;
        return;
      } else {
        if ((field._cascade_hidden || !canHideOrDisableContainer(field))) {
          field._cascade_hidden = false;
          field.visible = isVisible;
          if (typeof field._parent == "string" && _getField(field._parent))
            walkToRootAndSetVisibility(g_form, _getField(field._parent), isVisible)
        }
      }
    }

    function _overLoadContainerValueProperty(field, g_form) {
      Object.defineProperty(field, "value", {
        get: function() {
          for (var i = 0; i < this._children.length; i++) {
            var child = _getField(this._children[i]);
            if (glideFormFieldFactory.hasValue(child))
              return "true";
          }
          return "";
        },
        set: function(value) {
          return;
        },
        configurable: true
      });
    }

    function _overLoadContainerMandatoryProperty(field, g_form) {
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          this._mandatory = isMandatory;
          var canHideContainer = true;
          for (var i = 0; i < this._children.length; i++) {
            var child = _getField(this._children[i]);
            g_form.setMandatory(child.name, isMandatory);
            canHideContainer = canHideContainer && canHideOrDisable(child);
          }
          if (isMandatory) {
            if (!this._visible && canHideContainer) {
              return;
            }
            if (typeof this._parent != 'undefined' && this._parent)
              walkToRootAndSetVisibility(g_form, _getField(this._parent), true);
          }
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadContainerVisibleProperty(field, g_form) {
      Object.defineProperty(field, 'visible', {
        set: function(isVisible) {
          if (isVisible) {
            if (!this._visible && this._cascade_hidden) {
              return;
            }
          } else {
            if (!canHideOrDisableContainer(this)) {
              return;
            }
          }
          this._visible = isVisible;
          this._cascade_hidden = false;
          if (typeof this._parent != 'undefined' && this._parent)
            walkToRootAndSetVisibility(g_form, _getField(this._parent), isVisible);
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function _overLoadContainerReadonlyProperty(field, g_form) {
      Object.defineProperty(field, 'readonly', {
        set: function(isReadonly) {
          for (var i = 0; i < this._children.length; i++) {
            var child = _getField(this._children[i]);
            if (isContainerType(child) || !isReadonly || (isReadonly && canHideOrDisable(child))) {
              if (child.sys_readonly)
                continue;
              child.readonly = isReadonly;
            }
          }
          this._readonly = isReadonly;
        },
        get: function() {
          return this._readonly;
        },
        configurable: true
      });
    }

    function _overLoadContainerInvalidProperty(field, g_form) {
      Object.defineProperty(field, 'isInvalid', {
        set: function(isReadonly) {
          return;
        },
        get: function() {
          return false;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerMandatoryProperty(field, g_form) {
      if (field.render_label) {
        for (var i = 0; i < field._children.length; i++) {
          if (_getField(field._children[i]).mandatory) {
            field._mandatory = true;
            break;
          }
        }
      } else {
        var childCheckbox = _getField(field._children[0]);
        if (childCheckbox.mandatory)
          field._mandatory = true;
      }
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          var forceOpenChildren = isMandatory && !_isCheckboxGroupMandatorySatisfied(this);
          for (var i = 0; i < field._children.length; i++) {
            var child = _getField(field._children[i]);
            if (forceOpenChildren) {
              child._visible = true;
              child.readonly = false;
            }
            g_form.setMandatory(field._children[i], isMandatory);
          }
          this._mandatory = isMandatory;
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerVisibleProperty(field, g_form) {
      Object.defineProperty(field, "visible", {
        set: function(isVisible) {
          if (isVisible) {
            if (!this._visible && this._cascade_hidden) {
              return;
            }
          } else {
            if (!canHideOrDisableCheckboxContainer(this))
              return;
          }
          this._visible = isVisible;
          this._cascade_hidden = false;
          if (typeof this._parent != "undefined" && this._parent) {
            walkToRootAndSetVisibility(g_form, _getField(this._parent), isVisible);
          }
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerReadonlyProperty(field, g_form) {
      Object.defineProperty(field, "readonly", {
        set: function(isReadonly) {
          if (isReadonly && !canHideOrDisableCheckboxContainer(this)) {
            return;
          }
          for (var i = 0; i < field._children.length; i++) {
            g_form.setReadonly(field._children[i], isReadonly);
          }
          this._readonly = isReadonly;
          this._cascade_readonly = true;
        },
        get: function() {
          return this._readonly;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerValueProperty(field, g_form) {
      Object.defineProperty(field, "value", {
        get: function() {
          if (this._mandatory && _isCheckboxGroupMandatorySatisfied(this))
            return "true";
          return this._mandatory ? "" : "false";
        },
        set: function(value) {
          return;
        },
        configurable: true
      });
      Object.defineProperty(field, "stagedValue", {
        get: function() {
          if (this._mandatory && _isCheckboxGroupMandatorySatisfied(this))
            return "true";
          return this._mandatory ? "" : "false";
        },
        set: function(value) {
          return;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxContainerLabelProperty(field, g_form) {
      if (field.render_label)
        return;
      Object.defineProperty(field, 'label', {
        get: function() {
          var childCheckbox = _getField(this._children[0]);
          return childCheckbox.label;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxMandatoryProperty(field, g_form) {
      Object.defineProperty(field, "mandatory", {
        set: function(isMandatory) {
          var checkboxContainer = _getField(this._parent);
          if (isMandatory && isCheckboxEmpty(this.value)) {
            this._mandatory = isMandatory;
            checkboxContainer._mandatory = isMandatory;
            var groupSatisfied = _isCheckboxGroupMandatorySatisfied(checkboxContainer);
            if (!checkboxContainer._visible && groupSatisfied) {
              return;
            }
            if (!groupSatisfied) {
              if (!this._visible)
                this._visible = true;
              if (this._readonly)
                this._readonly = false;
            }
            checkboxContainer._visible = true;
            checkboxContainer._readonly = false;
            if (typeof checkboxContainer._parent != "undefined" && checkboxContainer._parent)
              walkToRootAndSetVisibility(g_form, _getField(checkboxContainer._parent), true);
          }
          this._mandatory = isMandatory;
          if (isMandatory) {
            checkboxContainer._mandatory = true;
            return;
          }
          for (var i = 0; i < checkboxContainer._children.length; i++) {
            if (_getField(checkboxContainer._children[i])._mandatory) {
              checkboxContainer._mandatory = true;
              return;
            }
          }
          checkboxContainer._mandatory = isMandatory;
          checkboxContainer.isInvalid = false;
        },
        get: function() {
          return this._mandatory;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxVisibleProperty(field, g_form) {
      Object.defineProperty(field, "visible", {
        set: function(isVisible) {
          if (!isVisible && !canHideOrDisableCheckbox(this)) {
            return;
          }
          this._visible = isVisible;
          if (typeof this._parent != "undefined" && this._parent) {
            var parent = _getField(this._parent);
            if (isVisible && !parent.visible && !parent._cascade_hidden)
              return;
            if (!isVisible) {
              if (parent._mandatory && !_isCheckboxGroupMandatorySatisfied(parent)) {
                var visibleCheckboxes = parent._children
                  .map(_getField)
                  .filter(function(child) {
                    return child._visible;
                  });
                if (visibleCheckboxes.length > 0)
                  return;
              }
              return walkToRootAndSetVisibility(g_form, parent, false);
            }
            parent._visible = isVisible;
            parent._cascade_hidden = !isVisible;
            if (typeof parent._parent != "undefined" && parent._parent)
              walkToRootAndSetVisibility(g_form, _getField(parent._parent), isVisible);
          }
        },
        get: function() {
          return this._visible;
        },
        configurable: true
      });
    }

    function _overLoadCheckboxReadonlyProperty(field, g_form) {
      Object.defineProperty(field, "readonly", {
        set: function(isReadonly) {
          if (isReadonly && !canHideOrDisableCheckbox(this))
            return false;
          this._readonly = isReadonly;
          if (_getField(this._parent)._cascade_readonly) {
            _getField(this._parent)._cascade_readonly = false;
            _getField(this._parent)._readonly = false;
          }
        },
        get: function() {
          return this._readonly;
        },
        configurable: true
      });
    }

    function _overLoadLabelMandatoryProperty(field, g_form) {
      Object.defineProperty(field, 'mandatory', {
        set: function(isMandatory) {
          console.log("setMandatory not applicable for 'Label' variable type");
          return;
        },
        configurable: true
      });
    }

    function _overLoadMaskedValueProperty(field, g_form) {
      field._value = field.value;
      Object.defineProperty(field, 'value', {
        set: function(value) {
          field._value = value;
          if (field._setFromModel)
            field._setFromModel = false;
          else {
            field.confirmPassword = value;
            field.isInvalid = false;
          }
        },
        get: function() {
          return field._value;
        },
        configurable: true
      });
    }
  }
});;