/*! RESOURCE: /scripts/sn/common/clientScript/glideFormFactory.js */
(function(exports, document, glideFormFieldFactory, undefined) {
  'use strict';
  exports.glideFormFactory = {
    create: createGlideForm,
    glideRequest: exports.glideRequest
  };
  var EMPTY_FIELD_VALUE = '';
  var DEFAULT_ACTION_NAME = 'none';
  var SUBMIT_ACTION_NAME = 'submit';
  var SAVE_ACTION_NAME = 'save';
  var FORM_STATE_UNMODIFIED = 'unmodified';
  var FORM_STATE_MODIFIED = 'modified';
  var FORM_STATE_SAVED = 'saved';
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
  var EVENT_STATE_CHANGE = 'stateChange';
  var EVENT_ON_STATE_CHANGE = 'onStateChange';
  var EVENT_LIVE_UPDATED = 'liveUpdated';
  var EVENT_ON_LIVE_UPDATED = 'onLiveUpdated';
  var EVENT_USER_CHANGE_VALUE = 'userChangeValue';
  var EVENT_ON_USER_CHANGE_VALUE = 'onUserChangeValue';
  var PROPERTY_CHANGE_FORM = 'FORM';
  var PROPERTY_CHANGE_FIELD = 'FIELD';
  var PROPERTY_CHANGE_SECTION = 'SECTION';
  var PROPERTY_CHANGE_RELATED_LIST = 'RELATED_LIST';
  var PROPERTY_CHANGE_ATTACHMENTS = 'ATTACHMENTS';

  function createGlideForm(tableName, sysId, fields, uiActions, options) {
    if (!fields) {
      fields = [];
    }
    var _sysId = sysId ? sysId.toString() : '-1';
    var _fields = fields;
    var _dirtyFields = _getDirtyQueryFields(fields);
    var _formState = FORM_STATE_UNMODIFIED;
    var _userModifiedFields = {};
    var _submitAction = {
      name: DEFAULT_ACTION_NAME
    };
    var _onSubmitHandlers = [];
    var _onSubmittedHandlers = [];
    var _onChangeHandlers = [];
    var _onChangedHandlers = [];
    var _onPropertyChangeHandlers = [];
    var _onStateChangeHandlers = [];
    var _onLiveUpdatedHandlers = [];
    var _onUserChangedHandlers = [];
    var _attachmentUploadDisabled = false;
    var _options = {
      isInitialized: false,
      fieldIterator: function(f) {
        _fields.forEach(f);
      },
      getMappedField: null,
      getMappedFieldName: null,
      uiMessageHandler: null,
      encodedRecord: null,
      relatedLists: null,
      sections: null,
      viewName: '',
      document: null,
      submitPromises: false,
      reloadForm: null
    };
    var _fieldStates = {
      templateLoading: {}
    };
    var _isLiveUpdating = false;
    _options.fieldIterator(function(field) {
      field.originalValue = field.value;
    });

    function GlideForm() {
      this.hasField = function(fieldName) {
        var field = _getField(fieldName);
        return field !== null;
      };
      this.getFieldNames = function() {
        var fieldNames = [];
        _options.fieldIterator(function(field) {
          fieldNames.push(field.name);
        });
        return fieldNames;
      };
      this.setLabel = function(fieldName, label) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (field.label === label) {
          return;
        }
        field.label = label;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          fieldName,
          'label',
          label
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
        var fieldDecorations = field.decorations.slice();
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'decorations',
          fieldDecorations
        );
      };
      this.removeDecoration = function(fieldName, icon, text) {
        var field = _getField(fieldName);
        if (!field)
          return;
        if (!field.decorations || !_isArray(field.decorations)) {
          return;
        }
        var foundValue = false;
        for (var i = 0; i < field.decorations.length && !foundValue; i++) {
          var dec = field.decorations[i];
          if ((dec.icon === icon) && (dec.text === text)) {
            field.decorations.splice(i, 1);
            foundValue = true;
          }
        }
        if (foundValue) {
          var fieldDecorations = field.decorations.slice();
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'decorations',
            fieldDecorations
          );
        }
      };
      this.setFieldPlaceholder = function(fieldName, value) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (field.placeholder === value) {
          return;
        }
        field.placeholder = value;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'placeholder',
          value
        );
      };
      this.getEncodedRecord = function() {
        return _options.encodedRecord || '';
      };
      this.isMandatory = function(fieldName) {
        var field = _getField(fieldName);
        return field ? glideFormFieldFactory.isMandatory(field) : false;
      };
      this.setMandatory = function(fieldName, isMandatory) {
        var field = _getField(fieldName);
        if (!field)
          return;
        if (field.sys_mandatory) {
          return;
        }
        isMandatory = _getBoolean(isMandatory);
        if (!glideFormFieldFactory.hasValue(field) && isMandatory) {
          this.setReadonly(fieldName, false);
          this.setVisible(fieldName, true);
        } else if (field.mandatory == isMandatory) {
          return;
        } else if (!isMandatory) {
          _setInvalid(this, field, false);
        }
        field.mandatory = isMandatory;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'mandatory',
          isMandatory
        );
      };
      this.isReadOnly = function(fieldName) {
        var field = _getField(fieldName);
        return field ? glideFormFieldFactory.isReadonly(field) : false;
      };
      this.setReadOnly = function(fieldName, readonly) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        if (field.sys_readonly) {
          return;
        }
        var readOnly = _getBoolean(readonly);
        if (readOnly && glideFormFieldFactory.isMandatory(field) && !glideFormFieldFactory.hasValue(field)) {
          return;
        }
        if (field.readonly === readOnly) {
          return;
        }
        field.readonly = readOnly;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'readonly',
          readOnly
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
        if (glideFormFieldFactory.isMandatory(field) && !glideFormFieldFactory.hasValue(field)) {
          return;
        }
        var isVisible = _getBoolean(isVisible);
        if (field.visible === isVisible) {
          return;
        }
        field.visible = isVisible;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'visible',
          isVisible
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
      this.getControl = function(name) {
        var field = _getField(name);
        if (field === null) {
          return null;
        }
        return new GlideFormControl(this, name, field.type);
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
          var optionStack = field.optionStack.slice();
          this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'optionStack',
            optionStack
          );
        }
      };
      this.clearOptions = function(fieldName) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        _addToOptionStack(field, 'clear');
        var optionStack = field.optionStack.slice();
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'optionStack',
          optionStack
        );
      };
      this.removeOption = function(fieldName, choiceValue) {
        var field = _getField(fieldName);
        if (!field) {
          return;
        }
        _addToOptionStack(field, 'remove', choiceValue);
        var optionStack = field.optionStack.slice();
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          field.name,
          'optionStack',
          optionStack
        );
      };
      this.hideRelatedList = function(listTableName) {
        var list = _getRelatedList(listTableName);
        if (!list) {
          return;
        }
        if (list.visible === false) {
          return;
        }
        list.visible = false;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_RELATED_LIST,
          listTableName,
          'visible',
          false
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
        if (list.visible === true) {
          return;
        }
        list.visible = true;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_RELATED_LIST,
          listTableName,
          'visible',
          true
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
        var display = !!display;
        if (section.visible === display) {
          return;
        }
        section.visible = display;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_SECTION,
          sectionName,
          'visible',
          display
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
      this.addWarningMessage = function(message) {
        _fireUiMessage(this, 'warningMessage', message);
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
          default:
            type = "info";
            break;
          case 'info':
            break;
          case 'warning':
            break;
          case 'error':
          case 'warning':
            break;
        }
        field.messages.push({
          message: message,
          type: type
        });
        var fieldMessages = field.messages.slice();
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          fieldName,
          'messages',
          fieldMessages
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
        var fieldMessages = field.messages.slice();
        var hasError = false;
        for (var j = field.messages.length - 1; j >= 0; j--) {
          if (field.messages[j].type === 'error') {
            hasError = true;
          }
        }
        if (!hasError)
          _setInvalid(this, field, false);
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_FIELD,
          fieldName,
          'messages',
          fieldMessages
        );
      };
      this.hideAllFieldMsgs = function(type) {
        switch (type) {
          default:
            return;
          case 'info':
          case 'error':
          case 'warning':
            break;
        }
        for (var i = 0; i < _fields.length; i++) {
          var msgs = _fields[i].messages;
          if (!msgs || !_isArray(msgs)) {
            continue;
          }
          for (var j = msgs.length - 1; j >= 0; j--) {
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
        if (uiActions && uiActions.getActiveActionName) {
          var activeUiAction = uiActions.getActiveActionName();
          if (activeUiAction !== DEFAULT_ACTION_NAME)
            return activeUiAction;
        }
        return _submitAction.name || DEFAULT_ACTION_NAME;
      };
      this.reload = function() {
        if (_options.reloadForm)
          _options.reloadForm();
        else
          _logWarn('UNSUPPORTED', 'g_form.reload is not supported on mobile or service portal.');
      };
      this.save = function() {
        var saveActionName = SAVE_ACTION_NAME;
        if (uiActions && uiActions.getSaveActionName) {
          saveActionName = uiActions.getSaveActionName();
        }
        return this.submit(saveActionName);
      };
      this.submit = function(submitActionName) {
        var formDocument = _options.document ? _options.document : document;
        var activeElement = formDocument.activeElement;
        if (activeElement) {
          activeElement.blur();
        }
        if (!_submitAction.sysId || _submitAction.name !== submitActionName) {
          this.$private.userState.setRunningAction(submitActionName || SUBMIT_ACTION_NAME);
        }
        if (!this.$private.validateForm(_submitAction.name)) {
          this.$private.userState.resetRunningAction();
          return _options.submitPromises ? Promise.reject(false) : false;
        }
        var uiAction = _getUIAction(_submitAction.sysId || _submitAction.name);
        if (!uiAction) {
          this.$private.userState.resetRunningAction();
          return _options.submitPromises ? Promise.reject(false) : false;
        }
        var g_form = this;
        var promise = null;
        if (uiActions.submit) {
          promise = uiActions.submit(uiAction.sysId, {
            skipValidation: true
          });
        } else {
          promise = uiAction.execute(this);
        }
        return promise.then(function() {
          g_form.$private.userState.clearModifiedFields();
          g_form.$private.events.stateChange(FORM_STATE_SAVED);
          g_form.$private.userState.resetRunningAction();
        }).catch(function() {
          g_form.$private.userState.resetRunningAction();
        });
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
      this.setUserValue = function(fieldName, value, displayValue) {
        var field = _getField(fieldName);
        _setValue(this, field, value, displayValue, {
          isUserModified: true
        });
        this.$private.events.userChangeValue(field, value);
      };
      this.isUserModified = function() {
        return Object.keys(_userModifiedFields).length !== 0;
      };
      this.isLiveUpdating = function() {
        return _isLiveUpdating;
      };
      this.enableAttachments = function() {
        if (!_options.attachments) {
          return;
        }
        _options.attachments.canCreate = true;
        _attachmentUploadDisabled = false;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_ATTACHMENTS,
          'attachments',
          'canCreate',
          true
        );
      };
      this.disableAttachments = function() {
        if (!_options.attachments) {
          return;
        }
        _options.attachments.canCreate = false;
        _attachmentUploadDisabled = true;
        this.$private.events.propertyChange(
          PROPERTY_CHANGE_ATTACHMENTS,
          'attachments',
          'canCreate',
          false
        );
      };
      this.isAttachmentUploadDisabled = function() {
        return _attachmentUploadDisabled;
      };
      this.getEditableFields = function() {
        var editableFields = [];
        _fields.forEach(function(field) {
          if (_isEditableField(field)) {
            editableFields.push(field.name);
          }
        });
        return editableFields;
      };
      this.isEditableField = function(fieldName) {
        var field = _getField(fieldName);
        return _isEditableField(field);
      };
      var _this = this;
      this.insertContentAtCursor = function(fieldName, content) {
        var field = _getField(fieldName);
        if (!field)
          return;
        var element = document.querySelectorAll("input[name='" + field.ed.name + "']")[0];
        var cursorLocation = element ? element.selectionStart : 0;
        if (!cursorLocation)
          cursorLocation = 0;
        var originalContent = this.getValue(fieldName);
        var newContent = originalContent.substr(0, cursorLocation) + content + originalContent.substr(cursorLocation);
        this.setValue(fieldName, newContent);
      };
      this.onUserChangeValue = function(handler) {
        this.$private.events.on(EVENT_ON_USER_CHANGE_VALUE, handler);
        return function() {
          var index = _onUserChangedHandlers.indexOf(handler);
          if (index > -1)
            _onUserChangedHandlers.splice(index, 1);
        };
      };
      this.$private = {
        isDirty: function() {
          return Object.keys(_dirtyFields).length > 0;
        },
        options: function(options) {
          if (!options) {
            return;
          }
          if (typeof options === 'string') {
            return _options[options];
          }
          if (_options.isInitialized) {
            throw 'Cannot override options';
          }
          Object.keys(options).forEach(function(optionName) {
            _options[optionName] = options[optionName];
          });
          if (options.fieldIterator) {
            _options.fieldIterator(function(field) {
              field.originalValue = field.value;
            });
          }
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
              case EVENT_STATE_CHANGE:
              case EVENT_ON_STATE_CHANGE:
                _onStateChangeHandlers.push(fn);
                break;
              case EVENT_LIVE_UPDATED:
              case EVENT_ON_LIVE_UPDATED:
                _onLiveUpdatedHandlers.push(fn);
                break;
              case EVENT_USER_CHANGE_VALUE:
              case EVENT_ON_USER_CHANGE_VALUE:
                _onUserChangedHandlers.push(fn);
                break;
              default:
                throw 'Unsupported GlideForm event: ' + eventName;
            }
          },
          propertyChange: function(type, name, propertyName, propertyValue) {
            if (_onPropertyChangeHandlers.length == 0) {
              return;
            }
            switch (type) {
              default:
                type = PROPERTY_CHANGE_FIELD;
              case PROPERTY_CHANGE_FIELD:
              case PROPERTY_CHANGE_SECTION:
              case PROPERTY_CHANGE_RELATED_LIST:
              case PROPERTY_CHANGE_ATTACHMENTS:
                break;
            }
            _onPropertyChangeHandlers.forEach(function(fn) {
              fn.call(
                fn,
                type,
                name,
                propertyName,
                propertyValue
              );
            });
          },
          userChangeValue: function(field, value) {
            if (_onUserChangedHandlers.length == 0 || field.originalValue === value) {
              return;
            }
            _onUserChangedHandlers.forEach(function(fn) {
              fn.call(fn, field.name, field.originalValue, value);
            });
          },
          liveUpdated: function() {
            if (_onLiveUpdatedHandlers.length > 0) {
              var liveUpdatedFields = [];
              for (var i = 0, iM = _fields.length; i < iM; i++) {
                var field = _fields[i];
                if (field.liveUpdate) {
                  liveUpdatedFields.push(field.name || field.variable_name);
                }
              }
              _onLiveUpdatedHandlers.forEach(function(fn) {
                fn.call(fn, liveUpdatedFields);
              });
            }
          },
          stateChange: function(state) {
            if (state === _formState) {
              return;
            }
            var previousState = _formState;
            _formState = state;
            if (_onStateChangeHandlers.length == 0) {
              return;
            }
            _onStateChangeHandlers.forEach(function(fn) {
              fn.call(
                fn,
                previousState,
                _formState
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
              case EVENT_STATE_CHANGE:
              case EVENT_ON_STATE_CHANGE:
                _onStateChangeHandlers = [];
                break;
              case EVENT_LIVE_UPDATED:
              case EVENT_ON_LIVE_UPDATED:
                _onLiveUpdatedHandlers = [];
                break;
              case EVENT_USER_CHANGE_VALUE:
              case EVENT_ON_USER_CHANGE_VALUE:
                _onUserChangedHandlers = [];
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
            _onStateChangeHandlers = [];
            _onLiveUpdatedHandlers = [];
            _onUserChangedHandlers = [];
          }
        },
        userState: {
          setRunningAction: function(name, sysId) {
            if (sysId && !name) {
              name = sysId;
            }
            _submitAction = {
              name: name,
              sysId: sysId
            };
          },
          resetRunningAction: function() {
            _submitAction = {
              name: DEFAULT_ACTION_NAME
            };
          },
          clearModifiedFields: function() {
            _userModifiedFields = {};
          },
          getCurrentState: function() {
            return _formState;
          }
        },
        fieldState: {
          isTemplateLoading: function(fieldName) {
            return _fieldStates.templateLoading[fieldName] || false;
          },
          setTemplateLoading: function(fieldName, bool) {
            _fieldStates.templateLoading[fieldName] = bool;
          },
          applyTemplateValue: function(fieldName, value, displayValue) {
            _fieldStates.templateLoading[fieldName] = true;
            _this.setUserValue(fieldName, value, displayValue);
            delete _fieldStates.templateLoading[fieldName];
          }
        },
        validateForm: function(submitActionName) {
          if (_hasMandatoryFields(_this) && !_hasFieldErrors(_this)) {
            if (_runSubmitScripts(submitActionName)) {
              return true;
            }
            _hasFieldErrors(_this);
          }
          return false;
        },
        applyLiveUpdate: function(updatedRecord, updatedBy) {
          _isLiveUpdating = true;
          Object.keys(updatedRecord).forEach(function(fieldName) {
            var displayValue = updatedRecord[fieldName].display_value;
            var value = updatedRecord[fieldName].value;
            var displayString = updatedRecord[fieldName].display_string;
            var field = _getField(fieldName);
            if (!field) {
              return;
            }
            var isUserModified = !!_userModifiedFields[fieldName];
            if (isUserModified && value === _userModifiedFields[fieldName].newValue && field.liveUpdate) {
              field.liveUpdate = undefined;
            } else if (field.value !== value) {
              var liveUpdate = {
                isUserModified: isUserModified,
                updatedBy: updatedBy,
                value: value,
                displayValue: displayValue
              };
              if (displayString)
                liveUpdate.displayString = displayString;
              field.originalValue = value;
              field.liveUpdate = liveUpdate;
            }
            if (!isUserModified && field.value !== value) {
              _setValue(_this, field, value, displayValue, {
                fromLiveUpdate: true
              });
            }
            _this.$private.events.propertyChange(
              PROPERTY_CHANGE_FIELD,
              fieldName,
              'liveUpdate',
              liveUpdate
            );
          });
          _isLiveUpdating = false;
          _this.$private.events.liveUpdated();
        },
        clearOptionStack: function(fieldName) {
          _clearOptionStack(fieldName);
          _this.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            fieldName,
            'optionStack',
            []
          );
        },
        setFieldInvalid: function(fieldName, isInvalid) {
          var field = _getField(fieldName);
          if (!field)
            return;
          return _setInvalid(_this, field, isInvalid);
        }
      };
    }
    var _valueCalls = 0;

    function _setValueGlideList(field, oldValue, g_form, displayValue) {
      if (field.value.indexOf("/") > -1 && !displayValue) {
        displayValue = field.value;
      }
      if (Array.isArray(displayValue)) {
        field.display_value_list = displayValue;
        var newValue = field.value;
        field.value = oldValue;
        _setValue(g_form, field, newValue, displayValue.join(', '), {
          skipDerivedFieldUpdate: true,
          skipDisplayValueUpdate: true
        });
        return;
      } else if (displayValue && field.value.split(',').length == displayValue.split(',').length) {
        field.display_value_list = displayValue.split(',');
        var newValue = field.value;
        field.value = oldValue;
        _setValue(g_form, field, newValue, displayValue, {
          skipDerivedFieldUpdate: true,
          skipDisplayValueUpdate: true
        });
        return;
      }
      field.displayValue = '';
      field.display_value_list = [];
      var table = _getReferenceTable(field);
      var glideRequest = glideFormFactory.glideRequest;
      var requestUri = '/api/now/ui/glide/list/element/display/' + table + '/' + field.value;
      glideRequest.get(requestUri).then(function(response) {
        var result = response && response.data ? response.data.result : null;
        var values = [];
        var displayValues = [];
        if (result) {
          for (var i in result) {
            values.push(result[i].sys_id);
            displayValues.push(result[i].display);
          }
        }
        field.value = oldValue;
        field.display_value_list = displayValues;
        _setValue(g_form, field, values.join(','), displayValues.join(','), {
          skipDerivedFieldUpdate: true,
          skipDisplayValueUpdate: true
        });
      });
    }

    function _setValue(g_form, field, value, displayValue, options) {
      if (!field || (field.value === value)) {
        return;
      }
      if (_isLiveUpdating && (!options || !options.fromLiveUpdate))
        return;
      var skipDerivedFieldUpdate = false;
      var skipDisplayValueUpdate = false;
      var isUserModified = false;
      if (options) {
        skipDerivedFieldUpdate = !!options.skipDerivedFieldUpdate;
        skipDisplayValueUpdate = !!options.skipDisplayValueUpdate;
        isUserModified = !!options.isUserModified;
      }
      var oldValue = field.value;
      if (oldValue !== value) {
        _dirtyFields[field.name] = true;
        if (isUserModified) {
          var userSetValue = _userModifiedFields[field.name];
          if (typeof userSetValue === 'undefined') {
            _userModifiedFields[field.name] = {
              initialValue: oldValue,
              newValue: value
            };
          } else if (userSetValue.initialValue !== value) {
            userSetValue.newValue = value;
          } else {
            delete _userModifiedFields[field.name];
          }
        }
        g_form.hideFieldMsg(field.name, true);
      }
      if (field.mandatory) {
        if (glideFormFieldFactory.hasValue(field, value)) {
          _setInvalid(g_form, field, false);
        } else {
          _setInvalid(g_form, field, true);
        }
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
            _setValue(g_form, field, value, displayValue, {
              skipDerivedFieldUpdate: true,
              skipDisplayValueUpdate: true
            });
          });
          return;
        }
      } else if (field.type == 'glide_list') {
        if (!glideFormFieldFactory.hasValue(field))
          field.display_value_list = [];
        else if (!skipDisplayValueUpdate) {
          if (!displayValue)
            _setValueGlideList(field, oldValue, g_form);
          else {
            if (!Array.isArray(displayValue))
              _logWarn('g_form.setValue(field, value, displayValue)', 'When using setValue with a glide_list element: displayValue should be an array of display values.');
            _setValueGlideList(field, oldValue, g_form, displayValue);
          }
          return;
        }
      } else if (field.type === 'choice') {
        if (field.choices && displayValue === undefined) {
          var items = field.choices.items || field.choices;
          var valueStr = String(value);
          items.forEach(function(choice) {
            if (String(choice.value) === valueStr) {
              displayValue = choice.displayValue || choice.label;
            }
          });
        }
      }
      field.displayValue = typeof displayValue !== 'undefined' && displayValue != null ? displayValue : value;
      var fields = _getDependentFields(field.name);
      fields.forEach(function(field) {
        var changed = false;
        if (field.dependentValue !== value) {
          field.dependentValue = value;
          changed = true;
        }
        if (field.ed && field.ed.dependent_value !== value) {
          field.ed.dependent_value = value;
          changed = true;
        }
        if (changed) {
          g_form.$private.events.propertyChange(
            PROPERTY_CHANGE_FIELD,
            field.name,
            'dependentValue',
            value
          );
        }
      });
      if (oldValue !== value) {
        _fireValueChange(g_form, field, value);
      }
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
        if (list.relationship_id && list.relationship_id === listTableName) {
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

    function _fireValueChange(g_form, field, value) {
      if (_onChangeHandlers.length > 0) {
        _valueCalls++;
        _onChangeHandlers.forEach(function(fn) {
          fn.call(fn, field.name, field.originalValue, value);
        });
        _valueCalls--;
      }
      if (_options.getMappedFieldName) {
        var mappedName = _options.getMappedFieldName(field.name);
        _valueCalls++;
        _onChangeHandlers.forEach(function(fn) {
          fn.call(fn, mappedName, field.originalValue, value);
        });
        _valueCalls--;
      }
      if (_valueCalls === 0) {
        g_form.$private.events.stateChange(g_form.isUserModified() ? FORM_STATE_MODIFIED : FORM_STATE_UNMODIFIED);
        if (_onChangedHandlers.length > 0) {
          _onChangedHandlers.forEach(function(fn) {
            fn.call(fn);
          });
        }
      }
    }

    function _updateDerivedFields(g_form, originatingField) {
      var derivedFields = _getDerivedFields(originatingField.name);
      if (!glideFormFieldFactory.hasValue(originatingField)) {
        derivedFields.forEach(function(field) {
          _setValue(g_form, field, '', null, {
            skipDerivedFieldUpdate: true
          });
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
            _setValue(g_form, field, newFieldValues.value, newFieldValues.display_value, {
              skipDerivedFieldUpdate: true,
              skipDisplayValueUpdate: true
            });
          });
        }
      });
    }

    function _getField(fieldName) {
      if (!fieldName) return null;
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
        if (typeof value == 'undefined')
          value = label;
        for (var i = field.optionStack.length - 1; i >= 0; i--) {
          if (field.optionStack[i].value === value) {
            if (field.optionStack[i].operation === 'add') {
              return false;
            }
            break;
          }
        }
      }
      var optionOper = {
        operation: operation,
        label: label,
        value: value,
        index: index
      };
      if (operation === 'clear') {
        field.optionStack.splice(0, field.optionStack.length, optionOper);
      } else {
        field.optionStack.push(optionOper);
      }
      return true;
    }

    function _clearOptionStack(fieldName) {
      var field = _getField(fieldName);
      if (!field) {
        return;
      }
      if (!field.optionStack) {
        field.optionStack = [];
        return;
      }
      field.optionStack.splice(0);
    }

    function _hasMandatoryFields(g_form) {
      var emptyMandatoryFields = [];
      _options.fieldIterator(function(f) {
        if (!glideFormFieldFactory.isMandatory(f)) {
          return;
        }
        if (!glideFormFieldFactory.hasValue(f)) {
          emptyMandatoryFields.push(f.label);
          _setInvalid(g_form, f, true);
        } else {
          _setInvalid(g_form, f, false);
        }
      });
      if (emptyMandatoryFields.length === 0) {
        return true;
      }
      var mandatoryFieldMsg = _getMessage('MANDATORY_MESSAGE', 'The following mandatory fields are not filled in') + ':';
      if (typeof g_mandatory_field_msg !== "undefined") {
        mandatoryFieldMsg = g_mandatory_field_msg;
      }
      var message = mandatoryFieldMsg + "\n\n" + emptyMandatoryFields.join("\n");
      _fireUiMessage(g_form, 'mandatoryMessage', message);
      return false;
    }

    function _getMessage(key, defaultText) {
      if (_options.messages) {
        return _options.messages[key];
      }
      return defaultText;
    }

    function _hasFieldErrors(g_form) {
      var errorFields = [];
      _options.fieldIterator(function(f) {
        if (f.isInvalid === true) {
          errorFields.push(f.label);
        }
      });
      if (errorFields.length === 0) {
        return false;
      }
      var errorFieldMsg = _getMessage('FIELD_ERROR_MESSAGE', 'The following fields contain errors') + ':';
      if (typeof g_field_error_msg !== "undefined") {
        errorFieldMsg = g_field_error_msg;
      }
      var message = errorFieldMsg + "\n\n" + errorFields.join("\n");
      _fireUiMessage(g_form, 'errorMessage', message);
      return true;
    }

    function _runSubmitScripts(submitActionName) {
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
          fn.call(fn, submitActionName);
        });
      }
      return true;
    }

    function _getUIAction(name) {
      if (!uiActions) {
        return false;
      }
      var action = uiActions.getActionByName(name);
      if (!action) {
        _logWarn('NOACTION', 'Could not find UI Action: ' + name);
      }
      return action;
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
      if (typeof referenceTable === 'undefined') {
        referenceTable = field.reference;
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

    function _setInvalid(g_form, field, invalid) {
      var prevInvalid = !!field.isInvalid;
      if (prevInvalid === invalid) {
        return;
      }
      field.isInvalid = invalid;
      g_form.$private.events.propertyChange(
        PROPERTY_CHANGE_FIELD,
        field.name,
        'isInvalid',
        field.isInvalid
      );
    }
    var instance = new GlideForm();
    if (options) {
      instance.$private.options(options);
    }
    _deprecate(instance, [
      'flash',
      'getElement',
      'getFormElement',
      'getSections'
    ]);
    return instance;
  }

  function GlideFormControl(g_form, name, type) {
    this.g_form = g_form;
    this.name = name;
    this.options = [];
    this.type = type;
    this.focus = function() {
      _logWarn('NO:FOC', 'Focus not implemented for ' + this.name);
    };
    Object.defineProperty(this, 'value', {
      get: function() {
        return this.g_form.getValue(this.name);
      },
      set: function(val) {
        this.g_form.setValue(this.name, val);
      }
    });
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

  function _isEditableField(field) {
    if (!field) {
      return false;
    }
    if (!field.visible) {
      return false;
    }
    if (glideFormFieldFactory.isReadonly(field)) {
      return false;
    }
    return true;
  }
})(window, window.document || {}, window.glideFormFieldFactory);;