/*! RESOURCE: /scripts/scoped_object_generators.js */
function ScopedGlideAjaxGenerator(scope) {
  ScopedGlideAjax = Class.create(GlideAjax, {
    scope: scope,
    initialize: function($super, endpoint, url) {
      $super(endpoint, url);
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
      if (typeof GlideUI != 'undefined')
        GlideUI.get().fire(new GlideUINotification(err_options));
    },
    setScope: function($super, newScope) {
      if (newScope != this.scope && newScope !== "global") {
        var err_options = {
          text: "Scoped applications cannot impersonate other scopes.",
          type: "system",
          attributes: {
            type: "error"
          }
        };
        if (typeof GlideUI != 'undefined')
          GlideUI.get().fire(new GlideUINotification(err_options));
        return;
      }
      return $super(scope);
    },
    addParam: function($super, param, value) {
      if (param == "sysparm_scope" && value != this.scope && value != "global") {
        var err_options = {
          text: "Scoped applications cannot impersonate other scopes.",
          type: "system",
          attributes: {
            type: "error"
          }
        };
        if (typeof GlideUI != 'undefined')
          GlideUI.get().fire(new GlideUINotification(err_options));
        return;
      }
      return $super(param, value);
    }
  })
  return ScopedGlideAjax;
}

function ScopedGFormGenerator(scope) {
  var ScopedGForm = function() {};
  if ("undefined" == typeof g_form) {
    return ScopedGForm;
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
    jslog(text);
    if (typeof GlideUI != 'undefined')
      GlideUI.get().fire(new GlideUINotification(err_options));
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
    jslog(text);
    if (typeof GlideUI != 'undefined')
      GlideUI.get().fire(new GlideUINotification(err_options));
  }
  scoped_g_form.setReadOnly = g_form.setReadOnly.wrap(function($super, fieldName, disabled) {
    if (!g_form.hasField(fieldName))
      return;
    if (inScope(fieldName))
      return $super(fieldName, disabled);
    _showScopeError("ReadOnly", fieldName, disabled);
  });
  scoped_g_form.setReadonly = g_form.setReadonly.wrap(function($super, fieldName, disabled) {
    if (!g_form.hasField(fieldName))
      return;
    if (inScope(fieldName))
      return $super(fieldName, disabled);
    _showScopeError("ReadOnly", fieldName, disabled);
  });
  scoped_g_form.setMandatory = g_form.setMandatory.wrap(function($super, fieldName, mandatory) {
    if (!g_form.hasField(fieldName))
      return;
    if (inScope(fieldName))
      return $super(fieldName, mandatory);
    _showScopeError("Mandatory", fieldName, mandatory);
  });
  scoped_g_form.setDisplay = g_form.setDisplay.wrap(function($super, fieldName, display) {
    if (!g_form.hasField(fieldName))
      return;
    if (inScope(fieldName))
      return $super(fieldName, display);
    _showScopeError("Display", fieldName, display);
  });
  scoped_g_form.setDisabled = g_form.setDisabled.wrap(function($super, fieldName, disabled) {
    if (!g_form.hasField(fieldName))
      return;
    if (inScope(fieldName))
      return $super(fieldName, disabled);
    _showScopeError("Disabled", fieldName, disabled);
  });
  scoped_g_form.getReference = g_form.getReference.wrap(function($super, fieldName, callBack) {
    if (!g_form.hasField(fieldName))
      return;
    if ('function' == typeof callBack)
      return $super(fieldName, callBack);
    _noCallbackError("getReference", fieldName, false);
  });
  return scoped_g_form;
}

function ScopedGlideDialogWindowGenerator(scope) {
  ScopedGlideDialogWindow = Class.create(GlideDialogWindow, {
    scope: scope,
    initialize: function($super, id, readOnly, width, height) {
      $super(id, readOnly, width, height);
      this.setScope(this.scope);
    }
  })
  return ScopedGlideDialogWindow;
};