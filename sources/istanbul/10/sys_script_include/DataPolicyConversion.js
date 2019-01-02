var DataPolicyConversion = Class.create();

DataPolicyConversion.prototype = {
  initialize: function() {
  },

  convertUiPolicyToDataPolicy: function(uiPolicyGR) {
     var dataPolicyGR = new GlideRecord("sys_data_policy2");
     dataPolicyGR.setValue("active", uiPolicyGR.getValue("active"));
     dataPolicyGR.setValue("sys_domain", uiPolicyGR.getValue("sys_domain"));
     dataPolicyGR.setValue("model_table", uiPolicyGR.getValue("table"));
     dataPolicyGR.setValue("model_id", uiPolicyGR.getValue("model_id"));
     dataPolicyGR.setValue("conditions", uiPolicyGR.getValue("conditions"));
     dataPolicyGR.setValue("short_description", uiPolicyGR.getValue("short_description"));
     dataPolicyGR.setValue("description", uiPolicyGR.getValue("description"));
     dataPolicyGR.setValue("inherit", uiPolicyGR.getValue("inherit"));
     dataPolicyGR.setValue("reverse_if_false", uiPolicyGR.getValue("reverse_if_false"));
     dataPolicyGR.setValue("apply_import_set", "true");
     dataPolicyGR.setValue("apply_soap", "true");
     dataPolicyGR.setValue("enforce_ui", "true");
     var sysID = dataPolicyGR.insert();

     var uiPolicyAction = this._queryUiPolicyAction(uiPolicyGR);
     while (uiPolicyAction.next()) {
        var dataPolicyRuleGR = new GlideRecord("sys_data_policy_rule");
        dataPolicyRuleGR.setValue("sys_data_policy", sysID);
        dataPolicyRuleGR.setValue("table", dataPolicyGR.getValue("model_table"));
        dataPolicyRuleGR.setValue("field", uiPolicyAction.getValue("field"));
        dataPolicyRuleGR.setValue("mandatory", uiPolicyAction.getValue("mandatory"));
        dataPolicyRuleGR.setValue("disabled", uiPolicyAction.getValue("disabled"));
        dataPolicyRuleGR.insert();
     }

     if (uiPolicyGR.getValue("active")) {
        uiPolicyGR.setValue("active", false);
        uiPolicyGR.update();
     }
     return dataPolicyGR;
  },

  // determine whether conversion to Data Policy is allowed.  If any actions set visibility, it is not allowed.
  isConversionToDataPolicyAllowed: function(uiPolicyGR) {
     if (uiPolicyGR.getRecordClassName() != "sys_ui_policy") // we don't want catalog UI policy, etc.
        return false;

     var uiPolicyAction = this._queryUiPolicyAction(uiPolicyGR);
     while (uiPolicyAction.next()) {
        var visible = uiPolicyAction.getValue("visible");
        if (visible == "true" || visible == "false")
           return false;
     }

     return true;
  },

  // set up query for UI Policy Actions for a particular UI Policy
  _queryUiPolicyAction: function(uiPolicyGR) {
     var uiPolicyAction = new GlideRecord("sys_ui_policy_action");
     uiPolicyAction.addQuery("ui_policy", uiPolicyGR.getUniqueValue());
     uiPolicyAction.query();
     return uiPolicyAction;
  },

  convertDataPolicyToUiPolicy: function(dataPolicyGR) {
     var uiPolicyGR = new GlideRecord("sys_ui_policy");
     uiPolicyGR.setValue("active", dataPolicyGR.getValue("active"));
     uiPolicyGR.setValue("sys_domain", dataPolicyGR.getValue("sys_domain"));
     uiPolicyGR.setValue("table", dataPolicyGR.getValue("model_table"));
     uiPolicyGR.setValue("conditions", dataPolicyGR.getValue("conditions"));
     uiPolicyGR.setValue("short_description", dataPolicyGR.getValue("short_description"));
     uiPolicyGR.setValue("description", dataPolicyGR.getValue("description"));
     uiPolicyGR.setValue("inherit", dataPolicyGR.getValue("inherit"));
     uiPolicyGR.setValue("reverse_if_false", dataPolicyGR.getValue("reverse_if_false"));
     var sysID = uiPolicyGR.insert();

     var dataPolicyRule = new GlideRecord("sys_data_policy_rule");
     dataPolicyRule.addQuery("sys_data_policy", dataPolicyGR.getUniqueValue());
     dataPolicyRule.query();
     while (dataPolicyRule.next()) {
        var uiPolicyActionGR = new GlideRecord("sys_ui_policy_action");
        uiPolicyActionGR.setValue("ui_policy", sysID);
        uiPolicyActionGR.setValue("table", dataPolicyRule.getValue("table"));
        uiPolicyActionGR.setValue("field", dataPolicyRule.getValue("field"));
        uiPolicyActionGR.setValue("mandatory", dataPolicyRule.getValue("mandatory"));
        uiPolicyActionGR.setValue("disabled", dataPolicyRule.getValue("disabled"));
        uiPolicyActionGR.setValue("visible", "ignore");
        uiPolicyActionGR.insert();
     }

     if (dataPolicyGR.getValue("active")) {
        dataPolicyGR.setValue("active", false);
        dataPolicyGR.update();
     }
     return uiPolicyGR;     
  }

}