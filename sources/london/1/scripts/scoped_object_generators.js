/*! RESOURCE: /scripts/scoped_object_generators.js */
function ScopedGlideAjaxGenerator(scope) {
  var ScopedGlideAjax = function() {
    ScopedGlideAjax.prototype.initialize.apply(this, arguments);
  };
  ScopedGlideAjax.prototype = classExtendForScope({}, window.GlideAjax.prototype, {
    scope: scope,
    initialize: function(endpoint, url) {
      GlideAjax.prototype.initialize.call(this, endpoint, url);
      this.setScope(this.scope);
    },
    getXMLWait: function() {
      var err_options = {
        text: "Access to getXMLWait is not available in scoped applications.",
        type: "system",
        attributes: {
          type: "error"
        }
      };
      notifyFromWrappedScopedObject(err_options);
    },
    setScope: function(newScope) {
      if (newScope != this.scope && newScope !== "global") {
        var err_options = {
          text: "Scoped applications cannot impersonate other scopes.",
          type: "system",
          attributes: {
            type: "error"
          }
        };
        notifyFromWrappedScopedObject(err_options);
        return;
      }
      return GlideAjax.prototype.setScope.call(this, scope);
    },
    addParam: function(param, value) {
      if (param == "sysparm_scope" && value != this.scope && value != "global") {
        var err_options = {
          text: "Scoped applications cannot impersonate other scopes.",
          type: "system",
          attributes: {
            type: "error"
          }
        };
        notifyFromWrappedScopedObject(err_options);
        return;
      }
      return window.GlideAjax.prototype.addParam.call(this, param, value);
    }
  })
  return ScopedGlideAjax;
}

function ScopedGFormGenerator(scope) {
  var ScopedGForm = function() {};
  if ("undefined" == typeof g_form) {
    return ScopedGForm;
  }
  if ("global" == scope) {
    return g_form;
  }
  ScopedGForm.prototype = g_form;
  var scoped_g_form = new ScopedGForm();

  function inScope(fieldName) {
    try {
      if (scope == g_form.getGlideUIElement(fieldName).getScope())
        return true;
      if (g_form.getGlideUIElement(fieldName).isInherited && (scope == g_form.getScope()))
        return true;
    } catch (e) {
      jslog(e);
    }
    return false;
  }

  function _noCallbackError(displayName, fieldName) {
    var text = displayName + " for " + fieldName + " not allowed: missing callback function as parameter";
    var err_options = {
      text: text,
      type: "system",
      attributes: {
        type: "error"
      }
    }
    notifyFromWrappedScopedObject(err_options);
  }

  function _showScopeError(displayName, fieldName, value) {
    var text = displayName + " " + value + " not set on field " + fieldName + ": cross-scope access denied.";
    var err_options = {
      text: text,
      type: "system",
      attributes: {
        type: "error"
      }
    }
    opticsLog(scoped_g_form.getTableName(), fieldName, text);
    notifyFromWrappedScopedObject(err_options);
  }

  function validField(fieldName) {
    fieldName = g_form.removeCurrentPrefix(fieldName);
    return g_form.hasField(fieldName) || g_form.getPrefixHandler(fieldName);
  }
  scoped_g_form.setReadOnly = function(fieldName, disabled) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setReadOnly(fieldName, disabled);
    _showScopeError("ReadOnly", fieldName, disabled);
  }
  scoped_g_form.setReadonly = function(fieldName, disabled) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setReadonly(fieldName, disabled);
    _showScopeError("ReadOnly", fieldName, disabled);
  }
  scoped_g_form.setMandatory = function(fieldName, mandatory) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setMandatory(fieldName, mandatory);
    _showScopeError("Mandatory", fieldName, mandatory);
  }
  scoped_g_form.setDisplay = function(fieldName, display) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setDisplay(fieldName, display);
    _showScopeError("Display", fieldName, display);
  }
  scoped_g_form.setDisabled = function(fieldName, disabled) {
    if (!validField(fieldName))
      return;
    if (inScope(fieldName))
      return g_form.setDisabled(fieldName, disabled);
    _showScopeError("Disabled", fieldName, disabled);
  }
  scoped_g_form.getReference = function(fieldName, callBack) {
    if (!validField(fieldName))
      return;
    if ('function' == typeof callBack)
      return g_form.getReference(fieldName, callBack);
    _noCallbackError("getReference", fieldName, false);
  }
  return scoped_g_form;
}

function ScopedGlideDialogWindowGenerator(scope) {
  var extendFrom = window.GlideDialogWindow ? GlideDialogWindow.prototype : GlideModal.prototype;
  var ScopedGlideDialogWindow = function() {
    ScopedGlideDialogWindow.prototype.initialize.apply(this, arguments);
  };
  ScopedGlideDialogWindow.prototype = classExtendForScope({}, extendFrom, {
    scope: scope,
    initialize: function(id, readOnly, width, height) {
      extendFrom.initialize.call(this, id, readOnly, width, height);
      this.setScope(this.scope);
    }
  });
  return ScopedGlideDialogWindow;
}

function classExtendForScope(extended, defaults, options) {
  if (window.jQuery)
    return jQuery.extend(extended, defaults, options);
  var prop;
  for (prop in defaults) {
    extended[prop] = defaults[prop];
  }
  for (prop in options) {
    extended[prop] = options[prop];
  }
  return extended;
}

function notifyFromWrappedScopedObject(msgObject) {
  jslog(msgObject.text);
  if (typeof nowapi !== 'undefined' && nowapi && typeof nowapi.hasOwnProperty('g_notification'))
    nowapi.g_notification.show(msgObject.attributes.type, msgObject.text);
  else if (typeof GlideUI != 'undefined')
    GlideUI.get().display(new GlideUINotification(msgObject));
};