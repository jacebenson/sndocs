/*! RESOURCE: /scripts/CloudApiSCClient.js */
var CloudApiSCClient = {
  _fieldsInfo: {},
  validateCatItemParameterVariables: function(ajaxProcessor, variableSysId, oldValue, newValue, isLoading, g_form) {
    if (isLoading || oldValue == newValue)
      return;
    var parameters = {};
    parameters.variableSysId = variableSysId;
    parameters.parameterValue = newValue.trim();
    this.callAjax(ajaxProcessor, "validateVariableValue", parameters, function(answer) {
      var result = JSON.parse(answer);
      result.variableSysId = "IO:" + variableSysId;
      CloudApiSCClient._fieldsInfo[result["name"]] = result;
      CloudApiSCClient.showAllFieldMessages(g_form);
    });
  },
  callAjax: function(ajaxName, methodName, parameters, callback) {
    var glideAjax = new GlideAjax(ajaxName);
    glideAjax.addParam("sysparm_name", methodName);
    if (parameters) {
      for (var name in parameters) {
        glideAjax.addParam(name, parameters[name]);
      }
    }
    if (callback) {
      glideAjax.getXMLAnswer(callback);
    } else {
      glideAjax.getXMLWait();
      return glideAjax.getAnswer();
    }
  },
  beforeSubmitCloudRsrcTemplate: function(g_form) {
    if (this.isFormValid())
      return true;
    var msg = "Please correct errors to submit order";
    g_form.addErrorMessage(msg);
    this.showAllFieldMessages(g_form);
    return false;
  },
  isFormValid: function() {
    if (!this._fieldsInfo)
      return true;
    for (var name in this._fieldsInfo) {
      if (!this._fieldsInfo[name].isValid)
        return false;
    }
    return true;
  },
  showAllFieldMessages: function(g_form) {
    g_form.hideAllFieldMsgs("error");
    g_form.hideAllFieldMsgs("error");
    g_form.clearMessages();
    for (var name in this._fieldsInfo) {
      var fieldInfo = this._fieldsInfo[name];
      if (fieldInfo.message.length > 0) {
        for (var i = 0; i < fieldInfo.message.length; i++) {
          g_form.showFieldMsg(fieldInfo.variableSysId, fieldInfo.message[i], fieldInfo.msgtype);
        }
      }
    }
  }
};;