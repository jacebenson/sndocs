/*! RESOURCE: /scripts/sn/common/clientScript/glideFormFactory.js */
(function(exports, document, glideFormFieldFactory, undefined) {
  'use strict';
  exports.glideFormFactory = {
    create: createGlideForm,
    glideRequest: exports.glideRequest
  };
  var DEFAULT_ACTION_NAME = 'none';
  var SUBMIT_ACTION_NAME = 'submit';
  var SAVE_ACTION_NAME = 'save';
  var EVENT_ON_CHANGE = 'onChange';
  var EVENT_CHANGE = 'change';
  var EVENT_ON_SUBMIT = 'onSubmit';
  var EVENT_SUBMIT = 'submit';
  var EVENT_ON_SUBMITTED = 'onSubmitted';
  var EVENT_SUBMITTED = 'submitted';
  var EVENT_ON_CHANGED = 'onChanged';
  var EVENT_CHANGED = 'changed';
  var EVENT_PROPERTY_CHANGE = 'propertyChange';
  var EVENT_ON_PROPERTY_CHANGE = 'onPropertyChange';
  var PROPERTY_CHANGE_FORM = 'FORM';
  var PROPERTY_CHANGE_FIELD = 'FIELD';
  var PROPERTY_CHANGE_SECTION = 'SECTION';
  var PROPERTY_CHANGE_RELATED_LIST = 'RELATED_LIST';

  function createGlideForm(tableName, sysId, fields, uiActions, options) {
    if (!fields) {
      fields = [];
    }
    var _sysId = sysId ? sysId : '-1';
    var _fields = fields;
    var _dirtyFields = _getDirtyQueryFields(fields);
    var _submitActionName = DEFAULT_ACTION_NAME;
    var _onSubmitHandlers = [];
    var _onSubmittedHandlers = [];
    var _onChangeHandlers = [];
    var _onChangedHandlers = [];
    var _onPropertyChangeHandlers = [];
    var _options = {
      getMappedField: null,
      getMappedFieldName: null,
      uiMessageHandler: null,
      encodedRecord: null,
      relatedLists: null,
      sections: null,
      viewName: '',
      document: null
    };

    function GlideForm() {
      this.hasField = function(fieldName) {
        var field = _getField(fieldName);
        return field !== null;
      };
      this.getFieldNames = function() {
        var fieldNames = [];
        _fields.forEach(function(field) {
          fieldNames.push(field.name);
        });
        return fieldNames;
      };
      this.setLabel = function(fieldName, label) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        field.label = label;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          fieldName,
          'label'
        );
      };
      this.setLabelOf = this.setLabel;
      this.getLabel = function(fieldName) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        return field.label;
      };
      this.getLabelOf = this.getLabel;
      this.addDecoration = function(fieldName, icon, text) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (!field.decorations || !_isArray(field.decorations)) {
          field.decorations = [];
        }
        var deco = {
          icon: icon,
          text: text
        };
        for (var i = 0; i < field.decorations.length; i++) {
          var dec = field.decorations[i];
          if ((dec.icon === icon) && (dec.text === text)) {
            return;
          }
        }
        field.decorations.push(deco);
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'decorations'
        );
      };
      this.removeDecoration = function(fieldName, icon, text) {
        var field = _getField(fieldName);
        if (!field)
          return;
        if (!field.decorations || !_isArray(field.decorations)) {
          return;
        }
        for (var i = 0; i < field.decorations.length; i++) {
          var dec = field.decorations[i];
          if ((dec.icon === icon) && (dec.text === text)) {
            field.decorations.splice(i, 1);
            return;
          }
        }
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'decorations'
        );
      };
      this.setFieldPlaceholder = function(fieldName, value) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        field.placeholder = value;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'placeholder'
        );
      };
      this.getEncodedRecord = function() {
        return _options.encodedRecord || '';
      };
      this.isMandatory = function(fieldName) {
        var field = _getField(fieldName);
        return field ? !!field.mandatory : false;
      };
      this.setMandatory = function(fieldName, isMandatory) {
        var field = _getField(fieldName);
        if (!field)
          return;
        if (field.sys_mandatory) {
          return;
        }
        isMandatory = _getBoolean(isMandatory);
        field.mandatory = isMandatory;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'mandatory'
        );
      };
      this.isReadOnly = function(fieldName) {
        var field = _getField(fieldName);
        return field ? !!field.readonly : false;
      };
      this.setReadOnly = function(fieldName, readonly) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (field.sys_readonly) {
          return;
        }
        field.readonly = _getBoolean(readonly);
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'readonly'
        );
      };
      this.setReadonly = this.setReadOnly;
      this.setDisabled = this.setReadOnly;
      this.isVisible = function(fieldName) {
        var field = _getField(fieldName);
        return field ? !!field.visible : false;
      };
      this.setVisible = function(fieldName, isVisible) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        field.visible = _getBoolean(isVisible);
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'visible'
        );
      };
      this.setDisplay = this.setVisible;
      this.getValue = function(fieldName) {
        var field = _getField(fieldName);
        if (!field) {
          return '';
        }
        return (typeof field.value !== 'undefined' && field.value !== null) ? field.value.toString() : '';
      };
      this.getDisplayValue = function(fieldName) {
        var field = _getField(fieldName);
        if (!field) {
          return '';
        }
        return field.displayValue;
      };
      this.clearValue = function(fieldName) {
        this.setValue(fieldName, '');
      };
      this.setValue = function(fieldName, value, displayValue) {
        var field = _getField(fieldName);
        _setValue(this, field, value, displayValue);
      };
      this.getTableName = function() {
        return tableName;
      };
      this.getViewName = function() {
        return _options.viewName;
      };
      this.isNewRecord = function() {
        return _sysId === "-1";
      };
      this.getSysId = function() {
        return _sysId;
      };
      this.getUniqueValue = this.getSysId;
      this.getBooleanValue = function(fieldName) {
        var val = this.getValue(fieldName);
        val = val ? val + '' : val;
        if (!val || val.length === 0 || val == "false") {
          return false;
        }
        return true;
      };
      this.getDecimalValue = function(fieldName) {
        var value = this.getValue(fieldName);
        if (!value || (value.length === 0)) {
          return 0;
        }
        return parseFloat(value);
      };
      this.getIntValue = function(fieldName) {
        var value = this.getValue(fieldName);
        if (typeof value === 'string') {
          value = value.trim();
        }
        if (!value || (value.length === 0)) {
          return 0;
        }
        return parseInt(value, 10);
      };
      this.addOption = function(fieldName, choiceValue, choiceLabel, choiceIndex) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        var added = _addToOptionStack(field, 'add', choiceValue, choiceLabel, choiceIndex);
        if (added) {
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'optionStack'
          );
        }
      };
      this.clearOptions = function(fieldName) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        _addToOptionStack(field, 'clear');
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'optionStack'
        );
      };
      this.removeOption = function(fieldName, choiceValue) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        _addToOptionStack(field, 'remove', choiceValue);
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'optionStack'
        );
      };
      this.hideRelatedList = function(listTableName) {
        var list = _getRelatedList(listTableName);
        if (!list) {
          return;
        }
        list.visible = false;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_RELATED_LIST,
          listTableName,
          'visible'
        );
      };
      this.hideRelatedLists = function() {
        if (!_options.relatedLists) {
          return;
        }
        _options.relatedLists.forEach(function(list) {
          this.hideRelatedList(_getRelatedListName(list));
        }, this);
      };
      this.showRelatedList = function(listTableName) {
        var list = _getRelatedList(listTableName);
        if (!list) {
          return;
        }
        list.visible = true;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_RELATED_LIST,
          listTableName,
          'visible'
        );
      };
      this.showRelatedLists = function() {
        if (!_options.relatedLists) {
          return;
        }
        _options.relatedLists.forEach(function(list) {
          this.showRelatedList(_getRelatedListName(list));
        }, this);
      };
      this.getRelatedListNames = function() {
        var listNames = [];
        if (_options.relatedLists) {
          _options.relatedLists.forEach(function(list) {
            listNames.push(_getRelatedListName(list));
          });
        }
        return listNames;
      };
      this.getSectionNames = function() {
        var sectionNames = [];
        if (_options.sections) {
          _options.sections.forEach(function(section) {
            var sectionName = _getSectionName(section);
            if (sectionName !== null) {
              sectionNames.push(sectionName);
            }
          });
        }
        return sectionNames;
      };
      this.setSectionDisplay = function(sectionName, display) {
        var section = _getSection(sectionName);
        if (!section) {
          return;
        }
        section.visible = !!display;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_SECTION,
          sectionName,
          'visible'
        );
      };
      this.getReference = function(fieldName, callback) {
        if (!callback) {
          _logWarn('GETREF:NOCB', 'Mobile scripts must specify a callback function');
          return;
        }
        var field = _getField(fieldName);
        if (!field) {
          _logWarn('GETREF:FNF', 'Field not found: ' + fieldName);
          return;
        }
        var table = _getReferenceTable(field);
        var referenceKey = field.reference_key ? field.reference_key : 'sys_id';
        var gr = new exports.GlideRecord(table);
        gr.get(referenceKey, field.value, callback);
      };
      this.addErrorMessage = function(message) {
        _fireUiMessage(this, 'errorMessage', message);
      };
      this.addInfoMessage = function(message) {
        _fireUiMessage(this, 'infoMessage', message);
      };
      this.clearMessages = function() {
        _fireUiMessage(this, 'clearMessages');
      };
      this.showFieldMsg = function(fieldName, message, type, scrollForm) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (!field.messages) {
          field.messages = [];
        }
        switch (type) {
          default: return;
          case 'info':
              case 'error':
              break;
        }
        field.messages.push({
          message: message,
          type: type
        });
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          fieldName,
          'messages'
        );
      };
      this.hideFieldMsg = function(fieldName, clearAll) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (!field.messages || !_isArray(field.messages)) {
          return;
        }
        if (clearAll) {
          field.messages = [];
        } else {
          field.messages.shift();
        }
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          fieldName,
          'messages'
        );
      };
      this.hideAllFieldMsgs = function(type) {
        switch (type) {
          default: return;
          case 'info':
              case 'error':
              break;
        }
        for (var i = 0; i < _fields.length; i++) {
          var msgs = _fields[i].messages;
          if (!msgs || !_isArray(msgs)) {
            continue;
          }
          for (var j = 0; j < msgs.length; j++) {
            if (msgs[j].type === type) {
              msgs.splice(j, 1);
            }
          }
        }
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FORM,
          null,
          'messages'
        );
      };
      this.showErrorBox = function(fieldName, message, scrollForm) {
        this.showFieldMsg(fieldName, message, 'error', scrollForm);
      };
      this.hideErrorBox = function(fieldName) {
        this.hideFieldMsg(fieldName, false);
      };
      this.getActionName = function() {
        return _submitActionName;
      };
      this.save = function() {
        return this.submit(SAVE_ACTION_NAME);
      };
      this.submit = function(submitActionName) {
        var formDocument = _options.document ? _options.document : document;
        var activeElement = formDocument.activeElement;
        if (activeElement) {
          activeElement.blur();
        }
        _submitActionName = submitActionName || SUBMIT_ACTION_NAME;
        if (!_hasMandatoryFields(this) || !_runSubmitScripts()) {
          _submitActionName = DEFAULT_ACTION_NAME;
          return false;
        }
        var uiAction = _getUIAction(submitActionName);
        if (!uiAction)
          return true;
        return uiAction.execute(this);
      };
      this.serialize = function(onlyDirtyFields) {
        var serializeField = function(field, fields) {
          var fieldCopy = _copy(field);
          if (fieldCopy.value == null || typeof fieldCopy.value === 'undefined') {
            fieldCopy.value = '';
          }
          fields.push(fieldCopy);
        };
        var serializedFields = [];
        if (onlyDirtyFields === true) {
          Object.keys(_dirtyFields).forEach(function(fieldName) {
            serializeField(_getField(fieldName), serializedFields);
          });
        } else {
          _fields.forEach(function(field) {
            serializeField(field, serializedFields);
          });
        }
        return serializedFields;
      };
      this.$private = {
        options: function(options) {
          if (!options) {
            return;
          }
          if (typeof options === 'string') {
            return _options[options];
          }
          Object.keys(options).forEach(function(optionName) {
            if (_options[optionName]) {
              throw 'Cannot override option: ' + optionName;
            }
            _options[optionName] = options[optionName];
          });
        },
        events: {
          on: function(eventName, fn) {
            switch (eventName) {
              case EVENT_CHANGE:
              case EVENT_ON_CHANGE:
                _onChangeHandlers.push(fn);
                break;
              case EVENT_SUBMIT:
              case EVENT_ON_SUBMIT:
                _onSubmitHandlers.push(fn);
                break;
              case EVENT_SUBMITTED:
              case EVENT_ON_SUBMITTED:
                _onSubmittedHandlers.push(fn);
                break;
              case EVENT_CHANGED:
              case EVENT_ON_CHANGED:
                _onChangedHandlers.push(fn);
                break;
              case EVENT_PROPERTY_CHANGE:
              case EVENT_ON_PROPERTY_CHANGE:
                _onPropertyChangeHandlers.push(fn);
                break;
              default:
                throw 'Unsupported GlideForm event: ' + eventName;
            }
          },
          propertyChange: function(type, name, propertyName) {
            if (_onPropertyChangeHandlers.length == 0) {
              return;
            }
            switch (type) {
              default: type = PROPERTY_CHANGE_FIELD;
              case PROPERTY_CHANGE_FIELD:
                  case PROPERTY_CHANGE_SECTION:
                  case PROPERTY_CHANGE_RELATED_LIST:
                  break;
            }
            _onPropertyChangeHandlers.forEach(function(fn) {
              fn.call(
                fn,
                type,
                name,
                propertyName
              );
            });
          },
          off: function(eventName) {
            switch (eventName) {
              case EVENT_CHANGE:
              case EVENT_ON_CHANGE:
                _onChangeHandlers = [];
                break;
              case EVENT_SUBMIT:
              case EVENT_ON_SUBMIT:
                _onSubmitHandlers = [];
                break;
              case EVENT_SUBMITTED:
              case EVENT_ON_SUBMITTED:
                _onSubmittedHandlers = [];
                break;
              case EVENT_CHANGED:
              case EVENT_ON_CHANGED:
                _onChangedHandlers = [];
                break;
              case EVENT_PROPERTY_CHANGE:
              case EVENT_ON_PROPERTY_CHANGE:
                _onPropertyChangeHandlers = [];
                break;
              default:
                throw 'Unsupported GlideForm event: ' + eventName;
            }
          },
          cleanup: function() {
            _onChangeHandlers = [];
            _onSubmitHandlers = [];
            _onSubmittedHandlers = [];
            _onChangedHandlers = [];
            _onPropertyChangeHandlers = [];
          }
        }
      };
    }
    var _valueCalls = 0;

    function _setValue(g_form, field, value, displayValue, skipDerivedFieldUpdate, skipDisplayValueUpdate) {
      if (!field) {
        return;
      }
      var oldValue = field.value;
      if (oldValue !== value) {
        _dirtyFields[field.name] = true;
      }
      field.value = value;
      if (field.type === 'reference') {
        if (!skipDerivedFieldUpdate) {
          _updateDerivedFields(g_form, field);
        }
        if (!skipDisplayValueUpdate && glideFormFieldFactory.hasValue(field) && !displayValue) {
          field.displayValue = '';
          g_form.getReference(field.name, function(gr) {
            var displayValue = gr.getDisplayValue();
            field.value = oldValue;
            _setValue(g_form, field, value, displayValue, true, true);
          });
          return;
        }
      }
      field.displayValue = typeof displayValue !== 'undefined' && displayValue != null ? displayValue : value;
      var fields = _getDependentFields(field.name);
      fields.forEach(function(field) {
        if (field.dependentValue !== value) {
          field.dependentValue = value;
        }
        if (field.ed && field.ed.dependent_value !== value)
          field.ed.dependent_value = value;
      });
      _fireValueChange(field, oldValue, value);
    }

    function _getRelatedList(listTableName) {
      if (!_options.relatedLists) {
        return null;
      }
      var foundList = null;
      _options.relatedLists.forEach(function(list) {
        if (foundList) {
          return;
        }
        if (listTableName === _getRelatedListName(list)) {
          foundList = list;
          return;
        }
        if (listTableName === list.table || listTableName === list.field) {
          foundList = list;
          return;
        }
      });
      return foundList;
    }

    function _getRelatedListName(list) {
      if (list.related_field) {
        return list.value;
      }
      return list.table + '.' + list.field;
    }

    function _getSection(sectionName) {
      if (!_options.sections) {
        return null;
      }
      var foundSection = null;
      _options.sections.forEach(function(section) {
        if (foundSection) {
          return;
        }
        var name = _getSectionName(section);
        if (name === sectionName) {
          foundSection = section;
          return;
        }
      });
      return foundSection;
    }

    function _getSectionName(section) {
      var sectionName = section.caption;
      if (!sectionName) {
        return null;
      }
      return sectionName.toLowerCase().replace(" ", "_").replace(/[^0-9a-z_]/gi, "");
    }

    function _fireValueChange(field, oldValue, value) {
      if (_onChangeHandlers.length > 0) {
        _valueCalls++;
        _onChangeHandlers.forEach(function(fn) {
          fn.call(fn, field.name, oldValue, value);
        });
        _valueCalls--;
      }
      if (_options.getMappedFieldName) {
        var mappedName = _options.getMappedFieldName(field.name);
        _valueCalls++;
        _onChangeHandlers.forEach(function(fn) {
          fn.call(fn, mappedName, oldValue, value);
        });
        _valueCalls--;
      }
      if ((_valueCalls == 0) && _onChangedHandlers.length > 0) {
        _onChangedHandlers.forEach(function(fn) {
          fn.call(fn);
        });
      }
    }

    function _updateDerivedFields(g_form, originatingField) {
      var derivedFields = _getDerivedFields(originatingField.name);
      if (!glideFormFieldFactory.hasValue(originatingField)) {
        derivedFields.forEach(function(field) {
          _setValue(g_form, field, '', null, true);
        });
        return;
      }
      var relativeFieldNames = [];
      var fieldsByRelativeFieldName = {};
      derivedFields.forEach(function(field) {
        var relativeField = _relativeDerivedFieldName(field.name, originatingField.name);
        fieldsByRelativeFieldName[relativeField] = field;
        relativeFieldNames.push(relativeField);
      });
      if (relativeFieldNames.length == 0) {
        return;
      }
      var glideRequest = glideFormFactory.glideRequest;
      var referenceTable = _getReferenceTable(originatingField);
      var referenceKey = originatingField.reference_key ? originatingField.reference_key : 'sys_id';
      var requestUri = '/api/now/v1/table/' + referenceTable;
      var requestParams = {
        sysparm_display_value: 'all',
        sysparm_fields: relativeFieldNames.join(','),
        sysparm_query: referenceKey + '=' + originatingField.value,
        sysparm_limit: 1
      };
      glideRequest.get(requestUri, {
        params: requestParams
      }).then(function(response) {
        var result = response && response.data ? response.data.result : null;
        if (result.length > 0) {
          result = result[0];
          var keys = Object.keys(result);
          keys.forEach(function(fieldName) {
            var field = fieldsByRelativeFieldName[fieldName];
            var newFieldValues = result[fieldName];
            _setValue(g_form, field, newFieldValues.value, newFieldValues.display_value, true);
          });
        }
      });
    }

    function _getField(fieldName) {
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.variable_name === fieldName || field.name === fieldName) {
          return field;
        }
      }
      if (_options.getMappedField) {
        var mapped = _options.getMappedField(fieldName);
        if (mapped) {
          return mapped;
        }
      }
      return null;
    }

    function _getDependentFields(fieldName) {
      var fields = [];
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.dependentField === fieldName) {
          fields.push(field);
        }
      }
      return fields;
    }

    function _getDerivedFields(fieldName) {
      var fields = [];
      var derivedFieldPrefix = fieldName + '.';
      for (var i = 0, iM = _fields.length; i < iM; i++) {
        var field = _fields[i];
        if (field.name.startsWith(derivedFieldPrefix)) {
          fields.push(field);
        }
      }
      return fields;
    }

    function _relativeDerivedFieldName(derivedFieldName, rootFieldName) {
      var prefix = rootFieldName + '.';
      return derivedFieldName.replace(prefix, '');
    }

    function _addToOptionStack(field, operation, value, label, index) {
      if (!field.optionStack) {
        field.optionStack = [];
      }
      if (operation === 'add') {
        var foundOperations = [];
        for (var i = 0, iM = field.optionStack.length; i < iM; i++) {
          if (field.optionStack[i].value === value) {
            foundOperations.push(field.optionStack[i]);
          }
        }
        if (foundOperations.length > 0) {
          var isInChoiceList = false;
          for (var i = 0, iM = foundOperations.length; i < iM; i++) {
            switch (foundOperations[i].operation) {
              case 'add':
                isInChoiceList = true;
                break;
              case 'clear':
              case 'remove':
                isInChoiceList = false;
                break;
            }
          }
          if (isInChoiceList) {
            return false;
          }
        }
      }
      var optionOper = {
        operation: operation,
        label: label,
        value: value,
        index: index
      };
      field.optionStack.push(optionOper);
      return true;
    }

    function _hasMandatoryFields(g_form) {
      var emptyMandatoryFields = [];
      for (var i = 0; i < _fields.length; i++) {
        var f = _fields[i];
        if (!glideFormFieldFactory.isMandatory(f)) {
          continue;
        }
        if (!glideFormFieldFactory.hasValue(f)) {
          emptyMandatoryFields.push(f.label);
        }
      }
      if (emptyMandatoryFields.length === 0) {
        return true;
      }
      var message = "The following fields are incomplete:\n\n" + emptyMandatoryFields.join("\n");
      _fireUiMessage(g_form, 'mandatoryMessage', message);
      return false;
    }

    function _runSubmitScripts() {
      if (_onSubmitHandlers.length > 0) {
        var result;
        for (var i = 0, iM = _onSubmitHandlers.length; i < iM; i++) {
          result = _onSubmitHandlers[i].call(null);
          if (result === false) {
            return false;
          }
        }
      }
      if (_onSubmittedHandlers.length > 0) {
        _onSubmittedHandlers.forEach(function(fn) {
          fn.call(fn, _submitActionName);
        });
      }
      return true;
    }

    function _getUIAction(name) {
      if (!uiActions) {
        return false;
      }
      return uiActions.getActionByName(name);
    }

    function _getDirtyQueryFields(fields) {
      var dirtyFields = {};
      if (fields) {
        fields.forEach(function(field) {
          if (typeof field.dirtyQueryField !== 'undefined' && field.dirtyQueryField === true) {
            dirtyFields[field.name] = true;
          }
        });
      }
      return dirtyFields;
    }

    function _getReferenceTable(field) {
      var referenceTable = field.ed ? field.ed.reference : undefined;
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.refTable;
      }
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.ref_table;
      }
      return referenceTable;
    }

    function _fireUiMessage(g_form, type, message) {
      var handledMessage = false;
      if (_options.uiMessageHandler) {
        var response = _options.uiMessageHandler(g_form, type, message);
        handledMessage = response !== false;
      }
      if (!handledMessage && typeof message !== 'undefined') {
        alert(message);
      }
      g_form.$private.events.propertyChange(
        PROPERTY_CHANGE_FORM,
        null,
        type
      );
    }
    var instance = new GlideForm();
    if (options) {
      instance.$private.options(options);
    }
    _deprecate(instance, [
      'disableAttachments',
      'enableAttachments',
      'flash',
      'getControl',
      'getElement',
      'getFormElement',
      'getSections'
    ]);
    return instance;
  }

  function _getBoolean(value) {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    return value ? true : false;
  }

  function _notImplemented(instance, methods) {
    methods.forEach(function(method) {
      if (!instance[method]) {
        instance[method] = function() {
          _logWarn('UNSUPPORTED', 'Method ' + method + ' is not supported on mobile');
        };
      }
    });
  }

  function _deprecate(instance, methods) {
    methods.forEach(function(method) {
      if (!instance[method]) {
        instance[method] = function() {
          _logWarn('DEPRECATED', 'Method ' + method + ' is deprecated and unsupported on mobile');
        };
      }
    });
  }

  function _logWarn(code, msg) {
    if (console && console.warn) {
      console.warn('(g_form) [' + code + '] ' + msg);
    }
  }

  function _isArray(o) {
    if (!Array.isArray) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }
    return Array.isArray(o);
  }

  function _copy(source) {
    var dest = {};
    for (var prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        switch (typeof source[prop]) {
          case 'function':
            break;
          default:
            dest[prop] = source[prop];
        }
      }
    }
    return dest;
  }
})(window, window.document || {}, window.glideFormFieldFactory);;